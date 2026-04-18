-- Add bonus_amount column to earnings_monthly_summary
-- Run this in Supabase SQL Editor

ALTER TABLE earnings_monthly_summary
ADD COLUMN IF NOT EXISTS bonus_amount NUMERIC DEFAULT 0;
