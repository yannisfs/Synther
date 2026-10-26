// Build-time prerender pipeline.
//
// For every route in scripts/seo-config.mjs:
//   1. Launch a headless Chromium via playwright-core.
//   2. Set localStorage.i18nextLng = 'de' so the i18n detector picks DE
//      on first paint (matches our <html lang="de"> default).
//   3. Navigate to the route via `vite preview`.
//   4. Wait for the React app to mount (h1 visible) plus a 500ms settle.
//   5. Capture the full DOM, splice per-route <head> meta in, write to
//      dist/<route>/index.html (directory-per-route — Cloudflare Pages
//      serves /capabilities/ from dist/capabilities/index.html).
//
// Also writes a static dist/404.html with the SPA shell + noindex for
// unmatched URLs.

import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

import { ROUTES, buildRouteMeta, SITE } from './seo-config.mjs';
import { injectHeadIntoHtml, forceHtmlLang } from './head-inject.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

function log(msg) {
  console.log(`[prerender] ${msg}`);
}

function startVitePreview() {
  log(`spawning vite preview on :${PREVIEW_PORT}…`);
  const proc = spawn(
    'npx',
    ['vite', 'preview', '--port', String(PREVIEW_PORT), '--strictPort'],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  proc.stdout.on('data', (b) => process.stderr.write(`[vite] ${b}`));
  proc.stderr.on('data', (b) => process.stderr.write(`[vite] ${b}`));
  return proc;
}

async function waitForPreview(timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(PREVIEW_URL);
      if (res.ok) return;
    } catch {
      // Not ready yet.
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`vite preview did not start within ${timeoutMs}ms`);
}

async function prerenderRoute(context, route) {
  const meta = buildRouteMeta(route);
  const url = `${PREVIEW_URL}${route.path === '/' ? '/' : route.path}`;

  log(`prerendering ${route.path} → ${route.outFile}`);

  const page = await context.newPage();

  // Block any accidental form POST to the contact API.
  await page.route('**/api/contact', (r) => r.abort());

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.waitForSelector('h1', { state: 'visible', timeout: 10_000 });
    // 500ms settle so any in-page effects (DocumentTitle, HreflangTags) finish.
    await page.waitForTimeout(500);

    // Force <html lang="de"> for legal pages and crawlability consistency.
    await page.evaluate(() => {
      document.documentElement.setAttribute('lang', 'de');
    });

    const html = await page.content();
    const withHeader = injectHeadIntoHtml(html, meta);
    const finalHtml = forceHtmlLang(withHeader, 'de');

    const outPath = resolve(DIST, route.outFile);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, finalHtml, 'utf8');

    log(`  ✓ wrote ${route.outFile} (${(finalHtml.length / 1024).toFixed(1)} KB)`);
  } finally {
    await page.close();
  }
}

async function write404() {
  const src = resolve(DIST, 'index.html');
  const dst = resolve(DIST, '404.html');
  if (!existsSync(src)) {
    log('  ! dist/index.html missing, skipping 404.html');
    return;
  }
  let html = await readFile(src, 'utf8');
  // Inject noindex robots meta right before </head>.
  // Just enough for crawlers to drop 404 URLs.
  if (!/name="robots"/i.test(html)) {
    html = html.replace(
      /<\/head>/i,
      '    <meta name="robots" content="noindex, nofollow">\n  </head>',
    );
  }
  await writeFile(dst, html, 'utf8');
  log(`  ✓ wrote 404.html (${(html.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  if (!existsSync(DIST)) {
    throw new Error(`dist/ not found. Run \`npm run build:vite\` first.`);
  }

  const preview = startVitePreview();
  try {
    await waitForPreview();

    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({
        // All crawlers see DE by default. The EN version is a client-side swap.
        viewport: { width: 1280, height: 800 },
        extraHTTPHeaders: { 'Accept-Language': 'de-DE,de;q=0.9,en;q=0.5' },
      });

      // Set localStorage for every page in this context. We use addInitScript
      // so it applies before i18next's LanguageDetector runs.
      await context.addInitScript(() => {
        try {
          localStorage.setItem('i18nextLng', 'de');
        } catch {}
      });

      for (const route of ROUTES) {
        await prerenderRoute(context, route);
      }

      await write404();
    } finally {
      await browser.close();
    }

    log(`prerender complete — origin ${SITE.origin}`);
  } finally {
    preview.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error('[prerender] FAILED:', err);
  process.exit(1);
});
