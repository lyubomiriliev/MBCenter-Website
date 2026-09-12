-- Migration: a Забележки note per day for the daily turnover
--
-- One free-text note per calendar day, independent of the individual entries.
-- Reception may write it; only admins may change a note once saved, matching
-- the rule that entries cannot be corrected by reception.
-- Run this in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS daily_turnover_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_date date NOT NULL UNIQUE,
  note text NOT NULL DEFAULT '',
  created_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE daily_turnover_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read daily_turnover_notes" ON daily_turnover_notes;
CREATE POLICY "Authenticated users can read daily_turnover_notes"
  ON daily_turnover_notes FOR SELECT
  TO authenticated
  USING (true);

-- Reception writes the day's note as part of the daily workflow.
DROP POLICY IF EXISTS "Authenticated users can insert daily_turnover_notes" ON daily_turnover_notes;
CREATE POLICY "Authenticated users can insert daily_turnover_notes"
  ON daily_turnover_notes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Correcting an existing note is admin-only, like the turnover entries.
DROP POLICY IF EXISTS "Only admins can update daily_turnover_notes" ON daily_turnover_notes;
CREATE POLICY "Only admins can update daily_turnover_notes"
  ON daily_turnover_notes FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete daily_turnover_notes" ON daily_turnover_notes;
CREATE POLICY "Only admins can delete daily_turnover_notes"
  ON daily_turnover_notes FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_daily_turnover_notes_date
  ON daily_turnover_notes (note_date DESC);

CREATE OR REPLACE FUNCTION public.touch_daily_turnover_notes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_daily_turnover_notes_updated_at ON daily_turnover_notes;
CREATE TRIGGER trg_daily_turnover_notes_updated_at
  BEFORE UPDATE ON daily_turnover_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_daily_turnover_notes();
