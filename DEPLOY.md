# Deployment — Synther (Cloudflare Pages)

Static site (React 18 + Vite 5 SPA). Build output is `dist/`. Hosted on Cloudflare Pages at:

- **Production (custom domain):** https://synther.eu
- **Pages preview subdomain:** https://synther.pages.dev
- Per-deployment preview URL: `https://<hash>.synther.pages.dev`

The Cloudflare **project name is `synther`** (the project's `wrangler.toml` says `name = "synther-gmbh"` for historical reasons — that's the wrangler-default name, NOT the Pages project name; the `--project-name=synther` flag below is what binds the deploy to the right project). Production branch is `main`.

---

## TL;DR

```bash
npm run deploy
```

That's the whole thing. The `deploy` script in `package.json` chains `build` → `prerender` → `wrangler pages deploy dist --project-name=synther --branch=main --commit-dirty=true`. Read the rest of this doc only if something goes wrong or you're setting up a new environment.

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

### Stage 1 — `npm run build` (`vite build`)

Vite produces a hashed-bundle build into `./dist/`. CSS gets a content-hash filename (`index-<hash>.css`), JS gets the same (`index-<hash>.js`, plus the lazy `HeroBackground-<hash>.js` chunk). A fresh build is required before every deploy — old dist files will have stale hashes.

### Stage 2 — `npm run prerender` (`node scripts/prerender.mjs`)

