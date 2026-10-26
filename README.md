# Synther GmbH — Company Site

A sharp, scientific single-page site for Synther GmbH, built with **React + Vite**
and deployable to **Cloudflare Pages**.

- **3D hero** built with three.js / react-three-fiber — datapoints converging
  on a wireframe core, echoing the brand idea *"engineering convergence"*.
- **Design language**: dark navy, white, grey, with a luminous-red CTA.
  Telephoto / high-focal-length imagery in the work section.
- **Content**: all copy lives in `src/data/content.js` — edit one file to
  re-skin the whole page.

## Stack

- React 18 + Vite 5
- three.js + @react-three/fiber + @react-three/drei (hero only, lazy-loaded)
- Plain CSS with design tokens (`src/styles.css`, `src/components.css`)

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # outputs to ./dist
npm run preview    # preview the production build locally
```

## Deploy to Cloudflare Pages

The site is hosted on Cloudflare Pages at **https://synther.eu**. Full deploy instructions (custom-domain wiring, D1 setup, rollback, imprint template switching) are in [`DEPLOY.md`](DEPLOY.md).

**Option A — CLI:**

```bash
npm run deploy     # build + prerender + `wrangler pages deploy dist`
```

The `prerender` step uses Puppeteer to capture each of the 10 routes (home, 6 discipline pages, /imprint, /cookies, /help) as static HTML inside `dist/`, so search engines and AI scrapers see real content instead of the React hydration shell.

**Option B — Dashboard / Git integration:**

Connect the repo in the Cloudflare Pages dashboard with:

| Setting           | Value                       |
| ----------------- | --------------------------- |
| Build command     | `npm run build && npm run prerender` |
| Output directory  | `dist`                      |
| Node version      | `18` or newer               |

`public/_headers` and `public/_redirects` are copied into the build output
and applied automatically by Cloudflare Pages.

## Project structure

```
public/            static assets (logo, _headers, _redirects)
src/
  components/      Navbar, Hero, HeroBackground (three.js), About,
                   Offerings, Approach, Capabilities, Contact, Footer,
                   CookieBanner
  data/content.js  single source of truth for all copy
  hooks/useReveal.js   scroll-into-view animation
  i18n/config.js   i18next init (English UI; German resources loaded
                   only for the fixed-language imprint/cookie pages)
  lib/             cross-cutting helpers (consent, analytics, fixedT)
  locales/         en.json, de.json (the only locales loaded at runtime)
  pages/           HomePage, CapabilityPage, ImprintPage (with a
                   re-export shim that switches between .private.jsx and
                   .gmbh.jsx), CookiePage, HelpPage
  styles.css       design tokens + base
  components.css   component styles + responsive
  App.jsx, main.jsx   shell + entry
scripts/prerender.mjs   Puppeteer step that turns the SPA shell into
                        per-route static HTML inside dist/
```