# Riviera Engineering — Cloudflare Pages + D1

A React (Vite) landing page deployed on **Cloudflare Pages** with a **D1**-backed contact form.

```
.
├── functions/api/contact.js   ← Cloudflare Pages Function: POST /api/contact
├── migrations/0001_init.sql   ← D1 schema (contacts + rate-limit log)
├── wrangler.toml              ← Pages + D1 binding config
├── src/                       ← Vite + React source
└── dist/                      ← Build output (gitignored)
```

## Local development

```bash
npm install
npm run dev               # Vite on :5173 (no API — form will fail)
```

To run with the live contact API and local D1, in two terminals:

```bash
# Terminal 1 — build the static site once (Pages serves from `dist/`)
npm run build

# Terminal 2 — Pages dev server with D1 binding + Functions
npm run cf:dev            # wrangler pages dev dist --d1=DB --port 8788
```

Open http://localhost:8788/ — this is where form submissions actually work.

## One-time setup (per Cloudflare account)

```bash
# 1. Authenticate
npx wrangler login

# 2. Create the D1 database
npm run cf:db:create
# → copy the printed `database_id` into wrangler.toml (replaces REPLACE_AFTER_WRANGLER_D1_CREATE)

# 3. Apply migrations to local D1
npm run cf:db:migrate:local

# 4. Apply migrations to remote D1
npm run cf:db:migrate:remote
```

To inspect submissions:

```bash
npx wrangler d1 execute riviera-contacts --remote \
  --command "SELECT id, name, email, project, created_at FROM contacts ORDER BY id DESC LIMIT 25;"
```

## Deploy

```bash
npm run build
npm run cf:deploy        # wrangler pages deploy dist --project-name riviera-engineering
```

First deploy creates the Pages project. Subsequent deploys are atomic.

## Spam protection

- **Honeypot** field `hp` in the form (hidden off-screen + `tabIndex={-1}`). If filled, the Function silently returns 200 and writes nothing.
- **Per-IP rate limit** via `contact_rate_limits` table — default is **3 submissions per 10 minutes per IP**, configurable in `wrangler.toml` under `[vars]`.

Adjust `RATE_LIMIT_WINDOW_MINUTES` and `RATE_LIMIT_MAX` if you need tighter/looser limits.

## Environment variables

| Var | Default | Purpose |
|---|---|---|
| `RATE_LIMIT_WINDOW_MINUTES` | 10 | Rate-limit window |
| `RATE_LIMIT_MAX`           | 3  | Max submissions per IP per window |

These live in `[vars]` in `wrangler.toml`. Override per environment with the Cloudflare dashboard or `wrangler pages secret put`.

## API contract

`POST /api/contact` — JSON body `{ name, email, project, message, hp }`

| Field    | Required | Notes |
|---|---|---|
| `name`   | yes | max 120 chars |
| `email`  | yes | basic format check, max 200 chars |
| `project`| no  | max 80 chars |
| `message`| yes | max 4000 chars |
| `hp`     | no  | honeypot — must be empty |

Returns `{ ok: true }` on success or `{ ok: false, error: "..." }` with status 400 / 429 / 500.

---

## Admin page — `/admin` and `/api/admin/contacts`

Read-only view of all submissions, protected by **Cloudflare Access**.

### One-time Cloudflare Access setup

1. Go to **Cloudflare Zero Trust** → **Access** → **Applications** → **Add an application** → **Self-hosted**
2. Configure:
   - **Name**: `Riviera Admin`
   - **Application domain**: `riviera-engineering.pages.dev`
   - **Path**: `/admin*` and `/api/admin/*` (add both — one for the page, one for the API)
3. **Identity providers**: enable one-time email (default) or Google / GitHub / etc.
4. **Policies**: create a policy called `Admins`
   - **Action**: Allow
   - **Include**: emails of everyone who should have access
   - For read-only accounts, create a separate policy with a `ReadOnly` group
5. Save. Cloudflare will email each address a one-time login code the first time they visit `/admin`.

### How auth works at the edge

Cloudflare Access sits in front of `/admin*` and `/api/admin/*`. When a request is approved, Access injects two headers that the Function trusts:

- `Cf-Access-Jwt-Assertion` (signed JWT)
- `Cf-Access-Authenticated-User-Email` (the approved email)

Access strips these headers from any request it didn't approve, so they cannot be forged. The Function checks `Cf-Access-Authenticated-User-Email` and 401s if it's missing.

### Local dev bypass

When running `wrangler pages dev` locally, Access isn't in the path. To test the admin UI locally:

```bash
echo "local" | wrangler pages secret put DEV_ADMIN_TOKEN
# Then in dev, append ?dev=local to any /api/admin/contacts request
```

The dev bypass only activates when `ENVIRONMENT === 'dev'`, which `wrangler pages dev` sets automatically. Production will never honour this token.

### Adding / removing admins

Cloudflare Access → Applications → Riviera Admin → Policies → Admins → edit the email list. Changes take effect immediately — no redeploy needed.

For read-only accounts: create a second policy `ReadOnly` with the read-only emails, leave the action as Allow. (Access currently does not differentiate read vs write for the same route — if you need true read-only at the API level, contact me and I'll add a `Viewer` group + role check.)
