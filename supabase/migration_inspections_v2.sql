-- ============================================================
-- MB Center — Technical Inspection Reports (Протоколи) V2 Schema Update
-- Paste this into Supabase SQL Editor and run it.
-- Adds new columns for the redesigned CheckPDF format.
-- ============================================================

ALTER TABLE inspections 
  ADD COLUMN IF NOT EXISTS brakes jsonb not null default '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS suspension jsonb not null default '{}'::jsonb;
