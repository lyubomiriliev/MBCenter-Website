-- Migration: index the log's "who" filter
--
-- The Логове page filters by `user_name`, not by `auth_id`: the log snapshots
-- the display name, so an account that was renamed or deleted still reads
-- correctly, and the filter has to match what the column actually holds.
--
-- migration_activity_log.sql indexed (auth_id, created_at DESC), which that
-- filter never touches, so filtering by a person falls back to a sequential
-- scan of the whole table plus a sort. Harmless today; not once the table has
-- a year of entries in it.
--
-- Safe to run on live data: adding an index changes no rows and no policies,
-- and the currently deployed site keeps working untouched. Safe to run twice.
-- Run this in the Supabase SQL Editor.

-- The page orders newest-first, so created_at belongs in the index next to
-- the filtered column: Postgres then reads the page's rows straight off the
-- index instead of sorting the matches.
CREATE INDEX IF NOT EXISTS idx_activity_log_user_name
  ON public.activity_log (user_name, created_at DESC);

-- The same page also filters by section and by user together. A plain
-- (entity_type, created_at DESC) index already exists from the first
-- migration and covers the section-only case.

COMMENT ON INDEX public.idx_activity_log_user_name IS
  'Serves the log page''s "who" filter, which matches on the snapshotted user_name.';
