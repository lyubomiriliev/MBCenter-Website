-- ============================================================
-- MB Center - Update inspection check_number format
-- Changes from: INS-YYYYMMDD-NNNN
-- Changes to:   8-digit zero-padded sequential number (e.g. 00010105)
--
-- Run this in Supabase SQL Editor if the inspections table already exists.
-- ============================================================

-- Drop the old sequence and recreate starting at 10105 (or adjust as needed)
drop sequence if exists inspections_seq;
create sequence inspections_seq start 10105;

-- Replace the number generation function
create or replace function generate_check_number()
returns trigger as $$
begin
  new.check_number := lpad(nextval('inspections_seq')::text, 8, '0');
  return new;
end;
$$ language plpgsql;

-- The trigger (set_check_number) already exists and calls this function,
-- so no trigger changes are needed.
