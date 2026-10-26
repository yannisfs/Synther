// Cloudflare Pages Function — GET /api/admin/contacts
//
// Auth: this route is protected by Cloudflare Access at the edge. Access
// injects `Cf-Access-Jwt-Assertion` and `Cf-Access-Authenticated-User-Email`
// headers only when the user has been approved. The Function trusts those
// headers — they cannot be spoofed because Access strips them from any
// request it didn't approve.
//
// For local dev (`wrangler pages dev`), set a Pages secret:
//     echo "local" | wrangler pages secret put DEV_ADMIN_TOKEN --project-name riviera-engineering
// then call with `?dev=local` to bypass Access (only works in `wrangler dev`).

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

const isAuthorized = (request, env) => {
  // Cloudflare Access — production path
  const accessUser = request.headers.get('cf-access-authenticated-user-email');
  if (accessUser) return { who: accessUser, via: 'access' };

  // Dev bypass — only works locally with DEV_ADMIN_TOKEN set
  if (env.DEV_ADMIN_TOKEN && env.ENVIRONMENT === 'dev') {
    const url = new URL(request.url);
    if (url.searchParams.get('dev') === env.DEV_ADMIN_TOKEN) {
      return { who: 'dev', via: 'dev-bypass' };
    }
  }

  return null;
};

export const onRequestGet = async ({ request, env }) => {
  const auth = isAuthorized(request, env);
  if (!auth) {
    return json(
      { ok: false, error: 'Unauthorized. This endpoint is protected by Cloudflare Access.' },
      401
    );
  }

  const url = new URL(request.url);
  const page     = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '25', 10)));
  const search   = (url.searchParams.get('q') || '').trim();
  const offset   = (page - 1) * pageSize;

  const { DB } = env;
  if (!DB) return json({ ok: false, error: 'D1 binding is not configured.' }, 500);

  const where = search
    ? `WHERE name LIKE ?1 OR email LIKE ?1`
    : '';
  const like = `%${search}%`;

  // Run the count and the page in one round-trip
  const [countRow, pageRows] = await Promise.all([
    DB.prepare(`SELECT COUNT(*) AS n FROM contacts ${where}`).bind(...(search ? [like] : [])).first(),
    DB.prepare(
      `SELECT id, name, email, project, message, ip, created_at
         FROM contacts
         ${where}
         ORDER BY id DESC
         LIMIT ? OFFSET ?`
    ).bind(...(search ? [like, pageSize, offset] : [pageSize, offset])).all(),
  ]);

  return json({
    ok: true,
    page,
    pageSize,
    total: countRow?.n ?? 0,
    items: pageRows?.results ?? [],
    viewer: auth.who,
  });
};

export const onRequestPost = () => json({ ok: false, error: 'Method not allowed.' }, 405);
