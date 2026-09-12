-- Migration: Leave / Отпуски
-- Tracks leave periods per worker (mechanic or receptionist) and counts the
-- working days used, excluding weekends and Bulgarian public holidays.
-- Run this in the Supabase SQL Editor.

-- ============================================
-- HELPER: is the current user a super-admin?
-- ============================================
-- Also defined in migration_daily_turnover.sql; repeated here so this file can
-- be run standalone and in either order.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================
-- BULGARIAN PUBLIC HOLIDAYS
-- ============================================
-- Orthodox Easter (Meeus/Julian algorithm, converted to Gregorian).
-- Returns Easter Sunday for the given year.
CREATE OR REPLACE FUNCTION public.orthodox_easter(p_year integer)
RETURNS date
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  a integer; b integer; c integer; d integer; e integer;
  julian_day date;
BEGIN
  a := p_year % 4;
  b := p_year % 7;
  c := p_year % 19;
  d := (19 * c + 15) % 30;
  e := (2 * a + 4 * b - d + 34) % 7;

  -- Easter in the Julian calendar:
  -- month = (d + e + 114) / 31, day = ((d + e + 114) % 31) + 1
  julian_day := make_date(
    p_year,
    ((d + e + 114) / 31)::int,
    (((d + e + 114) % 31) + 1)::int
  );

  -- Julian -> Gregorian offset: 13 days for 1900-2099
  RETURN julian_day + 13;
END;
$$;

-- Extra non-working days declared per year by the Council of Ministers
-- ("мостове" / bridge days). These cannot be derived from a rule - they are
-- announced each year, so new years must be added here as they are published.
CREATE TABLE IF NOT EXISTS bg_extra_holidays (
  holiday_date date PRIMARY KEY,
  name text NOT NULL
);

ALTER TABLE bg_extra_holidays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read bg_extra_holidays" ON bg_extra_holidays;
CREATE POLICY "Authenticated users can read bg_extra_holidays"
  ON bg_extra_holidays FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Only admins can modify bg_extra_holidays" ON bg_extra_holidays;
CREATE POLICY "Only admins can modify bg_extra_holidays"
  ON bg_extra_holidays FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2026: 2 January declared non-working (bridge to the New Year holiday).
INSERT INTO bg_extra_holidays (holiday_date, name) VALUES
  ('2026-01-02', 'Обявен за почивен ден')
ON CONFLICT (holiday_date) DO NOTHING;

-- All Bulgarian non-working days for a year.
--
-- Includes the Labour Code art. 154(2) rule: when a fixed public holiday falls
-- on a Saturday or Sunday, the following working day(s) become non-working.
-- The Easter days are excluded from that rule by law.
CREATE OR REPLACE FUNCTION public.bg_public_holidays(p_year integer)
RETURNS SETOF date
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  easter date := public.orthodox_easter(p_year);
  fixed_days date[];
  all_days date[];
  d date;
  nxt date;
BEGIN
  -- Fixed-date holidays, eligible for weekend compensation
  fixed_days := ARRAY[
    make_date(p_year, 1, 1),    -- Нова година
    make_date(p_year, 3, 3),    -- Ден на Освобождението
    make_date(p_year, 5, 1),    -- Ден на труда
    make_date(p_year, 5, 6),    -- Гергьовден
    make_date(p_year, 5, 24),   -- Ден на светите братя Кирил и Методий
    make_date(p_year, 9, 6),    -- Ден на Съединението
    make_date(p_year, 9, 22),   -- Ден на Независимостта
    make_date(p_year, 12, 24),  -- Бъдни вечер
    make_date(p_year, 12, 25),  -- Рождество Христово
    make_date(p_year, 12, 26)   -- Рождество Христово
  ]::date[];

  -- Easter days are NOT compensated when they fall on a weekend
  all_days := fixed_days || ARRAY[
    easter - 2,  -- Разпети петък
    easter - 1,  -- Велика събота
    easter,      -- Великден
    easter + 1   -- Велики понеделник
  ]::date[];

  -- Compensate each fixed holiday that lands on a weekend
  FOREACH d IN ARRAY fixed_days LOOP
    IF EXTRACT(ISODOW FROM d) >= 6 THEN
      nxt := d + 1;
      WHILE EXTRACT(ISODOW FROM nxt) >= 6 OR nxt = ANY(all_days) LOOP
        nxt := nxt + 1;
      END LOOP;
      all_days := all_days || nxt;
    END IF;
  END LOOP;

  RETURN QUERY
    SELECT DISTINCT unnest(all_days)
    UNION
    SELECT holiday_date FROM bg_extra_holidays
    WHERE EXTRACT(YEAR FROM holiday_date) = p_year;
END;
$$;

-- Count working days in an inclusive range: Mon-Fri, minus non-working days.
-- A holiday on a weekend is already excluded by the Mon-Fri filter; its
-- compensating weekday is returned by bg_public_holidays and excluded here.
CREATE OR REPLACE FUNCTION public.count_working_days(p_start date, p_end date)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM generate_series(p_start, p_end, interval '1 day') AS d(day)
  WHERE EXTRACT(ISODOW FROM d.day) < 6
    AND d.day::date NOT IN (
      SELECT h FROM generate_series(
               EXTRACT(YEAR FROM p_start)::int,
               EXTRACT(YEAR FROM p_end)::int
             ) AS y(yr),
             LATERAL public.bg_public_holidays(y.yr) AS h
    );
$$;

GRANT EXECUTE ON FUNCTION public.orthodox_easter(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bg_public_holidays(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.count_working_days(date, date) TO authenticated;

-- ============================================
-- LEAVE PERIODS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leave_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL,
  worker_type text NOT NULL CHECK (worker_type IN ('mechanic', 'receptionist')),
  worker_name text NOT NULL,

  start_date date NOT NULL,
  end_date date NOT NULL,

  -- Working days used by this period, filled in by trigger
  working_days integer NOT NULL DEFAULT 0,

  leave_type text NOT NULL DEFAULT 'paid' CHECK (leave_type IN ('paid', 'unpaid', 'sick')),
  note text,

  created_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT leave_periods_valid_range CHECK (end_date >= start_date)
);

ALTER TABLE leave_periods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read leave_periods" ON leave_periods;
CREATE POLICY "Authenticated users can read leave_periods"
  ON leave_periods FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert leave_periods" ON leave_periods;
CREATE POLICY "Authenticated users can insert leave_periods"
  ON leave_periods FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update leave_periods" ON leave_periods;
CREATE POLICY "Authenticated users can update leave_periods"
  ON leave_periods FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete leave_periods" ON leave_periods;
CREATE POLICY "Authenticated users can delete leave_periods"
  ON leave_periods FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_leave_periods_worker
  ON leave_periods (worker_id, worker_type);
CREATE INDEX IF NOT EXISTS idx_leave_periods_dates
  ON leave_periods (start_date, end_date);

-- Compute working_days on insert/update so the number can never drift
-- from the dates it describes.
CREATE OR REPLACE FUNCTION public.set_leave_working_days()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.working_days = public.count_working_days(NEW.start_date, NEW.end_date);
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leave_periods_working_days ON leave_periods;
CREATE TRIGGER trg_leave_periods_working_days
  BEFORE INSERT OR UPDATE ON leave_periods
  FOR EACH ROW EXECUTE FUNCTION public.set_leave_working_days();
