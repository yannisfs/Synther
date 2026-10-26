-- Initial schema for Synther GmbH.
-- Two tables copied verbatim from the Riviera_company reference (which uses
-- the same pattern); only consent_receipts is new for Synther.
--
-- Run with:
--   npx wrangler@latest d1 migrations apply DB --local   # local dev
--   npx wrangler@latest d1 migrations apply DB --remote  # production

-- Contact form submissions.
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

-- Rate-limit log for the contact endpoint. One row per (ip, recent submission)
-- so we can throttle without needing a KV namespace.
CREATE TABLE IF NOT EXISTS contact_rate_limits (
  ip          TEXT    NOT NULL,
  submitted_at TEXT   NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rate_ip_time ON contact_rate_limits (ip, submitted_at DESC);

-- DSGVO consent receipts. One row per user decision so we can document the
-- consent under Art. 7 (1) DSGVO. The imprint page's Datenschutzerklärung
-- discloses that we record choice, version, timestamp, IP and user-agent.
CREATE TABLE IF NOT EXISTS consent_receipts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  choice      TEXT    NOT NULL CHECK (choice IN ('accepted', 'rejected')),
  version     TEXT    NOT NULL,
  timestamp   TEXT    NOT NULL DEFAULT (datetime('now')),
  ip          TEXT,
  user_agent  TEXT
);

CREATE INDEX IF NOT EXISTS idx_consent_timestamp ON consent_receipts (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_consent_ip_time   ON consent_receipts (ip, timestamp DESC);