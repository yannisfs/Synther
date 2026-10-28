# Research section — repo notes (Task 1 survey)

Surveyed 28 Oct 2026 against the working tree. Every path below was read, not
inferred. Where the implementation plan assumed something different, the
difference is called out in "Where the plan had to bend".

---

## 1. Router

- **Library:** `react-router-dom` 7.18.4 (`src/App.jsx`).
- **Definition:** `src/App.jsx` — one `<BrowserRouter>` with `<Routes>`.
  Routes are declared inline in `App.jsx`; there is no route config file.
- **Discipline pages:** `<Route path="/disciplines/:id" element={<CapabilityPage />} />`
  (`src/App.jsx:23`). The page reads the slug with `useParams()` and looks it
  up in the `offerings` array in `src/data/content.js` — a slug that matches no
  offering renders the "Discipline not found" block, not a 404.
- **Standalone pages:** `/imprint`, `/cookies`, `/help` — each its own page
  component under `src/pages/`.
- **Catch-all:** `<Route path="*" element={<NotFoundPage />} />` (`src/App.jsx:37`)
  covers client-side navigation to an unknown path.
- **Trailing slashes:** the router paths are slashless (`/disciplines/:id`),
  but Cloudflare Pages serves `/disciplines/<id>/` and 308-redirects the
  slashless form. The canonical/og:url therefore carry the trailing slash
  (`src/hooks/usePageSeo.js`, `withSlash()`).

## 2. Prerendering

- **Script:** `npm run prerender` → `scripts/prerender.mjs` (custom, Puppeteer).
  Not vite-plugin-ssr, not vike, not react-snap.
- **How it works:** the script serves `dist/` from a throwaway static server on
  port 4173 (`PRERENDER_PORT`), opens headless Chromium per route, waits for
  `document.title` and for an `h1`/`h2` to exist, rewrites `canonical` / `og:url`
  to the production origin (`BASE_URL`, default `https://synther.eu`), captures
  `document.documentElement.outerHTML` and writes it to `dist/<route>/index.html`.
  `/404` is written to the flat `dist/404.html` so Pages answers unknown URLs
  with a real HTTP 404.
- **Route list:** a literal `ROUTES` array at `scripts/prerender.mjs:50-59`. The
  discipline part is derived from `offerings` in `src/data/content.js`, which the
  script imports directly with `await import()`.
- **Sanity check:** `assertRenders()` (`scripts/prerender.mjs:145`) fails the
  build if a captured page has no `<h1>`, no `<title>`, no "Synther" or no
  description meta.
- **Critical constraint:** `public/_redirects` has **no** SPA fallback
  (`/* /index.html 200` was removed in S01). Every real route must therefore
  have its own prerendered HTML file, or the edge answers 404.
- **Deploy chain:** `npm run deploy` = `npm run build` → `npm run prerender` →
  `npx wrangler pages deploy dist --project-name=synther --branch=main
  --commit-dirty=true`. A new route is only live once it is in `ROUTES`.

## 3. Head tags

- **No helmet.** Head management is custom:
  - `src/hooks/usePageSeo.js` — owns `<link rel="canonical">`, `og:url`,
    `og:title`, `og:description`, `twitter:*` and the plain
    `<meta name="description">`. It writes into `document.head` in a
    `useEffect` and restores the previous values on cleanup.
  - `src/components/DocumentTitle.jsx` — owns `<title>` on the home route only.
  - Per-page `useEffect`s inject JSON-LD: `src/pages/CapabilityPage.jsx:89-158`
    creates a `<script type="application/ld+json">` element and appends it to
    `document.head`. This is the pattern to copy for `ScholarlyArticle` and
    `CollectionPage`.
- **Title convention:** `t('capabilityPage.docTitle', { name })` →
  "… · Synther". Titles are set in a `useEffect`, because `DocumentTitle` yields
  on non-home routes.

## 4. Sitemap

