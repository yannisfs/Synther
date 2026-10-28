# Synther — Company Site

The Synther site: a single-page company site for **Synther GmbH** plus a
**Research** section where papers are published. React 18 + Vite 5 SPA,
prerendered to static HTML and deployed to **Cloudflare Pages** with
Pages Functions and a D1 database.

- **3D hero** built with three.js / react-three-fiber — datapoints
  converging on a wireframe core, echoing the brand idea *"engineering
  convergence"*. The hero's background is code-split and lazy-loaded.
- **Design language**: white ground, deep slate-navy ink (`#0c1b2a`), logo
  blue (`#2d33a7`), Inter + JetBrains Mono. Every colour, font and measure
  is a CSS custom property in `src/styles.css`.
- **Research**: `/research/` lists the published papers, each paper has its
  own route, an RSS feed and a sitemap entry. Content is Markdown in the
  repository, not in the database.

Live site: **https://synther.eu**

## Routes

| Route | Source | Notes |
|---|---|---|
| `/` | `src/pages/HomePage.jsx` | One scrolling page: Hero, About, Offerings, Approach, Contact |
| `/disciplines/<id>/` | `src/pages/CapabilityPage.jsx` | Six pages, ids come from `offerings` in `src/data/content.js` |
| `/imprint/` | `src/pages/ImprintPage.jsx` | Imprint + privacy, DE and EN |
| `/cookies/` | `src/pages/CookiePage.jsx` | TDDDG / GDPR-7 cookie policy |
| `/help/` | `src/pages/HelpPage.jsx` | Urgent support and 30-minute consult |
| `/research/` | `src/pages/research/ResearchIndexPage.jsx` | Paper list, empty state, "In progress" agenda |
| `/research/<slug>/` | `src/pages/research/ResearchPaperPage.jsx` | One page per paper |
| anything else | `src/pages/NotFoundPage.jsx` | Branded 404, real HTTP 404 at the edge |

Cloudflare Pages serves the trailing-slash form and 308-redirects the
slashless one; the router paths are written without the slash, and the
canonical URLs carry it.

`public/_redirects` has **no SPA fallback**, so every real route needs its
own prerendered HTML file or the edge answers 404.

## Stack

- React 18, Vite 5, react-router-dom 7
- three.js + @react-three/fiber + @react-three/drei (hero only)
- i18next / react-i18next — runtime language is **English only**; `de.json`
  is loaded solely for the German legal blocks on the imprint and cookie
  pages
- react-markdown + remark-gfm + remark-math + rehype-katex + rehype-slug
  (research papers only), gray-matter for the frontmatter
- Plain CSS with design tokens — no Tailwind, no CSS modules
- Cloudflare Pages + Pages Functions (D1)

## Where the content lives

| What | Where |
|---|---|
| Company data, nav, discipline list | `src/data/content.js` |
| UI copy (English) | `src/locales/en.json` |
| German legal text (fixed language, never translated) | `src/locales/de.json` |
| Old backup — do not edit | `src/locales/en_.json` |
| Papers (Markdown + frontmatter + figures) | `src/content/research/<slug>/index.md` |
| Agenda topics | `src/content/research/agenda.json` |

`src/locales/de.json` holds German legal wording that must not be changed
for copy or spelling tasks.

### Publishing a paper

1. Create `src/content/research/<slug>/index.md` with the frontmatter
   described in `Plans/Synther_Research/synther_research_implementation.md`.
   The `slug` must equal the folder name.
2. Put figures in `src/content/research/<slug>/figures/` and reference them
   relatively (`figures/name.png`).
3. A **draft** goes into a folder whose name starts with `_`
   (`_my-draft/`) *and* has `draft: true` in its frontmatter. The two
   markers have to agree, and a draft's text and figures never reach a
   production build.
4. `npm run build && npm run prerender` — the route, the feed entry and
   the sitemap URL are generated automatically.
5. `npm run deploy`.

`docs/research/REPO_NOTES.md` has the full content model, the validation
rules and the reasoning behind the two-marker draft convention.

## Develop

```bash
npm install
npm run dev        # Vite dev server
```

The dev server is for looking at the site. **Never use it for checks** —
every check runs against a production build.

## Build

```bash
npm run build      # vite build → sitemap → feed   (output: ./dist)
npm run prerender  # Puppeteer: 12 routes → static HTML inside dist/
npm run preview    # serve the production build locally
```

The build is two stages. `npm run build` writes the bundle, then
`scripts/build-sitemap.mjs` injects the research URLs into
`dist/sitemap.xml` and `scripts/build-feed.mjs` writes
`dist/research/feed.xml`. `npm run prerender` then serves `dist/` on a
throwaway local server, visits every route in headless Chromium and writes
`dist/<route>/index.html` — plus a flat `dist/404.html` so unknown URLs
answer with a real HTTP 404.

