-- Migration: mixed payments on a single turnover row
--
-- Previously a payment split across methods was stored as one row per method,
-- which fragmented a single job into several table lines. Now each row keeps
-- its own per-method breakdown and stays a single entry.
--
-- Safe to run on live data: existing rows keep their amount and payment_method,
-- and their breakdown is backfilled from those two values.
-- Run this in the Supabase SQL Editor.

-- ============================================
-- PER-METHOD AMOUNTS
-- ============================================
ALTER TABLE daily_turnover
  ADD COLUMN IF NOT EXISTS amount_cash numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_card numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_bank numeric(10,2) NOT NULL DEFAULT 0;

-- Backfill: put each existing row's amount under the method it was recorded as.
-- Only touches rows not yet backfilled, so this is safe to re-run.
UPDATE daily_turnover
SET
  amount_cash = CASE WHEN payment_method = 'cash' THEN amount ELSE 0 END,
  amount_card = CASE WHEN payment_method = 'card' THEN amount ELSE 0 END,
  amount_bank = CASE WHEN payment_method = 'bank' THEN amount ELSE 0 END
WHERE amount_cash = 0 AND amount_card = 0 AND amount_bank = 0;

-- `amount` stays the row total and must always equal the parts.
ALTER TABLE daily_turnover
  DROP CONSTRAINT IF EXISTS daily_turnover_amount_matches_split;
ALTER TABLE daily_turnover
  ADD CONSTRAINT daily_turnover_amount_matches_split
  CHECK (abs(amount - (amount_cash + amount_card + amount_bank)) < 0.005);

-- `payment_method` now means "the single method used", or 'mixed' when the
-- payment was split across more than one.
ALTER TABLE daily_turnover
  DROP CONSTRAINT IF EXISTS daily_turnover_payment_method_check;
ALTER TABLE daily_turnover
  ADD CONSTRAINT daily_turnover_payment_method_check
  CHECK (payment_method IN ('cash', 'card', 'bank', 'mixed'));

-- Keep payment_method in agreement with the amounts, whatever writes the row.
CREATE OR REPLACE FUNCTION public.sync_turnover_payment_method()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  used int := 0;
BEGIN
  IF NEW.amount_cash > 0 THEN used := used + 1; END IF;
  IF NEW.amount_card > 0 THEN used := used + 1; END IF;
  IF NEW.amount_bank > 0 THEN used := used + 1; END IF;

  IF used > 1 THEN
    NEW.payment_method := 'mixed';
  ELSIF NEW.amount_cash > 0 THEN
    NEW.payment_method := 'cash';
  ELSIF NEW.amount_card > 0 THEN
    NEW.payment_method := 'card';
  ELSIF NEW.amount_bank > 0 THEN
    NEW.payment_method := 'bank';
  END IF;

  NEW.amount := NEW.amount_cash + NEW.amount_card + NEW.amount_bank;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_daily_turnover_sync_method ON daily_turnover;
CREATE TRIGGER trg_daily_turnover_sync_method
  BEFORE INSERT OR UPDATE ON daily_turnover
  FOR EACH ROW EXECUTE FUNCTION public.sync_turnover_payment_method();