- **Static file:** `public/sitemap.xml`, copied verbatim into `dist/` by Vite.
  It lists the 10 current pages with trailing-slash URLs.
- `scripts/build-sitemap.mjs` runs after the Vite build and injects the
  Research URLs (`/research/` plus every published paper) into
  `dist/sitemap.xml`. The hand-maintained file stays authoritative for the
  existing pages; a new paper needs no entry there.

## 5. Cloudflare

- **Cloudflare Pages** (static assets + Pages Functions), not Workers static
  assets. `wrangler.toml` sets `pages_build_output_dir = "dist"`.
- **`public/_headers`** — cache rules for `/assets/*`, plus a strict CSP:
  `script-src 'self' 'wasm-unsafe-eval'`, `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data:`, `connect-src 'self'`. No `unsafe-inline` for scripts.
  Consequences: no inline `<script>` on the page (JSON-LD must be created as a
  DOM node, as `CapabilityPage` does), and KaTeX's inline `style` attributes are
  allowed because `style-src` has `'unsafe-inline'`.
- **`public/_redirects`** — only the legacy `/capabilities/*` → `/disciplines/*`
  301. No SPA fallback (see §2).
- **Functions:** `functions/api/*` (contact, quick-consult, consent) with a D1
  binding (`DB`). The research pages need neither.
- **Local Cloudflare emulator:** `npm run cf:dev` → `npx wrangler pages dev
  dist --d1=DB --port 8788`. This is the repo's equivalent of the plan's
  `npx wrangler pages dev dist`.

## 6. Components to reuse

| What | Where |
|---|---|
| Header / nav | `src/components/Navbar.jsx`, driven by the `nav` array in `src/data/content.js`; labels from `nav.<key>` in `src/locales/en.json` |
| Footer | `src/components/Footer.jsx` (same `nav` array) |
| Breadcrumb | inline in each page — `<nav className="capability__crumb" aria-label="Breadcrumb">` + `<ol>` (see `src/pages/CapabilityPage.jsx:179`, `src/pages/HelpPage.jsx:63`) |
| Dark hero | `<header className="capability__hero">` + `capability__hero-bg` / `-overlay` / `-content` / `-head`, `capability__title`, `capability__lead` (`src/pages/CapabilityPage.jsx:198-227`) |
| Hero fact strip | `<dl className="capability__spec">` with `capability__spec-cell` / `-label` / `-value` (same file) |
| Section heading | `<p className="eyebrow">` + `<h2 className="capability__h2">` inside `.capability__block-head` |
| Card grid | `.capability__cap-grid` → `.capability__cap` → `.capability__cap-index` / `-title` / `-text` (`src/pages/CapabilityPage.jsx:262-274`) |
| CTA block | `.capability__cta` → `.capability__cta-inner` / `-main` / `-title` / `-text`, button `.btn.btn--primary` (`src/pages/CapabilityPage.jsx:352-364`) |
| Related links | `.capability__related-grid` → `.capability__related-card` |
| Buttons | `.btn`, `.btn--primary`, `.btn--ghost`, `.btn--inverse` (`src/styles.css`) |
| Icons | `src/components/Icon.jsx` — inline SVG path map, Lucide-derived |
| Reveal on scroll | `src/hooks/useReveal.js` — returns a ref, adds `.is-visible` |
| i18n | `src/i18n/config.js`; runtime language is English only (`SUPPORTED_LANGUAGES = ['en']`); `de.json` exists only for the German legal blocks and is read through `src/lib/fixedT.js` |

## 7. Design tokens

- `src/styles.css` — the `:root` block holds every token: `--navy-900` (page
  background, white), `--navy-850` (alternate section background, `#f3f6fb`),
  `--navy-700` / `--navy-600` (hairlines), `--blue-600` (`#2d33a7`, logo blue /
  accent), `--blue-500` (`#3a5cf0`), `--grey-300` … `--grey-600` (text),
  `--white` (the **ink**, `#0c1b2a` — not white), `--on-cta` (`#ffffff`),
  `--font-sans` (Inter), `--font-mono` (JetBrains Mono), `--maxw` (1160px),
  `--gutter`, `--section-pad`, `--section-pad-sm`, `--content-inset`, `--ease`.
