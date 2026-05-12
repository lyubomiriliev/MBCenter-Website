-- Add advance_amount column to earnings_monthly_summary
ALTER TABLE earnings_monthly_summary
ADD COLUMN IF NOT EXISTS advance_amount NUMERIC(10,2) NOT NULL DEFAULT 0;
