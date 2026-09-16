-- Migration: activity log (Логове)
--
-- An append-only record of who changed what, and when, across the daily
-- turnover and the offers. The client wants to be able to answer "which
-- account changed record X, and what did it look like before?".
--
-- Nothing else in the database depends on this table: it is written to
-- best-effort from the app, never read by another table, and never used in a
-- constraint. A failure to log must never block the write it describes.
--
-- Safe to run on live data, and safe to run BEFORE the new front-end is
-- deployed: this only adds a new table, so the currently deployed site keeps
-- working untouched — it simply writes nothing to it yet.
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
-- ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- WHO. auth_id is the durable identity; the name and email are snapshotted
  -- so a renamed or deleted account still reads correctly in the log.
  auth_id uuid,
  user_name text,
  user_email text,

  -- WHAT. entity_type keeps the two areas apart in the filters; entity_id is
  -- deliberately NOT a foreign key, so deleting an offer or a turnover row
  -- leaves its history intact.
  entity_type text NOT NULL CHECK (entity_type IN ('daily_turnover', 'offer')),
  entity_id uuid,
  -- Human-readable handle for the row: offer number, service card number, or
  -- the vehicle. Shown in the log so an entry is readable without a lookup.
  entity_label text,

  action text NOT NULL CHECK (action IN ('create', 'edit', 'delete')),

  -- The field-level diff, as [{ field, label, from, to }, ...]. jsonb so the
  -- shape can grow without another migration. Empty for create/delete.
  changes jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- WHEN
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Reading the log is admin-only: it exposes who did what, and the diffs can
-- contain figures (parts cost, profit) that reception must not see.
DROP POLICY IF EXISTS "Only admins can read activity_log" ON activity_log;
CREATE POLICY "Only admins can read activity_log"
  ON activity_log FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Anyone signed in may APPEND: reception creates turnover rows and edits
-- offers, and those actions are exactly what the log exists to capture.
DROP POLICY IF EXISTS "Authenticated users can insert activity_log" ON activity_log;
CREATE POLICY "Authenticated users can insert activity_log"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Append-only: no UPDATE and no DELETE policy is created, so with RLS enabled
-- nobody can rewrite or erase history through the API, not even an admin.
-- (Maintenance/retention is done with the service role or in the SQL Editor.)

-- ============================================
-- INDEXES
-- ============================================
-- The page lists newest-first and filters by user, by entity type and by date.
CREATE INDEX IF NOT EXISTS idx_activity_log_created
  ON activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity
  ON activity_log (entity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user
  ON activity_log (auth_id, created_at DESC);
-- "show me everything that happened to this record"
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_id
  ON activity_log (entity_id);

COMMENT ON TABLE activity_log IS
  'Append-only audit trail of create/edit/delete on daily_turnover and offers. Admin-readable only.';
COMMENT ON COLUMN activity_log.changes IS
  'Field-level diff as [{field, label, from, to}]; empty for create and delete.';
COMMENT ON COLUMN activity_log.entity_id IS
  'Id of the changed row. Intentionally not a foreign key so history survives deletion.';
