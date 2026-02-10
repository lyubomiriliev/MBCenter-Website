-- Migration: Add new fields for offer enhancements
-- Run this in Supabase SQL Editor
-- NOTE: Schema uses CHECK constraint for status, not an ENUM type.

-- 1. Migrate existing 'approved' status to 'finished'
UPDATE offers SET status = 'finished' WHERE status = 'approved';

-- 2. Drop existing status CHECK constraint (name varies; find and drop)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey) AND NOT a.attisdropped
    WHERE c.conrelid = 'offers'::regclass AND c.contype = 'c' AND a.attname = 'status'
  LOOP
    EXECUTE format('ALTER TABLE offers DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- 3. Add new status CHECK (parts_ordered added, approved removed)
ALTER TABLE offers ADD CONSTRAINT offers_status_check 
  CHECK (status IN ('draft', 'sent', 'parts_ordered', 'finished', 'cancelled'));

-- 4. Add new columns to offers table
ALTER TABLE offers ADD COLUMN IF NOT EXISTS car_model_detail text;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS repair_name text;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS notes_internal text;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS notes_service text;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS discount_parts_percent numeric DEFAULT 0;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS discount_services_percent numeric DEFAULT 0;

-- 5. Add new columns to service_actions table
ALTER TABLE service_actions ADD COLUMN IF NOT EXISTS is_fixed_price boolean DEFAULT false;
ALTER TABLE service_actions ADD COLUMN IF NOT EXISTS fixed_price_amount numeric;
