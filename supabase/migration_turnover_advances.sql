-- Migration: advance payments (авансово плащане) in the daily turnover
--
-- An advance is not a payment METHOD - it is still paid in cash, by card or by
-- bank. What makes it different is WHEN: it arrives before the job is closed.
-- So it is recorded on the day the money actually came in, and the closing day
-- then records only the remaining balance. That keeps each day's till correct.
--
-- Safe to run on live data: adds nullable columns and one new value.
-- Run this in the Supabase SQL Editor.

-- ============================================
-- 1. Mark turnover rows that are advances
-- ============================================
ALTER TABLE daily_turnover
  ADD COLUMN IF NOT EXISTS is_advance boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN daily_turnover.is_advance IS
  'True when this row is an advance taken before the job was closed.';

-- An offer can now have several turnover rows: one per advance, plus the
-- final balance. The old uniqueness assumption (one row per offer) no longer
-- holds, so distinguish them by this flag.
CREATE INDEX IF NOT EXISTS idx_daily_turnover_offer_advance
  ON daily_turnover (offer_id, is_advance);

-- ============================================
-- 2. Record how and when each advance was paid
-- ============================================
-- prepayments_eur stays as-is (the amounts) so existing offers keep working.
-- These parallel arrays carry the method and date for each advance, by index.
ALTER TABLE offers
  ADD COLUMN IF NOT EXISTS prepayment_methods text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prepayment_dates date[] DEFAULT '{}';

COMMENT ON COLUMN offers.prepayment_methods IS
  'Payment method per advance, aligned by index with prepayments_eur.';
COMMENT ON COLUMN offers.prepayment_dates IS
  'Date each advance was taken, aligned by index with prepayments_eur.';

-- ============================================
-- 3. Profit belongs to the closing row only
-- ============================================
-- An advance is money in, but the job is not finished, so it must not add any
-- profit on the day it was taken. The full profit is counted when the service
-- card is issued. The closing row therefore records how much advance was
-- applied to it, so profit can be computed on the job's FULL value:
--
--   profit = (closing amount + advance_applied) - parts_cost
--
-- Turnover stays unaffected: each row still contributes only its own amount.
ALTER TABLE daily_turnover
  ADD COLUMN IF NOT EXISTS advance_applied numeric(10,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN daily_turnover.advance_applied IS
  'Advance already collected for this job, added back when computing profit. Set on the closing row only.';
