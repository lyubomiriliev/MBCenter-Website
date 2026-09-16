-- Migration: allow log entries from every section
--
-- activity_log started with a CHECK that accepted only 'daily_turnover' and
-- 'offer'. The log now covers склад, заработки, отпуски, механици and the
-- rest, so that constraint has to accept any table name.
--
-- Safe to run on live data: it only WIDENS what the column accepts, so every
-- existing row stays valid and the currently deployed site keeps writing its
-- two values as before.
-- Run this in the Supabase SQL Editor.

ALTER TABLE public.activity_log
  DROP CONSTRAINT IF EXISTS activity_log_entity_type_check;

-- Still not free-form: a sane lower-case identifier.
ALTER TABLE public.activity_log
  ADD CONSTRAINT activity_log_entity_type_check
  CHECK (entity_type ~ '^[a-z_][a-z0-9_]{0,62}$');

COMMENT ON COLUMN public.activity_log.entity_type IS
  'The table the change was made to, e.g. offers, warehouse_parts, leave_periods.';
