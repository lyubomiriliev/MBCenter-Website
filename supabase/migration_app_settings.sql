-- Migration to add app_settings table

CREATE TABLE IF NOT EXISTS app_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  key varchar(255) UNIQUE NOT NULL,
  value numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS policies
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Enable all for authenticated users" ON app_settings FOR ALL TO authenticated USING (auth.role() = 'authenticated');

-- Insert initial values if they don't exist
INSERT INTO app_settings (key, value) VALUES ('mechanic_rate', 0) ON CONFLICT (key) DO NOTHING;
INSERT INTO app_settings (key, value) VALUES ('receptionist_pct', 0) ON CONFLICT (key) DO NOTHING;
