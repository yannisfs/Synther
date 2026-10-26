// Cloudflare Pages Function — POST /api/contact
//
// Accepts JSON: { name, email, project, message, hp, consent }
// - `hp` is the honeypot field. If non-empty, we silently 200 OK (don't tip off bots).
// - Inserts into D1 `contacts`.
// - Throttles per client IP via D1 `contact_rate_limits`.
// - DSGVO Art. 6 (1) lit. a / f: server-side `consent === true` is a hard gate.
//
// Copied with small adjustments from the Riviera_company reference
// (Synther_master/reference/Riviera_company/functions/api/contact.js).

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = {
  name:    { max: 120 },
  email:   { max: 200 },
  project: { max: 80  },
  message: { max: 4000 },
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

// bad(msg, status?) — defaults to 400; pass 500 etc. when needed.
const bad = (msg, status = 400) => json({ ok: false, error: msg }, status);

// Extract the request IP, preferring the CF-provided header.
const clientIp = (request) =>
  request.headers.get('cf-connecting-ip') ||
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  '0.0.0.0';

export const onRequestPost = async ({ request, env }) => {
  // 1. Parse + shape-check
  let body;
  try {
    body = await request.json();
  } catch {
    return bad('Invalid JSON.');
  }

  const { name, email, project, message, hp, consent } = body || {};

  // 2. Honeypot — silently accept
  if (typeof hp === 'string' && hp.trim().length > 0) {
    return json({ ok: true });
  }

  // 3. Required fields + format checks
  if (typeof name !== 'string' || !name.trim())    return bad('Name is required.');
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) return bad('A valid email is required.');
  if (typeof message !== 'string' || !message.trim()) return bad('Message is required.');

  // 4. DSGVO consent (Art. 6 Abs. 1 lit. a / Art. 7)
  if (consent !== true) {
    return bad('Consent to data processing is required.');
  }

  // 5. Length caps
  for (const [field, { max }] of Object.entries(LIMITS)) {
    const val = body[field];
    if (typeof val === 'string' && val.length > max) return bad(`${field} is too long (max ${max}).`);
  }

  // 6. IP rate-limit
  const ip = clientIp(request);

  const windowMinutes = Number(env.RATE_LIMIT_WINDOW_MINUTES ?? 10);
  const maxPerWindow  = Number(env.RATE_LIMIT_MAX ?? 3);

  const { DB } = env;
  if (!DB) return bad('D1 binding is not configured.', 500);

  const recent = await DB.prepare(
    `SELECT COUNT(*) AS n FROM contact_rate_limits
       WHERE ip = ? AND submitted_at >= datetime('now', ?)`
  ).bind(ip, `-${windowMinutes} minutes`).first();

  if ((recent?.n ?? 0) >= maxPerWindow) {
    return json(
      { ok: false, error: `Too many submissions. Please try again in ${windowMinutes} minutes.` },
      429
    );
  }

  // 7. Insert the contact + log the rate-limit attempt in one batch.
  const ua = request.headers.get('user-agent') || '';
  const statements = [
    DB.prepare(
      `INSERT INTO contacts (name, email, project, message, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      name.trim().slice(0, LIMITS.name.max),
      email.trim().slice(0, LIMITS.email.max),
      typeof project === 'string' ? project.trim().slice(0, LIMITS.project.max) || null : null,
      message.trim().slice(0, LIMITS.message.max),
      ip,
      ua.slice(0, 500),
    ),
    DB.prepare(
      `INSERT INTO contact_rate_limits (ip) VALUES (?)`
    ).bind(ip),
    // Opportunistic GC: keep the rate-limit table small.
    DB.prepare(
      `DELETE FROM contact_rate_limits WHERE submitted_at < datetime('now', '-1 day')`
    ),
  ];

  try {
    await DB.batch(statements);
  } catch (err) {
    console.error('D1 insert failed', err);
    return json({ ok: false, error: 'Could not save your message. Please try again later.' }, 500);
  }

  return json({ ok: true });
};

// Other methods → 405
export const onRequestGet = () => json({ ok: false, error: 'Method not allowed.' }, 405);
export const onRequestPut  = () => json({ ok: false, error: 'Method not allowed.' }, 405);
export const onRequestDelete = () => json({ ok: false, error: 'Method not allowed.' }, 405);