- `src/components.css` — every component rule (~2600 lines), including all the
  `.capability__*` classes listed above.
- Both are imported in `src/main.jsx`; there is no Tailwind and no CSS modules.

## 8. Markdown / MDX pipeline

- **None.** No `markdown`, `remark`, `rehype`, `gray-matter` or MDX dependency
  exists, and nothing in `src/` reads `.md` files.
- The plan's dependency list (`gray-matter`, `react-markdown`, `remark-gfm`,
  `remark-math`, `rehype-katex`, `katex`, `rehype-slug`) is therefore all new.
- `src/locales/en_.json` exists as an **old backup** and must not be touched.

## 9. Checks

- `bash scripts/check.sh` = `npm run build` → `vite preview` on 4173 →
  `BASE=http://localhost:4173 node scripts/verify-site.mjs`. Exits 1 on any
  FAIL. `D4_LABEL` env var runs the D4 label check. `V04` (unknown URL → 404)
  always FAILs against the SPA preview server; it passes against the hosting
  emulator. The Vite **dev** server is never used for checks.
- `scripts/verify-site.mjs` drives Puppeteer against the preview server.
- **Research checks R01–R09** live in the same harness: R01 structure and
  breadcrumb, R02 metadata + RSS link + JSON-LD, R03 no 375 px overflow,
  R04 focus ring, R05 WCAG AA contrast, R06 empty state vs. filter (depends
  on the paper count), R07 the nav link to the section, R08 the paper pages
  (skipped while no paper is published), R09 the feed's validity.

---

## Where the plan had to bend

**A. `import.meta.glob` cannot be imported from Node.** The plan has the
prerender script generate the paper routes from `getPapers()`, but
`import.meta.glob` is a Vite transform: in plain Node it is `undefined`, so
`scripts/prerender.mjs` cannot import the browser-side loader. The content
model is therefore split in two:

- `src/lib/research/parse.js` — plain ESM, Node-safe: parsing, validation,
  sorting. Imported by both sides.
- `src/lib/research.js` — the Vite side: `import.meta.glob(... ?raw, eager)`
  + `gray-matter` + the shared parser.
- `scripts/lib/research-files.mjs` — the Node side: `fs.readdir` +
  `gray-matter` + the shared parser. Used by the prerender script (route
  list) and by the feed writer.

Both sides parse with the same `gray-matter` call and validate with the same
function, so the two lists cannot disagree about what a valid paper is.

**B. "Throw a build error" happens at prerender, not at `vite build`.** Vite
bundles the app; it does not execute it, so a throw inside `getPapers()` would
first run inside the browser during `npm run prerender`. The prerender script
therefore validates the papers from the Node side *before* launching Chromium,
and fails with the file name and the field name — the same error the browser
would raise, one step earlier.

**C. Drafts.** The plan says a draft is marked with `draft: true` in the
frontmatter and is "built in dev only, never in production". The frontmatter
flag alone cannot achieve that: `import.meta.glob` inlines the file contents
at build time, so a `draft: true` paper's text would still sit in the
production bundle — not rendered, but readable by anyone who opens the JS.

The implementation therefore uses **two markers that have to agree**:

- the **folder name** starts with `_` (`src/content/research/_my-draft/`), and
- the **frontmatter** has `draft: true`.

The underscore is what the build sees without reading the file: the published
glob excludes underscore folders, and the draft glob is referenced only from a
branch guarded by `import.meta.env.DEV`. In a production build that branch is
the literal `false`, Rollup folds it away, and the draft's text *and* its
figures are dropped from the bundle (a figure is only emitted into
`dist/assets/` when something imports it). The frontmatter flag is what the
loader checks at runtime, so a draft is never rendered and never gets a
prerendered page. The shared validator rejects a mismatch in either direction,
so a draft cannot be published by accident and a published paper cannot be
silently hidden.

