-- Add last_edited_at column to track real edits (excludes service card generation)
ALTER TABLE offers ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;

-- Initialize from updated_at for existing offers
UPDATE offers SET last_edited_at = updated_at WHERE last_edited_at IS NULL;

-- Index for sorting
CREATE INDEX IF NOT EXISTS offers_last_edited_at_idx ON offers (last_edited_at DESC);
