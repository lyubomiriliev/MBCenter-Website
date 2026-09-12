-- Migration: "Удръжки" (other deductions) on the monthly earnings summary
--
-- A free-form deduction alongside Карта / Аванс / Глоби, for both mechanics
-- and receptionists. Subtracted from the cash payout like the others.
-- Additive and safe to re-run. Run this in the Supabase SQL Editor.

ALTER TABLE earnings_monthly_summary
  ADD COLUMN IF NOT EXISTS deductions_amount NUMERIC(10,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN earnings_monthly_summary.deductions_amount IS
  'Other monthly deductions (Удръжки), subtracted from the cash payout.';
