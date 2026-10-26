-- 0002_quick_consult.sql
-- Quick consulting / urgent ticket requests submitted from the /help page.
-- Same shape as the `contacts` table but with `situation` (required)
-- replacing `message`, and an optional `preferred_time` free-text field
-- replacing the project-type select.
--
-- Apply with:
--   npx wrangler@latest d1 migrations apply DB --local
--   npx wrangler@latest d1 migrations apply DB --remote

CREATE TABLE IF NOT EXISTS quick_consult_requests (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  situation       TEXT NOT NULL,
  preferred_time  TEXT,
  ip              TEXT,
  user_agent      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_qc_created_at
  ON quick_consult_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qc_email
  ON quick_consult_requests(email);
