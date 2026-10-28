# Deployment — Synther (Cloudflare Pages)

Static site (React 18 + Vite 5 SPA, prerendered to static HTML). Build output is `dist/`. Hosted on Cloudflare Pages at:

- **Production (custom domain):** https://synther.eu
- **Pages preview subdomain:** https://synther.pages.dev
- Per-deployment preview URL: `https://<hash>.synther.pages.dev`

The Cloudflare **project name is `synther`** (the project's `wrangler.toml` says `name = "synther-gmbh"` for historical reasons — that's the wrangler-default name, NOT the Pages project name; the `--project-name=synther` flag below is what binds the deploy to the right project). Production branch is `main`.

The repo is a git repository (remote `origin` → `https://github.com/yannisfs/Synther.git`, branch `main`). `git push` is **not** part of the deploy flow — the deploy uploads `dist/` to Cloudflare directly.

---

## TL;DR

```bash
bash scripts/check.sh   # build + prerender + run the check suite
npm run deploy          # build + prerender + wrangler pages deploy dist
```

`npm run deploy` chains `build` → `prerender` → `wrangler pages deploy dist --project-name=synther --branch=main --commit-dirty=true`. Read the rest of this doc only if something goes wrong or you're setting up a new environment.

**Never deploy without an explicit go-ahead** ("publish to prod", "deploy"). And never deploy while a check fails — see [Before deploying](#before-deploying).

---

## Prerequisites

1. **Node + npm** — install dependencies once:
   ```bash
   npm install
   ```
2. **Cloudflare authentication.** Wrangler is invoked through `npx` (not a local dev-dependency), so the latest version is downloaded on first use.
   - If `npx wrangler whoami` already lists your account + OAuth scopes, you're logged in (credentials live in the macOS keychain / `~/.wrangler`).
   - If not, run the **interactive** login yourself (it opens a browser):
     ```
     ! npx wrangler login
     ```
     (In this Claude Code session, prefix with `!` so the command runs in-session and its output lands in the conversation. Do **not** try to run `wrangler login` through the agent's Bash tool — it needs a real browser interaction.)
   - The deploy command has been seen to be denied by the auto-mode classifier on production deploys. If the Bash tool refuses, get explicit confirmation (e.g. "yes, deploy to synther.eu" or "yes, deploy to production") before retrying.

---

## The deploy pipeline (3 stages)

`npm run deploy` runs three things in order. You can run them individually if you need to debug a stage.

### Stage 1 — `npm run build` (`vite build` → sitemap → feed)

Three sub-steps, chained in the `build` script in `package.json`:

1. **`vite build`** — hashed-bundle build into `./dist/`. CSS gets a content-hash filename (`index-<hash>.css`), JS gets the same (`index-<hash>.js`, plus the lazy `HeroBackground-<hash>.js` and research chunks). A fresh build is required before every deploy — old dist files will have stale hashes.
2. **`node scripts/build-sitemap.mjs`** — writes `dist/sitemap.xml` with the site's URLs plus one entry per published paper.
3. **`node scripts/build-feed.mjs`** — writes `dist/research/feed.xml` (RSS 2.0) with the published papers.

Both scripts read the same `src/content/research/` folder the site renders from, so the feed, the sitemap and the pages cannot drift apart. Both are no-ops for the paper list when nothing is published yet.

### Stage 2 — `npm run prerender` (`node scripts/prerender.mjs`)

The site is a React SPA — left alone, every route ships the same `<div id="root">` shell and renders client-side. That hurts SEO and is invisible to scrapers (including AI tools that don't run JS).

The prerender script fixes that. It:

1. Boots a tiny static file server on `127.0.0.1:4173` that serves the just-built `dist/`.
2. Launches headless Chromium via Puppeteer.
3. For each route, navigates to it, forces `prefers-reduced-motion: reduce` (so `useReveal`'s IntersectionObserver short-circuits and reveal elements render visible instead of `opacity: 0`), waits for the page to set its own `<title>` (the signal that React has mounted and the per-route `useEffect` has run), then captures `document.documentElement.outerHTML`.
4. Sanity-checks the captured HTML for `<h1>`, a non-empty `<title>`, "Synther" content, and a `<meta name="description">` (home only). Fails loud if any page is missing them.
5. Writes the captured HTML to `dist/<route>/index.html` (overwriting `dist/index.html` for `/`) and the 404 page to the flat `dist/404.html`.

**The routes (12, plus one per published paper):**

| Route | Output file |
|---|---|
| `/` | `dist/index.html` |
| `/disciplines/<id>/` (6 pages) | `dist/disciplines/<id>/index.html` |
| `/imprint/` | `dist/imprint/index.html` |
| `/cookies/` | `dist/cookies/index.html` |
| `/help/` | `dist/help/index.html` |
| `/research/` | `dist/research/index.html` |
| `/research/<slug>/` (one per published paper) | `dist/research/<slug>/index.html` |
| anything unknown | `dist/404.html` (served with a real HTTP 404) |

Every route needs its own prerendered file: `public/_redirects` has **no SPA fallback** (see [Files that matter](#files-that-matter-for-the-builddeploy)), so a route without a file of its own answers 404 at the edge.

The script also patches the post-mount `<link rel="canonical">` and `<meta property="og:url">` to use `BASE_URL` (default `https://synther.eu`) instead of the localhost origin. This works around a Chromium quirk where `Object.defineProperty(window, 'location', …)` silently no-ops in `evaluateOnNewDocument`, because `location` is a non-configurable host accessor on `Window`. The post-mount DOM rewrite is the reliable path.

Override the defaults with env vars if you need to test:
```bash
BASE_URL=https://staging.synther.eu PRERENDER_PORT=4200 npm run prerender
```

### Stage 3 — `npx wrangler pages deploy dist --project-name=synther --branch=main --commit-dirty=true`

Uploads the prerendered `dist/` to Cloudflare Pages. The flags:

- `--project-name=synther` — required. The `wrangler.toml` `name = "synther-gmbh"` is misleading; the actual Pages project is `synther`. Without this flag, wrangler prompts for a project.
- `--branch=main` — deploys to the **production** branch, so the result becomes the live `synther.eu` (and `synther.pages.dev`). Use a different branch name for a non-production preview.
- `--commit-dirty=true` — the deploy runs with the working tree in whatever state it is; the flag tells wrangler not to complain about uncommitted changes. The repo is a git repository (remote `https://github.com/yannisfs/Synther.git`, branch `main`), but the deploy doesn't depend on its git state — the uploaded artefact is `dist/`.
- **Do not add `--force`.** The project already exists; `--force` is only for the one-time create.

Expected tail of a successful deploy:
```
✨ Success! Uploaded N files
✨ Uploading _headers
✨ Uploading _redirects
✨ Uploading Functions bundle
🌎 Deploying...
✨ Deployment complete! Take a peek over at https://<hash>.synther.pages.dev
```

The hash-suffixed URL is a one-off preview. The production URL (`https://synther.eu`) is updated within a few seconds of the same deploy.

---

## Before deploying

```bash
bash scripts/check.sh              # every check
bash scripts/check.sh V30 R02      # selected checks
```

`scripts/check.sh` builds, prerenders (on port 4174), starts a preview server on 4173 and runs `scripts/verify-site.mjs` — 52 checks (E00, V01–V35, W01–W07, R01–R09) driven by Playwright. It exits 1 on any failure.

Three results are expected and are **not** bugs:

| Check | Why |
|---|---|
| **V04** fails against the preview server | A preview server has no 404 document, so an unknown URL answers 200. Run the suite against the Pages emulator to see it pass: `npm run cf:dev` (port 8788), then `BASE=http://localhost:8788 node scripts/verify-site.mjs`. |
| **V22** skipped | Unless `D4_LABEL` is set. |
| **R08** skipped | While no paper is published. |

**V30** ("No TODO placeholders on the imprint") fails as long as the imprint still carries open placeholders — currently the commercial-register and VAT rows. See [Imprint templates](#imprint-templates--gmbh-and-private-person). It is a hard blocker: the imprint is not legally adequate while it fails.

Never edit `scripts/verify-site.mjs` or `scripts/check.sh` to make a check pass. Never use the Vite dev server for checks — every check runs against a production build.

---

## First-time project creation (run ONCE)

The project `synther` was created on 2026-10-01. These steps are only needed if the project is ever deleted.

> ⚠️ **Wrangler 4.x gotcha.** `wrangler pages …` delegates to the new Workers-based Pages by default and **fails** for a pure static site with the error `Missing entry-point to Worker script or to assets directory`. To create/deploy on the classic Cloudflare Pages instead, pass `--force` **once**. Once the project exists, wrangler stops delegating and `--force` is no longer needed (and should not be used).

Create the project (one time, with `--force`):
```bash
npx wrangler pages project create synther --production-branch=main --force
```
Output confirms: *"Successfully created the 'synther' project. It will be available at https://synther.pages.dev/ once you create your first deployment."*

### If the project builds from the GitHub repo instead

The Cloudflare dashboard's build settings for a git-connected project must match the local pipeline — the prerender is part of the build, not an extra step:

| Setting | Value |
|---|---|
| Build command | `npm run build && npm run prerender` |
| Output directory | `dist` |
| Node version | 18 or newer |
| Production branch | `main` |

---

## D1 database setup (one-time)

Three Pages Functions write to a single Cloudflare D1 database, bound as `DB`: the contact form (`POST /api/contact`), the 30-minute consult request (`POST /api/quick-consult`) and the cookie-consent receipt (`POST /api/consent`). The `wrangler.toml` `[[d1_databases]]` block already declares it; the `database_id` is the only thing you need to get right.

```bash
# 1. Verify auth.
npx wrangler whoami

# 2. Create the database. If 'synther-contacts' is already taken on this
#    account, pick another name and update both `database_name` in
#    wrangler.toml and the `wrangler d1 create …` command below.
npx wrangler d1 create synther-contacts

# 3. Paste the returned database_id into wrangler.toml, replacing the
#    REPLACE_AFTER_WRANGLER_D1_CREATE placeholder in [[d1_databases]].

# 4. Apply the migrations to production D1. All three files, in order.
npx wrangler d1 migrations apply DB --remote
```

Schema (three migrations in `migrations/`, applied in filename order):

| Migration | Table | Holds |
|---|---|---|
| `0001_init.sql` | `contacts` | form submissions (name, email, project, message, ip, user-agent, created_at) |
| `0001_init.sql` | `contact_rate_limits` | per-IP throttle log (GC'd after 1 day) |
| `0001_init.sql` | `consent_receipts` | DSGVO Art. 7 consent decisions (choice, version, timestamp, ip, user-agent) |
| `0002_quick_consult.sql` | `quick_consult_requests` | 30-minute consult requests (name, email, situation, preferred_time, ip, user_agent, created_at) |
| `0003_quick_consult_contact_fields.sql` | — | adds `callback_phone` and `company_system` to `quick_consult_requests` (the urgent-ticket fields) |

`wrangler d1 migrations apply` runs every pending migration in order and records them in the `d1_migrations` table, so it is safe to re-run.

---

## Local API testing

Pages Functions don't run under `vite dev` — they need the Pages-emulated local server:

```bash
# One-time per checkout: apply the migrations to the local D1.
npx wrangler d1 migrations apply DB --local

# Start the Pages-emulated dev server (static site + Functions + local D1).
npx wrangler pages dev dist --d1=DB --port 8788
# Or, equivalently:
npm run cf:dev
```

The site runs at `http://localhost:8788`, with `/api/contact`, `/api/quick-consult` and `/api/consent` proxied to the Functions. Inspect the local D1 with:

```bash
npx wrangler d1 execute DB --local --command "SELECT id, name, email, created_at FROM contacts ORDER BY id DESC LIMIT 5"
npx wrangler d1 execute DB --local --command "SELECT id, choice, version, timestamp FROM consent_receipts ORDER BY id DESC LIMIT 5"
npx wrangler d1 execute DB --local --command "SELECT id, name, email, situation, preferred_time, created_at FROM quick_consult_requests ORDER BY id DESC LIMIT 5"
```

The emulator is also the only place where the 404 behaviour is realistic — use it for the V04 check.

---

## Verify a deploy

```bash
# Production custom domain should be HTTP 200:
/usr/bin/curl -sI https://synther.eu | head -3

# Home page should contain the static <title> (set in index.html, present
# in raw HTML before React mounts) and a populated <h1>:
/usr/bin/curl -s https://synther.eu | grep -oE '<title>[^<]*</title>'

# Each prerendered route should have real content (not just the SPA shell):
for path in / /imprint /cookies /help /research /disciplines/systems-engineering; do
  echo "$path: $(/usr/bin/curl -s "https://synther.eu$path" | grep -c 'synther\.eu')"
done

# The research artefacts are deployed as static files:
/usr/bin/curl -sI https://synther.eu/research/feed.xml | head -2
/usr/bin/curl -s https://synther.eu/sitemap.xml | grep -c '<url>'

# An unknown URL must answer with a real 404, not the homepage:
/usr/bin/curl -sI https://synther.eu/this-page-does-not-exist-xyz | head -1
# expect: HTTP/2 404

# The imprint must not carry open placeholders:
/usr/bin/curl -s https://synther.eu/imprint | grep -c 'TODO'
# expect 0 — if this is > 0, the register/VAT data is still missing and
# V30 fails; see the imprint section below.
```

---

## Existing Cloudflare Pages projects on this account

For reference (from `npx wrangler pages project list`): `riviera-engineering`, `scalent`, `scalent-dev`, `grand-systems-react`, `grand-intelligence-react`, and `synther`.

---

## Convenience scripts (`package.json`)

```bash
npm run deploy                  # build + prerender + deploy to production
npm run build                   # vite build + sitemap + feed
npm run prerender               # just the prerender step (after a build)
npm run preview                 # serve the production build locally
npm run cf:dev                  # local Pages-emulated dev server with D1
npm run cf:db:create            # one-time D1 database creation
npm run cf:db:migrate:remote    # apply the migrations to production D1
npm run cf:db:migrate:local     # apply the migrations to local D1
bash scripts/check.sh           # build + prerender + the whole check suite
```

---

## Rollback / previews

- **Preview deploy (non-production):** deploy with a different `--branch`, e.g. `--branch=preview`. It gets a `<hash>.synther.pages.dev` URL but does not replace the production `synther.eu`.
- **Rollback:** use the Cloudflare dashboard → Pages → `synther` → Deployments, and "Rollback to this deployment" on a previous one. There is no first-class CLI rollback for classic Pages.

---

## Imprint templates — GmbH and private person

`/imprint` exists as two template files next to each other. The active one is chosen by `src/pages/ImprintPage.jsx`, which is a one-line re-export shim:

- `src/pages/ImprintPage.gmbh.jsx` — **active now.** Files the imprint under the Synther GmbH: provider `Synther GmbH`, postal address, `contact@synther.eu`, the managing director as the representative and as the person responsible under § 18 (2) MStV. The provider, address, email and representative are read from `src/data/content.js` (`legalIdentity` / `company`), so the footer, the structured data and the imprint can never disagree about who runs the site.
- `src/pages/ImprintPage.private.jsx` — the fallback. Files the imprint under a private individual and hides the rows that don't apply to a private site (Registereintrag, USt-ID, Steuernummer, § 18 MStV). It was the active template while the registration was pending.

**The GmbH imprint is not deployable yet.** Four rows are still open, and they cannot be guessed:

| Field | Where |
|---|---|
| Registergericht (commercial-register court) | `REGISTER_COURT` in `src/pages/ImprintPage.gmbh.jsx` |
| Registernummer (register number) | `REGISTER_NUMBER` in the same file |
| Umsatzsteuer-ID (§ 27a UStG) | `VAT_ID` in the same file |
| Steuernummer / Wirtschafts-ID (optional) | `TAX_NUMBER` in the same file |

Fill a constant in and the row shows the value; delete the row and its entry in the TODO callout to drop it. The callout disappears on its own once the last one is closed, and V30 goes green.

Two more values the owner has to confirm (not placeholders, but not verifiable from the repo):

- **`company.phone`** — `null` today, so no phone row is rendered. A GmbH imprint is expected to publish a reachable phone number; set it in `src/data/content.js` and the imprint, the footer and the contact sidebar all pick it up.
- **`legalIdentity.address`** — the address the site has been publishing (`Ludwigstraße 4A, 63110 Rodgau, Germany`). If the registered business address (Geschäftsanschrift) differs, change it there once: the footer, the structured data and the imprint follow.

**To go back to the private-person imprint:** restore the three `Person` values in `legalIdentity` (`src/data/content.js`) and change the last line of `src/pages/ImprintPage.jsx` to `export { default } from './ImprintPage.private.jsx'`.

The shim approach is the entire switch — no router change, no i18n string rename, no `wrangler.toml` edit. The `App.jsx` import path `./pages/ImprintPage.jsx` is unchanged.

---

## Files that matter for the build/deploy

- `wrangler.toml` — `pages_build_output_dir = "dist"` (build output dir); `name = "synther-gmbh"` is a wrangler-default artifact and is **not** the Pages project name (see `--project-name=synther` flag above). The `[vars]` block carries the rate limits for the Functions.
- `public/_headers` — security headers (strict CSP, `X-Content-Type-Options`, `Referrer-Policy`, …) and the cache rules; copied into `dist/` by Vite, applied by Pages. The CSP forbids inline scripts, which is why the JSON-LD blocks are injected as DOM nodes.
- `public/_redirects` — **no SPA fallback.** It holds one rule: the legacy `/capabilities/*` → `/disciplines/:splat` 301. The catch-all `/* /index.html 200` was deliberately removed so unknown URLs answer with a real 404; every real route has its own prerendered file instead.
- `public/robots.txt` — copied into `dist/`; points at the sitemap.
- `scripts/prerender.mjs` — the Puppeteer step that turns the SPA shell into real per-route HTML (and writes `dist/404.html`).
- `scripts/build-sitemap.mjs` / `scripts/build-feed.mjs` — the post-build sitemap and RSS feed.
- `scripts/verify-site.mjs` + `scripts/check.sh` — the check suite (52 checks) and its runner.
- `src/content/research/` — the papers (Markdown + frontmatter + figures) and `agenda.json`. They are the source for the research pages, the feed, the sitemap and the prerender route list; a paper published here needs no other change.
- `src/data/content.js` — the company identity (`company`, `legalIdentity`), the nav and the discipline list.
- `dist/Synther.svg` — the logo, referenced as `/Synther.svg`; lives in `public/` so Vite copies it to the deploy root.
- `migrations/0001_init.sql`, `0002_quick_consult.sql`, `0003_quick_consult_contact_fields.sql` — the D1 schema; applied via `wrangler d1 migrations apply DB --remote`.

---

## Quick reference (copy-paste)

```bash
# Check everything, then deploy:
bash scripts/check.sh
npm run deploy

# Check auth:
npx wrangler whoami

# List projects:
npx wrangler pages project list

# Inspect production D1:
npx wrangler d1 execute DB --remote --command "SELECT id, name, email, created_at FROM contacts ORDER BY id DESC LIMIT 5"
npx wrangler d1 execute DB --remote --command "SELECT id, name, email, situation, preferred_time, created_at FROM quick_consult_requests ORDER BY id DESC LIMIT 5"
```
