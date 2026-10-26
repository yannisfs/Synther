// Prerender the static routes of the Synther SPA to real HTML files in dist/.
//
// Runs after `vite build` and before `wrangler pages deploy`. The dist/
// directory is served locally on a free port, a headless Chromium visits
// each route, waits for React to mount and the page's useEffect to set the
// title, then captures `document.documentElement.outerHTML` and writes it
// to `dist/<route>/index.html`.
//
// What this script does NOT do:
//   - It does not strip the React hydration <script> tags. They are kept
//     so the deployed page continues to be a working SPA.
//   - It does not modify the existing <title> / <meta> tags — pages already
//     set their own per-route metadata in useEffect (see CapabilityPage's
//     canonical + JSON-LD injection at lines 67-123), and the script
//     captures whatever the page produced.
//   - It does not run a real SEO parser; it sanity-checks the captured HTML
//     for <h1>, <title>, and the description meta, and fails loud if any
//     page is missing them.
//
// Two browser-side overrides matter for capture quality:
//   - prefers-reduced-motion: reduce  → useReveal's IntersectionObserver
//     short-circuits and adds .is-visible to every reveal element
//     immediately, AND the corresponding CSS removes the translateY
//     transform. Without this, captured HTML would have opacity-0 divs.
//   - window.location.origin → rewrote to BASE_URL (default
//     https://synther.eu) in a post-mount DOM pass so CapabilityPage's
//     useEffect that injects <link rel="canonical"> writes the production
//     origin instead of the localhost preview server's. Note: trying to
//     Object.defineProperty(window, 'location', ...) in
//     evaluateOnNewDocument silently fails — `location` is a non-
//     configurable host accessor on Window in modern Chrome, so the
//     reassignment was a no-op and the captured canonical had the
//     localhost origin. The post-mount pass is the reliable fix.

import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

// Read the route list from the same source of truth as the React app's nav
// data — src/data/content.js. The `/` home route and the 4 standalone
// pages (imprint, cookies, help) are static; the 6 discipline IDs come
// from `offerings`.
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const { offerings } = await import(
  path.join(__dirname, '..', 'src', 'data', 'content.js')
)

const ROUTES = [
  '/',
  ...offerings.map((o) => `/disciplines/${o.id}`),
  '/imprint',
  '/cookies',
  '/help',
  // S01: prerendered to dist/404.html (not a directory) so Cloudflare
  // Pages serves it with a real HTTP 404 status for unknown URLs.
  '/404',
]

const BASE_URL = process.env.BASE_URL || 'https://synther.eu'
const DIST_DIR = path.join(__dirname, '..', 'dist')
const PORT = Number(process.env.PRERENDER_PORT) || 4173

// Tiny static file server for the dist/ directory. Mirrors what `wrangler
// pages dev` does for a build output, but with no Workers runtime, no
// _redirects evaluation, and no _headers. We just need the prerendered
// JS + CSS bundles to load over HTTP so React can hydrate.
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.woff2':'font/woff2',
  '.ico':  'image/x-icon',
}

const startServer = () =>
  new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        // Resolve URL → dist file. Default to index.html for directory
        // requests so React Router's history navigation works during the
        // first page load.
        const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
        let filePath = path.join(DIST_DIR, urlPath)
        let stat
        try {
          stat = await fs.stat(filePath)
        } catch {
          // SPA fallback: unknown path → serve the shell index.html
          filePath = path.join(DIST_DIR, 'index.html')
          stat = await fs.stat(filePath)
        }
        if (stat.isDirectory()) {
          filePath = path.join(filePath, 'index.html')
        }
        const ext = path.extname(filePath).toLowerCase()
        const body = await fs.readFile(filePath)
        res.writeHead(200, {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Cache-Control': 'no-store',
        })
        res.end(body)
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end(`Server error: ${err.message}`)
      }
    })
    server.listen(PORT, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({ server, port })
    })
  })

// Write `html` to dist/<route>/index.html. For the root route, overwrite
// the existing dist/index.html in place (no need to move it to
// dist/index/index.html — Cloudflare Pages serves index.html for /).
const writeRoute = async (route, html) => {
  if (route === '/') {
    await fs.writeFile(path.join(DIST_DIR, 'index.html'), html)
    return path.join(DIST_DIR, 'index.html')
  }
  // S01: Cloudflare Pages serves `404.html` from the output root with a
  // real HTTP 404 status. It must be a flat file, not a directory.
  if (route === '/404') {
    await fs.writeFile(path.join(DIST_DIR, '404.html'), html)
    return path.join(DIST_DIR, '404.html')
  }
  const dir = path.join(DIST_DIR, route)
  await fs.mkdir(dir, { recursive: true })
  const target = path.join(dir, 'index.html')
  await fs.writeFile(target, html)
  return target
}

// Sanity-check the captured HTML. A page that didn't render will fail one
// of these — fail loud, don't ship a broken page to production.
const assertRenders = (route, html) => {
  const checks = [
    [/<h1[\s>]/i.test(html),            'no <h1> in DOM'],
    [html.includes('<title>'),          'no <title> tag'],
    [(html.match(/<title>([^<]+)<\/title>/) || [])[1]?.length > 5,
                                          '<title> is empty or too short'],
    [html.includes('Synther'),          'no "Synther" content'],
    [/<meta\s+name="description"/i.test(html) || route === '/',
                                          'no <meta name="description">'],
  ]
  const failures = checks.filter(([ok]) => !ok).map(([, msg]) => msg)
  if (failures.length > 0) {
    throw new Error(
      `Prerender sanity check failed for ${route}:\n  - ${failures.join('\n  - ')}`
    )
  }
}

