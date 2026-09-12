-- Migration: yearly leave entitlement + starting balances
--
-- Every employee is entitled to a number of paid leave days per year
-- (20 by default). This stores the allowance and seeds the current balances.
-- Run this in the Supabase SQL Editor after migration_leave.sql.

-- ============================================
-- ENTITLEMENT PER WORKER PER YEAR
-- ============================================
CREATE TABLE IF NOT EXISTS leave_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL,
  worker_type text NOT NULL CHECK (worker_type IN ('mechanic', 'receptionist')),
  year integer NOT NULL CHECK (year >= 2020),
  -- Paid leave days granted for the year
  total_days integer NOT NULL DEFAULT 20 CHECK (total_days >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (worker_id, worker_type, year)
);

ALTER TABLE leave_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read leave_entitlements" ON leave_entitlements;
CREATE POLICY "Authenticated users can read leave_entitlements"
  ON leave_entitlements FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert leave_entitlements" ON leave_entitlements;
CREATE POLICY "Authenticated users can insert leave_entitlements"
  ON leave_entitlements FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update leave_entitlements" ON leave_entitlements;
CREATE POLICY "Authenticated users can update leave_entitlements"
  ON leave_entitlements FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete leave_entitlements" ON leave_entitlements;
CREATE POLICY "Authenticated users can delete leave_entitlements"
  ON leave_entitlements FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_leave_entitlements_worker
  ON leave_entitlements (worker_id, worker_type, year);

-- ============================================
-- SEED: 20 days for every mechanic and receptionist, this year
-- ============================================
INSERT INTO leave_entitlements (worker_id, worker_type, year, total_days)
SELECT m.id, 'mechanic', EXTRACT(YEAR FROM CURRENT_DATE)::int, 20
FROM mechanics m
WHERE m.name <> '50:50'   -- an earnings-split bucket, not a person
ON CONFLICT (worker_id, worker_type, year) DO NOTHING;

INSERT INTO leave_entitlements (worker_id, worker_type, year, total_days)
SELECT r.id, 'receptionist', EXTRACT(YEAR FROM CURRENT_DATE)::int, 20
FROM receptionists r
ON CONFLICT (worker_id, worker_type, year) DO NOTHING;

-- ============================================
-- SEED: starting balances for Любомир and Георги
-- ============================================
-- Placeholder periods so the current balances show correctly:
--   Любомир — all 20 days used (0 remaining)
--   Георги  — 16 days used (4 remaining)
-- Replace these with the real dates once known: delete the row marked
-- "Начален баланс" in История and enter the actual periods on the calendar.
DO $$
DECLARE
  v_year int := EXTRACT(YEAR FROM CURRENT_DATE)::int;
  r record;
  target_days int;
  d date;
  used int;
  period_start date;
BEGIN
  FOR r IN
    SELECT id, name FROM mechanics
    WHERE name ILIKE '%Любомир%' OR name ILIKE '%Георги%'
  LOOP
    target_days := CASE WHEN r.name ILIKE '%Любомир%' THEN 20 ELSE 16 END;

    -- Skip if this worker already has leave recorded for the year.
    CONTINUE WHEN EXISTS (
      SELECT 1 FROM leave_periods lp
      WHERE lp.worker_id = r.id
        AND lp.worker_type = 'mechanic'
        AND EXTRACT(YEAR FROM lp.start_date)::int = v_year
    );

    -- Walk back from today to find a range holding exactly target_days
    -- working days, so the seeded balance is arithmetically correct.
    d := CURRENT_DATE;
    used := 0;
    WHILE used < target_days LOOP
      d := d - 1;
      IF public.count_working_days(d, d) = 1 THEN
        used := used + 1;
      END IF;
    END LOOP;
    period_start := d;

    INSERT INTO leave_periods (
      worker_id, worker_type, worker_name,
      start_date, end_date, leave_type, note, created_by_name
    ) VALUES (
      r.id, 'mechanic', r.name,
      period_start, CURRENT_DATE - 1, 'paid',
      'Начален баланс - заменете с реалните дати', 'system'
    );
  END LOOP;
END $$;