The Node side used by the prerender and the feed writer applies the runtime
rule: drafts are excluded unless `INCLUDE_DRAFTS=1` is set (for local checks
only).

**D. Empty-state link target.** The plan's empty state links to `#contact`.
The contact form lives on the home page (`/#contact`), so on `/research/` a
bare `#contact` would point nowhere. The link is `/#contact`.

**E. Sitemap: static file plus generated research URLs.** The plan says "follow
the existing method" — that method is a hand-maintained `public/sitemap.xml`.
`scripts/build-sitemap.mjs` keeps that file authoritative for the existing
pages and injects `/research/` plus every published paper into `dist/sitemap.xml`
at build time, so a new paper does not have to be added to the XML by hand.

**F. `gray-matter` in the browser needs a `Buffer` shim.** gray-matter calls
the global `Buffer.from()` on its input. Node has `Buffer`; the browser does
not. The shim in `src/lib/research/parse.js` hands the string back unchanged,
which is enough: the Buffer gray-matter builds is only stored as its
non-enumerable `orig` property, and the frontmatter and the body are parsed
from the string itself.

**G. The route split needed a preload, not just `React.lazy`.** The paper
page's chunk is ~459 kB (the Markdown/KaTeX toolchain) and the index page's
is ~7 kB plus a shared ~65 kB content chunk, so both stay out of the bundle
everybody downloads. `React.lazy` alone is not enough: it suspends once even
when the module is already in the module map, because `import()` resolves in a
microtask. On a direct visit to `/research/` that replaced the prerendered
page with the Suspense fallback for exactly one frame — the footer jumped
from 2526 px to 329 px and back (CLS 0.60, Lighthouse performance 76).

`src/pages/research/routes.jsx` therefore keeps the module in a cache next to
the lazy component. `src/main.jsx` awaits `preloadResearchRoute(path)` before
`createRoot().render()`; the route component then renders the cached module
directly and React never suspends. On a client-side navigation (no preload)
the lazy import runs and the fallback is shown — which is what it is for.
Measured after the change: CLS 0, no fallback frame, Lighthouse 100/100/100/100
on `/research/`.

---

## The "In progress" agenda

`src/content/research/agenda.json` holds the list; the section renders only
when the list is not empty, and the file is currently `[]` because the topics
are still to be supplied. The shape of one entry:

```json
{
  "topic": "…",              // required
  "benchmark": "…",          // required
  "status": "planned"        // planned | running | in-review (default: planned)
}
```

The file is read by both sides (`getAgenda()` in the browser,
`readAgenda()` in the Node scripts) and validated the same way.

---

## How to publish a paper

1. Create the folder `src/content/research/<slug>/` and put the paper in
   `src/content/research/<slug>/index.md`, with the frontmatter described in
   the implementation plan (§3). `slug` must equal the folder name.
2. Add figures to `src/content/research/<slug>/figures/` and reference them
   relatively (`![…](figures/name.png)`).
3. Set `draft: false` (or remove the key). A **draft** is the other way round:
   put it in a folder whose name starts with `_` (`_my-draft/`) *and* set
   `draft: true`. A draft is built in dev only — neither its text nor its
   figures reach a production build.
4. `npm run build && npm run prerender` — the paper route is added to
   `dist/research/<slug>/index.html` automatically, `dist/research/feed.xml` is
   regenerated, and the paper URL is injected into `dist/sitemap.xml`. The
   hand-maintained `public/sitemap.xml` does not need an entry.
5. `npm run deploy`.

The paper then appears on `/research/`, in the feed, and in the sitemap.

To check a draft locally:

```bash
NODE_ENV=development npx vite build --mode development   # DEV=true in the bundle
INCLUDE_DRAFTS=1 node scripts/prerender.mjs               # draft route included
```