const main = async () => {
  console.log(`[prerender] routes: ${ROUTES.length}`)
  console.log(`[prerender] base url (for canonical + JSON-LD): ${BASE_URL}`)

  const { server, port } = await startServer()
  console.log(`[prerender] serving dist/ on http://127.0.0.1:${port}`)

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  let failed = 0
  try {
    for (const route of ROUTES) {
      const page = await browser.newPage()
      try {
        // Force-reduced-motion so useReveal's IntersectionObserver
        // short-circuits and adds .is-visible to every reveal element
        // immediately, AND the corresponding CSS removes the translateY
        // transform. Captured HTML has visible content, not opacity-0.
        await page.emulateMediaFeatures([
          { name: 'prefers-reduced-motion', value: 'reduce' },
        ])

        // Inject the real production origin so CapabilityPage's useEffect
        // (lines 67-123) writes the canonical and Service JSON-LD with
        // BASE_URL instead of http://127.0.0.1:<port>. We can't do this
        // via evaluateOnNewDocument because window.location is a non-
        // configurable host accessor in modern Chrome and a redefine
        // silently no-ops. Instead, do a post-mount DOM rewrite of any
        // canonical <link> that captured the localhost origin.
        await page.evaluateOnNewDocument((origin) => {
          // Best-effort: try to set window.location.origin directly. On
          // Location objects, .origin is a writable string property in
          // most engines, so this takes effect before any user code runs.
          try {
            // eslint-disable-next-line no-undef
            window.location.origin = origin
          } catch {
            // If the engine refuses the assignment, the post-mount pass
            // below will fix the captured HTML.
          }
        }, BASE_URL)

        const url = `http://127.0.0.1:${port}${route}`
        // networkidle0 waits for the lazy Three.js chunk (only on /) to
        // finish loading. Times out at 30 s if a network blip stalls the
        // bundle fetch.
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

        // Wait for the per-page useEffect to set document.title. The home
        // route's DocumentTitle also satisfies this. This is the strongest
        // signal that React has mounted and the page's metadata is in
        // place.
        await page.waitForFunction(
          'document.title && document.title.length > 5',
          { timeout: 10000 }
        )

        // Extra safety: confirm an h1 or h2 is in the rendered DOM. The
        // CookiePage renders a section without an h1 (it has only H2s),
        // so we accept either. CapabilityPage's notFound path renders
        // the h2 "Discipline not found", so the route succeeds.
        await page.waitForSelector('h1, h2', { timeout: 10000 })

        // Post-mount origin rewrite. The page's own SEO effect (see
        // src/hooks/usePageSeo.js) injects <link rel="canonical"> and
        // <meta property="og:url"> built from window.location.origin — if
        // the engine didn't honor the pre-document assignment above, those
        // will still point at the preview server. Rewrite them to
        // BASE_URL + path.
        //
        // S36: the path is trailing-slashed. Cloudflare Pages serves
        // /disciplines/<id>/ and 308-redirects the slashless form, so a
        // canonical without the slash advertises a redirect on every page.
        // /404 has no canonical — it isn't a real URL — so leave it alone.
        await page.evaluate((origin, routePath) => {
          try {
            const path =
              routePath === '/' || routePath === '/404'
                ? routePath
                : routePath.endsWith('/')
                  ? routePath
                  : `${routePath}/`
            if (path !== '/404') {
              const canonical = document.querySelector('link[rel="canonical"]')
              if (canonical) canonical.setAttribute('href', `${origin}${path}`)
              const ogUrl = document.querySelector('meta[property="og:url"]')
              if (ogUrl) ogUrl.setAttribute('content', `${origin}${path}`)
            }
          } catch (err) {
            // Non-fatal — the page will still render.
            console.error('[prerender] post-mount origin rewrite failed', err)
          }
        }, BASE_URL, route)

        // Give the page a moment to flush any final useEffect-driven
        // meta-injection (CapabilityPage appends <link rel="canonical">
        // and a <script type="application/ld+json"> in its useEffect).
        await new Promise((r) => setTimeout(r, 150))

        const html = await page.content()
        assertRenders(route, html)

        const target = await writeRoute(route, html)
        const size = (await fs.stat(target)).size
        console.log(`  ✓ ${route}  →  ${path.relative(DIST_DIR, target)}  (${size} B)`)
      } catch (err) {
        failed++
        console.error(`  ✗ ${route}  →  ${err.message}`)
      } finally {
        await page.close()
      }
    }
  } finally {
    await browser.close()
    server.close()
  }

  if (failed > 0) {
    console.error(`[prerender] ${failed} route(s) failed`)
    process.exit(1)
  }
  console.log(`[prerender] ${ROUTES.length} route(s) prerendered to ${path.relative(process.cwd(), DIST_DIR)}`)
}

main().catch((err) => {
  console.error('[prerender] fatal:', err)
  process.exit(1)
})