The site is a React SPA — left alone, all 10 routes (`/`, the 6 discipline pages, `/imprint`, `/cookies`, `/help`) ship the same `<div id="root">` shell and render client-side. That hurts SEO and is invisible to scrapers (including AI tools that don't run JS).

The prerender script fixes that. It:

1. Boots a tiny static file server on `127.0.0.1:4173` that serves the just-built `dist/`.
2. Launches headless Chromium via Puppeteer.
3. For each of the 10 routes, navigates to it, forces `prefers-reduced-motion: reduce` (so `useReveal`'s IntersectionObserver short-circuits and reveal elements render visible instead of `opacity: 0`), waits for the page to set its own `<title>` (the signal that React has mounted and per-route `useEffect` has run), then captures `document.documentElement.outerHTML`.
4. Sanity-checks the captured HTML for `<h1>`, a non-empty `<title>`, "Synther" content, and a `<meta name="description">` (home only). Fails loud if any page is missing them.
5. Writes the captured HTML to `dist/<route>/index.html` (overwriting `dist/index.html` for `/`).

The script also patches the post-mount `<link rel="canonical">` and `<meta property="og:url">` to use `BASE_URL` (default `https://synther.eu`) instead of the localhost origin. This works around a Chromium quirk where `Object.defineProperty(window, 'location', …)` silently no-ops in `evaluateOnNewDocument`, because `location` is a non-configurable host accessor on `Window`. The post-mount DOM rewrite is the reliable path.

Override the defaults with env vars if you need to test:
```bash
BASE_URL=https://staging.synther.eu PRERENDER_PORT=4200 npm run prerender
```

### Stage 3 — `npx wrangler pages deploy dist --project-name=synther --branch=main --commit-dirty=true`

Uploads the prerendered `dist/` to Cloudflare Pages. The flags:

- `--project-name=synther` — required. The `wrangler.toml` `name = "synther-gmbh"` is misleading; the actual Pages project is `synther`. Without this flag, wrangler prompts for a project.
- `--branch=main` — deploys to the **production** branch, so the result becomes the live `synther.eu` (and `synther.pages.dev`). Use a different branch name for a non-production preview.
- `--commit-dirty=true` — this repo is **not a git repo**, so there's no commit metadata; the flag prevents wrangler from complaining about a dirty/missing git state. Harmless if the project later becomes a git repo.
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

## First-time project creation (run ONCE)

The project `synther` was created on 2026-10-01. These steps are only needed if the project is ever deleted.

> ⚠️ **Wrangler 4.x gotcha.** `wrangler pages …` delegates to the new Workers-based Pages by default and **fails** for a pure static site with the error `Missing entry-point to Worker script or to assets directory`. To create/deploy on the classic Cloudflare Pages instead, pass `--force` **once**. Once the project exists, wrangler stops delegating and `--force` is no longer needed (and should not be used).

Create the project (one time, with `--force`):
```bash
npx wrangler pages project create synther --production-branch=main --force
```
Output confirms: *"Successfully created the 'synther' project. It will be available at https://synther.pages.dev/ once you create your first deployment."*

---

## D1 database setup (one-time)

The contact form (`POST /api/contact`) and cookie-consent receipts (`POST /api/consent`) both write to a single Cloudflare D1 database, bound as `DB`. The `wrangler.toml` `[[d1_databases]]` block already declares it; the `database_id` is the only thing you need to get right.

```bash
# 1. Verify auth.
npx wrangler whoami

# 2. Create the database. If 'synther-contacts' is already taken on this
#    account, pick another name and update both `database_name` in
#    wrangler.toml and the `wrangler d1 create …` command below.
npx wrangler d1 create synther-contacts

# 3. Paste the returned database_id into wrangler.toml, replacing the
#    REPLACE_AFTER_WRANGLER_D1_CREATE placeholder in [[d1_databases]].

# 4. Apply the migration to production D1. Reads migrations/0001_init.sql.
npx wrangler d1 migrations apply DB --remote
```

Schema (declared in `migrations/0001_init.sql`):
- `contacts` — form submissions (name, email, project, message, ip, user-agent, created_at)
- `contact_rate_limits` — per-IP throttle log (GC'd after 1 day)
- `consent_receipts` — DSGVO Art. 7 consent decisions (choice, version, timestamp, ip, user-agent)

---

## Local API testing

Pages Functions don't run under `vite dev` — they need the Pages-emulated local server:

```bash
# One-time per checkout: apply the migration to the local D1.
npx wrangler d1 migrations apply DB --local

# Start the Pages-emulated dev server (static site + Functions + local D1).
npx wrangler pages dev dist --d1=DB --port 8788
# Or, equivalently:
npm run cf:dev
```

The site runs at `http://localhost:8788`, with `/api/contact` and `/api/consent` proxied to the Functions. Inspect the local D1 with:

```bash
npx wrangler d1 execute DB --local --command "SELECT id, name, email, created_at FROM contacts ORDER BY id DESC LIMIT 5"
npx wrangler d1 execute DB --local --command "SELECT id, choice, version, timestamp FROM consent_receipts ORDER BY id DESC LIMIT 5"
```

---

## Verify a deploy

```bash
# Production custom domain should be HTTP 200:
/usr/bin/curl -sI https://synther.eu | head -3

# Home page should contain the static <title> (set in index.html, present
# in raw HTML before React mounts) and a populated <h1>:
/usr/bin/curl -s https://synther.eu | grep -oE '<title>[^<]*</title>'

# Each prerendered route should have real content (not just the SPA shell):
for path in / /imprint /cookies /help /disciplines/systems-engineering; do
  echo "$path: $(/usr/bin/curl -s "https://synther.eu$path" | grep -c 'synther\.eu')"
done

# The imprint should have the operator's name baked into the raw HTML:
/usr/bin/curl -s https://synther.eu/imprint | grep -c '<<Ihr Vor-'
# expect 0 (real data filled in) — if this is > 0, you forgot to find-and-replace
# the placeholders in src/pages/ImprintPage.private.jsx before deploy.
```

---

## Existing Cloudflare Pages projects on this account

For reference (from `npx wrangler pages project list`): `riviera-engineering`, `scalent`, `scalent-dev`, `grand-systems-react`, `grand-intelligence-react`, and `synther`.

---

## Convenience scripts (`package.json`)

```bash
npm run deploy                  # build + prerender + deploy to production
npm run prerender               # just the prerender step (after a build)
npm run build                   # just the Vite build
npm run cf:dev                  # local Pages-emulated dev server with D1
npm run cf:db:create            # one-time D1 database creation
npm run cf:db:migrate:remote    # apply migrations/0001_init.sql to production D1
npm run cf:db:migrate:local     # apply migrations/0001_init.sql to local D1
```

---

## Rollback / previews

- **Preview deploy (non-production):** deploy with a different `--branch`, e.g. `--branch=preview`. It gets a `<hash>.synther.pages.dev` URL but does not replace the production `synther.eu`.
- **Rollback:** use the Cloudflare dashboard → Pages → `synther` → Deployments, and "Rollback to this deployment" on a previous one. There is no first-class CLI rollback for classic Pages.

---

## Imprint templates — switching between private and GmbH

The site is shipping the **private-person** variant of `/imprint` while the Synther GmbH registration is still pending. Two template files exist; the active one is chosen by `src/pages/ImprintPage.jsx`, which is a one-line re-export shim:

- `src/pages/ImprintPage.private.jsx` — active now. Files the imprint under a private individual (`Yannis Fusenig`, `Ludwigstraße 4A, 63110 Rodgau, Germany`, `contact@synther.eu`). Hides rows that don't apply to a private site (Registereintrag, USt-ID, Steuernummer, § 18 MStV responsible person).
- `src/pages/ImprintPage.gmbh.jsx` — dormant. The original GmbH template, preserved byte-identical for after registration completes. The `[TODO — replace]` placeholders here are the real GmbH data the user must fill in (legal representative, register court/number, VAT ID, etc.).

**Before the post-registration flip**, the user must:
1. Fill in every `[TODO — replace]` in `src/pages/ImprintPage.private.jsx` and `src/pages/ImprintPage.gmbh.jsx` with real data — there are 8–9 fields per template.
2. Flip the shim: in `src/pages/ImprintPage.jsx`, change the last line from `export { default } from './ImprintPage.private.jsx'` to `export { default } from './ImprintPage.gmbh.jsx'`.
3. Run `npm run deploy`.

The shim approach is the entire switch — no router change, no i18n string rename, no `wrangler.toml` edit. The `App.jsx` import path `./pages/ImprintPage.jsx` is unchanged.

---

## Files that matter for the build/deploy

- `wrangler.toml` — `pages_build_output_dir = "dist"` (build output dir); `name = "synther-gmbh"` is a wrangler-default artifact and is **not** the Pages project name (see `--project-name=synther` flag above).
- `public/_headers` — security headers; copied into `dist/` by Vite, applied by Pages.
- `public/_redirects` — SPA routing (all paths → `index.html`); copied into `dist/` by Vite, applied by Pages.
- `scripts/prerender.mjs` — the Puppeteer step that turns the SPA shell into real per-route HTML.
- `dist/Synther.svg` — the logo, referenced as `/Synther.svg`; lives in `public/` so Vite copies it to the deploy root.
- `migrations/0001_init.sql` — D1 schema; applied via `wrangler d1 migrations apply DB --remote`.

---

## Quick reference (copy-paste)

```bash
# Standard production deploy:
npm run deploy

# Check auth:
npx wrangler whoami

# List projects:
npx wrangler pages project list

# Inspect production D1:
npx wrangler d1 execute DB --remote --command "SELECT id, name, email, created_at FROM contacts ORDER BY id DESC LIMIT 5"
```
