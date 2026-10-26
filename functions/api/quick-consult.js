// Cloudflare Pages Function — POST /api/quick-consult
//
// Accepts JSON: { name, email, situation, preferredTime, callbackPhone,
//                 company, kind, hp, consent }
// - `hp` is the honeypot field. If non-empty, we silently 200 OK (don't tip off bots).
// - `kind` is 'urgent' (ticket form) or 'consult' (30-min call form). S30:
//   the two forms no longer collect the same set of fields — only the
//   urgent ticket asks for a callback phone number and a company/system,
//   so those two are validated as required only when kind === 'urgent'.
// - Inserts into D1 `quick_consult_requests` (see migrations/0002_quick_consult.sql,
//   plus migrations/0003_quick_consult_contact_fields.sql for the two S30 columns).
// - Throttles per client IP via the shared D1 `contact_rate_limits` table
//   (same envs as /api/contact: RATE_LIMIT_WINDOW_MINUTES, RATE_LIMIT_MAX).
// - DSGVO Art. 6 (1) lit. a / f: server-side `consent === true` is a hard gate.
//
// The "urgent ticket" and "30-min quick consult" forms on /help both post
// here — they share the same backend for v1. The endpoint doesn't route
// them differently; the client's `kind` field only decides which optional
// fields are required.

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = {
  name:          { max: 120 },
  email:         { max: 200 },
  situation:     { max: 4000 },
  preferredTime: { max: 200 },
  callbackPhone: { max: 60 },
  company:       { max: 200 },
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

const bad = (msg, status = 400) => json({ ok: false, error: msg }, status);

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

  const { name, email, situation, preferredTime, callbackPhone, company, kind, hp, consent } =
    body || {};
  const isUrgent = kind === 'urgent';

  // 2. Honeypot — silently accept
  if (typeof hp === 'string' && hp.trim().length > 0) {
    return json({ ok: true });
  }

  // 3. Required fields + format checks
  if (typeof name !== 'string' || !name.trim()) return bad('Name is required.');
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) return bad('A valid email is required.');
  if (typeof situation !== 'string' || !situation.trim()) return bad('Please describe the situation.');
  // S30: an urgent ticket is only actionable with a phone number to call
  // back on and a statement of what is affected. The consult form asks
  // for neither, so these are gated on `kind`.
  if (isUrgent) {
    if (typeof callbackPhone !== 'string' || !callbackPhone.trim()) {
      return bad('A callback phone number is required.');
    }
    if (typeof company !== 'string' || !company.trim()) {
      return bad('Please tell us which company or system is affected.');
    }
  }

  // 4. DSGVO consent (Art. 6 Abs. 1 lit. a / Art. 7)
  if (consent !== true) {
    return bad('Consent to data processing is required.');
  }

  // 5. Length caps
  for (const [field, { max }] of Object.entries(LIMITS)) {
    const val = body[field];
    if (typeof val === 'string' && val.length > max) return bad(`${field} is too long (max ${max}).`);
  }

  // 6. IP rate-limit (shared with /api/contact via contact_rate_limits)
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

  // 7. Insert the request + log the rate-limit attempt in one batch.
  const ua = request.headers.get('user-agent') || '';
  const statements = [
    DB.prepare(
      `INSERT INTO quick_consult_requests
         (name, email, situation, preferred_time, callback_phone,
          company_system, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      name.trim().slice(0, LIMITS.name.max),
      email.trim().slice(0, LIMITS.email.max),
      situation.trim().slice(0, LIMITS.situation.max),
      typeof preferredTime === 'string'
        ? preferredTime.trim().slice(0, LIMITS.preferredTime.max) || null
        : null,
      typeof callbackPhone === 'string'
        ? callbackPhone.trim().slice(0, LIMITS.callbackPhone.max) || null
        : null,
      typeof company === 'string'
        ? company.trim().slice(0, LIMITS.company.max) || null
        : null,
      ip,
      ua.slice(0, 500),
    ),
    DB.prepare(
      `INSERT INTO contact_rate_limits (ip) VALUES (?)`
    ).bind(ip),
    DB.prepare(
      `DELETE FROM contact_rate_limits WHERE submitted_at < datetime('now', '-1 day')`
    ),
  ];

  try {
    await DB.batch(statements);
  } catch (err) {
    console.error('D1 insert failed', err);
    return json({ ok: false, error: 'Could not save your request. Please try again later.' }, 500);
  }

  return json({ ok: true });
};

// Other methods → 405
export const onRequestGet = () => json({ ok: false, error: 'Method not allowed.' }, 405);
export const onRequestPut  = () => json({ ok: false, error: 'Method not allowed.' }, 405);
export const onRequestDelete = () => json({ ok: false, error: 'Method not allowed.' }, 405);
