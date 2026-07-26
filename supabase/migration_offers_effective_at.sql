-- Migration: add offers.effective_at generated column
-- Run this in Supabase SQL Editor (already applied to the MBCenter Admin project).
--
-- Adds a single "effective" timestamp used for both display and sorting in the
-- quotations list. It mirrors the app's display fallback order:
--   service_card_generated_at  (when the vehicle was released / card generated)
--   -> last_edited_at          (last meaningful quotation edit)
--   -> created_at              (creation)
--
-- Sorting the list by this column keeps the displayed Date/Time monotonic and
-- guarantees newly created quotations appear at the top of the list.

ALTER TABLE offers
  ADD COLUMN IF NOT EXISTS effective_at timestamptz
  GENERATED ALWAYS AS (
    COALESCE(service_card_generated_at, last_edited_at, created_at)
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_offers_effective_at ON offers (effective_at DESC);