With no published papers the prerender covers 12 routes (home, 6 discipline
pages, imprint, cookies, help, research, 404); every paper adds one.

## Checks

```bash
bash scripts/check.sh              # all checks
bash scripts/check.sh R01 R08      # selected checks
```

`scripts/check.sh` builds, prerenders, starts a preview server on 4173 and
runs `scripts/verify-site.mjs` — 52 checks (E00, V01–V35, W01–W07,
R01–R09) driven by Playwright. It exits 1 on any failure.

- **V04** (unknown URL → HTTP 404) always fails against the SPA preview
  server, because a preview server has no 404 document. Run the suite
  against the Cloudflare emulator to see it pass:
  `npm run cf:dev` (port 8788), then
  `BASE=http://localhost:8788 node scripts/verify-site.mjs`.
- **V22** is skipped unless `D4_LABEL` is set.
- **R08** (paper pages) is skipped while no paper is published.

## Deploy

Hosted on Cloudflare Pages at **https://synther.eu**. Full instructions —
custom domain, D1 setup, rollback, imprint template switching — are in
[`DEPLOY.md`](DEPLOY.md).

```bash
npm run deploy     # build + prerender + wrangler pages deploy dist
```

Do not deploy without an explicit go-ahead.

In the Cloudflare Pages dashboard the settings are:

| Setting | Value |
|---|---|
| Build command | `npm run build && npm run prerender` |
| Output directory | `dist` |
| Node version | 18 or newer |

`public/_headers` (cache rules + strict CSP) and `public/_redirects` are
copied into the build output and applied automatically.

### Backend

Three Pages Functions, all `POST`, all writing to D1:

| Endpoint | Purpose |
|---|---|
| `/api/contact` | Contact form |
| `/api/quick-consult` | 30-minute consult request |
| `/api/consent` | Cookie-consent receipt |

D1 tables: `contacts`, `contact_rate_limits`, `consent_receipts`,
`quick_consult_requests`. Per-IP throttles are configured through the
`RATE_LIMIT_*` / `CONSENT_RATE_LIMIT_MAX` vars in `wrangler.toml`.

Local API testing: `npm run cf:db:migrate:local` once per checkout, then
`npm run cf:dev`.

## Project structure

```
public/            static assets, _headers, _redirects, robots.txt
src/
  components/      Navbar, Hero + HeroBackground (three.js), About,
                   Offerings, Approach, Capabilities, Contact, Stats,
                   Footer, CookieBanner, Icon
  content/research/  papers as Markdown + figures, agenda.json
  data/content.js  company data, nav, offerings
  hooks/           useReveal, usePageSeo, useHomeLink
  i18n/config.js   i18next init (English UI; German for the legal pages)
  lib/             consent, analytics, fixedT, research loader + parser
  locales/         en.json, de.json (en_.json is an old backup)
  pages/           HomePage, CapabilityPage, ImprintPage (+ .private /
                   .gmbh templates), CookiePage, HelpPage, NotFoundPage,
                   research/ (index, paper, routes, research.css)
  styles.css       design tokens + base
  components.css   component styles + responsive
  App.jsx          router
  main.jsx         entry; preloads the research route before hydration
functions/api/     Pages Functions (contact, quick-consult, consent)
migrations/        D1 migrations
scripts/
  prerender.mjs    Puppeteer step: SPA shell → per-route static HTML
  build-sitemap.mjs / build-feed.mjs   post-build artefacts
  verify-site.mjs  the Playwright check suite
  check.sh         build + preview + verify
docs/research/     repo notes for the Research section
Plans/             implementation and edit plans
```

## Things worth knowing

- **The imprint has two templates.** `src/pages/ImprintPage.jsx` is a
  one-line re-export shim that points at `.private.jsx` (private person) or
  `.gmbh.jsx` (company). Switching back after the registration is done means
  editing that one line.
- **The research routes are preloaded before hydration.** `React.lazy`
  always suspends once, even when the module is already loaded, which
  replaced the prerendered research page with the fallback for a frame and
  cost a CLS of 0.60. `src/pages/research/routes.jsx` keeps the module in a
  cache; `src/main.jsx` awaits `preloadResearchRoute()` before rendering.
- **Structured data is injected as DOM nodes**, because the CSP forbids
  inline scripts. Every page that injects a JSON-LD block first removes the
  copy the prerendered HTML already carries, so a page never ships two
  identical blocks.
