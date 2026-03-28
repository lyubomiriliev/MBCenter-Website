-- ============================================================
-- MB Center — Technical Inspection Reports (Протоколи)
-- Paste this into Supabase SQL Editor and run it.
-- ============================================================


-- ============================================================
-- INSPECTIONS TABLE
-- ============================================================
create table if not exists inspections (
  id              uuid primary key default gen_random_uuid(),

  -- Auto-generated report number (e.g. INS-20260319-0001)
  check_number    text unique not null,

  -- Basic info
  inspection_date date not null,
  mechanic        text,
  client_name     text,
  car_model       text,
  license_plate   text,
  vin             text,

  -- Complex nested data stored as JSONB
  -- Structure: { frontLeft, frontRight, rearLeft, rearRight }
  -- Each tire: { brand, dot, tread, condition, note }
  tires           jsonb not null default '{}'::jsonb,

  -- Array of { label, value, note } — 3 corrosion checks
  corrosion       jsonb not null default '[]'::jsonb,

  -- Array of { label, value, note } — 4 fluid checks
  fluids          jsonb not null default '[]'::jsonb,

  -- Object: { odometer, assessment, note }
  mileage         jsonb not null default '{}'::jsonb,

  -- Array of { label, value, note } — 3 glass checks
  glass           jsonb not null default '[]'::jsonb,

  -- Free-text summary / mechanic recommendations
  summary         text,

  -- Audit
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);


-- ============================================================
-- AUTO-INCREMENT CHECK NUMBER
-- Uses a Postgres sequence so numbers are gapless and ordered.
-- Format: INS-YYYYMMDD-NNNN (e.g. INS-20260319-0001)
-- ============================================================
create sequence if not exists inspections_seq start 1;

create or replace function generate_check_number()
returns trigger as $$
begin
  new.check_number := 'INS-'
    || to_char(now(), 'YYYYMMDD')
    || '-'
    || lpad(nextval('inspections_seq')::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger set_check_number
  before insert on inspections
  for each row
  when (new.check_number is null or new.check_number = '')
  execute function generate_check_number();


-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
create or replace function update_inspections_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger inspections_updated_at
  before update on inspections
  for each row
  execute function update_inspections_updated_at();


-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_inspections_created_at    on inspections (created_at desc);
create index if not exists idx_inspections_license_plate on inspections (license_plate);
create index if not exists idx_inspections_vin           on inspections (vin);
create index if not exists idx_inspections_client_name   on inspections (client_name);
create index if not exists idx_inspections_check_number  on inspections (check_number);


-- ============================================================
-- ROW LEVEL SECURITY
-- Same pattern as offers — all authenticated users can manage.
-- ============================================================
alter table inspections enable row level security;

create policy "Authenticated users can view inspections"
  on inspections for select
  using (auth.uid() is not null);

create policy "Authenticated users can insert inspections"
  on inspections for insert
  with check (auth.uid() is not null);

create policy "Authenticated users can update inspections"
  on inspections for update
  using (auth.uid() is not null);

create policy "Authenticated users can delete inspections"
  on inspections for delete
  using (auth.uid() is not null);
