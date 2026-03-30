-- Add is_exported flag to earnings entries
ALTER TABLE earnings_entries ADD COLUMN is_exported BOOLEAN DEFAULT FALSE;

-- Update existing rows to be exported so they don't clog up the Add form
UPDATE earnings_entries SET is_exported = TRUE;
