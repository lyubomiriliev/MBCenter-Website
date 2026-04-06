-- Add client_phone column to inspections table
ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS client_phone text;
