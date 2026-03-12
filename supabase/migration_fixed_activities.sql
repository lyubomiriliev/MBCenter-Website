-- Fixed Activities Table
-- Shared preset service actions (visible to all users)
create table if not exists fixed_activities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_eur numeric(10,2) not null default 0,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- RLS policies
alter table fixed_activities enable row level security;

create policy "Anyone authenticated can read fixed_activities"
  on fixed_activities for select
  to authenticated
  using (true);

create policy "Anyone authenticated can insert fixed_activities"
  on fixed_activities for insert
  to authenticated
  with check (true);

create policy "Anyone authenticated can update fixed_activities"
  on fixed_activities for update
  to authenticated
  using (true);

create policy "Anyone authenticated can delete fixed_activities"
  on fixed_activities for delete
  to authenticated
  using (true);
