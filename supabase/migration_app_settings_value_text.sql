-- Migration to add value_text column to app_settings for storing JSON/text values
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS value_text text;

-- Seed the document_creators key
INSERT INTO app_settings (key, value_text) VALUES ('document_creators', '[]') ON CONFLICT (key) DO NOTHING;
