-- Migration: Earnings System
-- Creates tables for: receptionists, earnings entries, and monthly summaries
-- Run this in the Supabase SQL Editor

-- ============================================
-- RECEPTIONISTS TABLE (mirrors mechanics table)
-- ============================================
CREATE TABLE IF NOT EXISTS receptionists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE receptionists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read receptionists"
  ON receptionists FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert receptionists"
  ON receptionists FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update receptionists"
  ON receptionists FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete receptionists"
  ON receptionists FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- EARNINGS ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS earnings_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL,
  worker_type text NOT NULL CHECK (worker_type IN ('mechanic', 'receptionist')),
  worker_name text NOT NULL,
  vehicle text,
  repair_name text,
  -- Mechanic fields
  repair_time numeric(10,2),
  hourly_rate numeric(10,2),
  total numeric(10,2),
  -- Receptionist fields
  repair_total numeric(10,2),
  turnover_pct numeric(5,2),
  earnings numeric(10,2),
  -- Common fields
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  month integer NOT NULL,
  year integer NOT NULL,
  offer_id uuid REFERENCES offers(id) ON DELETE SET NULL,
  offer_number text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE earnings_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read earnings_entries"
  ON earnings_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert earnings_entries"
  ON earnings_entries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update earnings_entries"
  ON earnings_entries FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete earnings_entries"
  ON earnings_entries FOR DELETE
  TO authenticated
  USING (true);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_earnings_entries_worker
  ON earnings_entries (worker_id, worker_type);
CREATE INDEX IF NOT EXISTS idx_earnings_entries_month_year
  ON earnings_entries (year, month);
CREATE INDEX IF NOT EXISTS idx_earnings_entries_worker_month
  ON earnings_entries (worker_id, worker_type, year, month);

-- ============================================
-- EARNINGS MONTHLY SUMMARY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS earnings_monthly_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL,
  worker_type text NOT NULL CHECK (worker_type IN ('mechanic', 'receptionist')),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2020),
  card_amount numeric(10,2) DEFAULT 0,
  fines_amount numeric(10,2) DEFAULT 0,
  fixed_salary numeric(10,2) DEFAULT 0,
  cash_amount numeric(10,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (worker_id, worker_type, month, year)
);

ALTER TABLE earnings_monthly_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read earnings_monthly_summary"
  ON earnings_monthly_summary FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert earnings_monthly_summary"
  ON earnings_monthly_summary FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update earnings_monthly_summary"
  ON earnings_monthly_summary FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete earnings_monthly_summary"
  ON earnings_monthly_summary FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_earnings_monthly_summary_worker
  ON earnings_monthly_summary (worker_id, worker_type, year, month);
