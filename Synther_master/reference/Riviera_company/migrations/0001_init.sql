-- Initial schema for the contact form.
-- Run with: wrangler d1 migrations apply DB --local (dev) or --remote (prod).

CREATE TABLE IF NOT EXISTS contacts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  project     TEXT,
  message     TEXT    NOT NULL,
  ip          TEXT,
  user_agent  TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_email      ON contacts (email);

-- Rate-limit log: one row per (ip, recent submission) so we can throttle
-- without needing a KV namespace.
CREATE TABLE IF NOT EXISTS contact_rate_limits (
  ip          TEXT    NOT NULL,
  submitted_at TEXT   NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rate_ip_time ON contact_rate_limits (ip, submitted_at DESC);
