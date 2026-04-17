-- ============================================
-- WAREHOUSE PARTS TABLE
-- Run this in your Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS warehouse_parts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  part_number  TEXT NOT NULL,
  manufacturer TEXT NOT NULL DEFAULT 'MERCEDES',
  quantity     INTEGER NOT NULL DEFAULT 0,
  cost_price   NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price   NUMERIC(10,2) NOT NULL DEFAULT 0,
  replaced_by  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS warehouse_parts_part_number_idx ON warehouse_parts (part_number);
CREATE INDEX IF NOT EXISTS warehouse_parts_created_at_idx ON warehouse_parts (created_at DESC);

ALTER TABLE warehouse_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage warehouse"
  ON warehouse_parts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_warehouse_parts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER warehouse_parts_updated_at
  BEFORE UPDATE ON warehouse_parts
  FOR EACH ROW EXECUTE FUNCTION update_warehouse_parts_updated_at();
