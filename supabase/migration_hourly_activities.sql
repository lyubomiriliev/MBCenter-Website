create table if not exists public.hourly_activities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_per_hour_eur numeric(10, 2) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.hourly_activities enable row level security;

create policy "Authenticated users can read hourly_activities"
  on public.hourly_activities for select
  to authenticated
  using (true);

create policy "Authenticated users can insert hourly_activities"
  on public.hourly_activities for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update hourly_activities"
  on public.hourly_activities for update
  to authenticated
  using (true);

create policy "Authenticated users can delete hourly_activities"
  on public.hourly_activities for delete
  to authenticated
  using (true);
