// Cloudflare Pages Function — POST /api/consent
//
// Records the user's cookie-consent decision in D1 for the DSGVO Art. 7 (1)
// documentation requirement. The schema version is enforced server-side; a
// future schema bump naturally invalidates older receipts.
//
// Accepts JSON: { choice, version, config? }
//   choice  : 'accepted' | 'rejected'
//   version : must equal SCHEMA_VERSION (mirrors src/lib/consent.js)
//   config  : optional, mirrors the localStorage record (e.g. { analytics: false })
//
// Light rate-limit (default 20/IP/hour) so a banner-fiddling user is never
// blocked but a script looping on /api/consent can't fill the table.
// Reuses the contact_rate_limits table — entries are tiny and GC'd after 1 day.

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Single source of truth — must match SCHEMA_VERSION in src/lib/consent.js.
const SCHEMA_VERSION = '1.0.0';
const VALID_CHOICES = new Set(['accepted', 'rejected']);

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

const bad = (msg, status = 400) => json({ ok: false, error: msg }, status);

const clientIp = (request) =>
  request.headers.get('cf-connecting-ip') ||
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  '0.0.0.0';

export const onRequestPost = async ({ request, env }) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return bad('Invalid JSON.');
  }

  const { choice, version, config } = body || {};

  // Validate choice
  if (typeof choice !== 'string' || !VALID_CHOICES.has(choice)) {
    return bad('Invalid choice.');
  }

  // Validate schema version — server is the source of truth
  if (version !== SCHEMA_VERSION) {
    return bad('Invalid version.');
  }

  const { DB } = env;
  if (!DB) return bad('D1 binding is not configured.', 500);

  const ip = clientIp(request);
  const ua = (request.headers.get('user-agent') || '').slice(0, 500);

  // Light per-IP throttle. Reuse contact_rate_limits with a 1-hour window —
  // a fresh entry per consent write keeps dedup-by-recent-count simple.
  const maxPerWindow = Number(env.CONSENT_RATE_LIMIT_MAX ?? 20);
  const recent = await DB.prepare(
    `SELECT COUNT(*) AS n FROM contact_rate_limits
       WHERE ip = ? AND submitted_at >= datetime('now', '-1 hour')`
  ).bind(ip).first();

  if ((recent?.n ?? 0) >= maxPerWindow) {
    return json(
      { ok: false, error: 'Too many consent updates. Please reload the page.' },
      429
    );
  }

  const statements = [
    DB.prepare(
      `INSERT INTO consent_receipts (choice, version, ip, user_agent)
       VALUES (?, ?, ?, ?)`
    ).bind(choice, SCHEMA_VERSION, ip, ua),
    // Reuse the rate-limit log so we don't need a second table.
    DB.prepare(`INSERT INTO contact_rate_limits (ip) VALUES (?)`).bind(ip),
    DB.prepare(
      `DELETE FROM contact_rate_limits WHERE submitted_at < datetime('now', '-1 day')`
    ),
  ];

  try {
    await DB.batch(statements);
  } catch (err) {
    console.error('D1 consent insert failed', err);
    return json({ ok: false, error: 'Could not save your choice.' }, 500);
  }

  // Idempotent — duplicates return 200 with the stored version.
  return json({ ok: true, version: SCHEMA_VERSION });
};

export const onRequestGet    = () => json({ ok: false, error: 'Method not allowed.' }, 405);
export const onRequestPut    = () => json({ ok: false, error: 'Method not allowed.' }, 405);
export const onRequestDelete = () => json({ ok: false, error: 'Method not allowed.' }, 405);