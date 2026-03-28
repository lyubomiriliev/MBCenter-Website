-- Create mechanics table for the "Изпълнено от" dropdown
CREATE TABLE IF NOT EXISTS mechanics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE mechanics ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read mechanics
CREATE POLICY "Authenticated users can read mechanics"
  ON mechanics FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert mechanics
CREATE POLICY "Authenticated users can insert mechanics"
  ON mechanics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to delete mechanics
CREATE POLICY "Authenticated users can delete mechanics"
  ON mechanics FOR DELETE
  TO authenticated
  USING (true);

-- Seed existing mechanics from the hardcoded list
INSERT INTO mechanics (name, sort_order) VALUES
  ('50:50', 0),
  ('Жоро', 1),
  ('Любо', 2);
