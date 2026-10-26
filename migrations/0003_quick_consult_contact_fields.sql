-- 0003_quick_consult_contact_fields.sql
-- S30: the urgent ticket form on /help now collects two additional fields
-- that the 30-minute consult form does not:
--   callback_phone  — a number we can actually call back on. The old form
--                     only asked for email, which meant an urgent request
--                     could not be answered by phone at all.
--   company_system  — which company, system or process is affected. An
--                     urgent ticket without this context is unactionable.
--
-- Both are nullable columns: existing rows stay valid, and the shared
-- /api/quick-consult endpoint only requires them when the client sends
-- `kind: 'urgent'`.
--
-- Apply with:
--   npx wrangler@latest d1 migrations apply DB --local
--   npx wrangler@latest d1 migrations apply DB --remote

ALTER TABLE quick_consult_requests ADD COLUMN callback_phone TEXT;
ALTER TABLE quick_consult_requests ADD COLUMN company_system TEXT;