-- MB Center Admin - Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- PROFILES TABLE (links to auth.users)
-- ============================================
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid references auth.users(id) on delete cascade unique not null,
  role text check (role in ('admin', 'mechanic')) not null default 'mechanic',
  full_name text,
  created_at timestamptz default now()
);

-- ============================================
-- CLIENTS TABLE
-- ============================================
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  created_at timestamptz default now()
);

-- ============================================
-- CARS TABLE
-- ============================================
create table if not exists cars (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  model text not null,
  year int,
  vin text,
  license_plate text,
  mileage int,
  created_at timestamptz default now()
);

-- ============================================
-- OFFERS TABLE
-- ============================================
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  offer_number text unique not null,
  client_id uuid references clients(id),
  car_id uuid references cars(id),
  -- Denormalized fields for PDF stability
  customer_name text,
  customer_phone text,
  customer_email text,
  car_model_text text,
  vin_text text,
  license_plate text,
  mileage int,
  car_year int,
  created_by_name text,
  -- Status and totals
  status text check (status in ('draft', 'sent', 'approved', 'finished', 'cancelled')) default 'draft',
  total_net decimal(10,2) default 0,
  total_vat decimal(10,2) default 0,
  total_gross decimal(10,2) default 0,
  discount_percent decimal(5,2) default 0,
  currency text default 'EUR',
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- OFFER ITEMS TABLE (Parts only)
-- ============================================
create table if not exists offer_items (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references offers(id) on delete cascade not null,
  type text check (type in ('part', 'labor')) not null,
  description text not null,
  brand text,
  part_number text,
  unit_price decimal(10,2) not null,
  quantity int default 1,
  total decimal(10,2) not null,
  sort_order int default 0
);

-- ============================================
-- SERVICE ACTIONS TABLE (Labor)
-- ============================================
create table if not exists service_actions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references offers(id) on delete cascade not null,
  action_name text not null,
  time_required_text text,
  price_per_hour_eur_net decimal(10,2) not null,
  total_eur_net decimal(10,2) not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- OFFER PAYMENTS TABLE (Prepayments)
-- ============================================
create table if not exists offer_payments (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references offers(id) on delete cascade not null,
  amount_eur_net decimal(10,2) not null,
  note text,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table profiles enable row level security;
alter table clients enable row level security;
alter table cars enable row level security;
alter table offers enable row level security;
alter table offer_items enable row level security;
alter table service_actions enable row level security;
alter table offer_payments enable row level security;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles: Users can view their own profile
create policy "Users can view own profile" 
  on profiles for select 
  using (auth.uid() = auth_id);

-- Profiles: Users can update their own profile
create policy "Users can update own profile" 
  on profiles for update 
  using (auth.uid() = auth_id);

-- Clients: Authenticated users can manage clients
create policy "Authenticated users can view clients" 
  on clients for select 
  using (auth.uid() is not null);

create policy "Authenticated users can insert clients" 
  on clients for insert 
  with check (auth.uid() is not null);

create policy "Authenticated users can update clients" 
  on clients for update 
  using (auth.uid() is not null);

create policy "Authenticated users can delete clients" 
  on clients for delete 
  using (auth.uid() is not null);

-- Cars: Authenticated users can manage cars
create policy "Authenticated users can view cars" 
  on cars for select 
  using (auth.uid() is not null);

create policy "Authenticated users can insert cars" 
  on cars for insert 
  with check (auth.uid() is not null);

create policy "Authenticated users can update cars" 
  on cars for update 
  using (auth.uid() is not null);

create policy "Authenticated users can delete cars" 
  on cars for delete 
  using (auth.uid() is not null);

-- Offers: Authenticated users can manage offers
create policy "Authenticated users can view offers" 
  on offers for select 
  using (auth.uid() is not null);

create policy "Authenticated users can insert offers" 
  on offers for insert 
  with check (auth.uid() is not null);

create policy "Authenticated users can update offers" 
  on offers for update 
  using (auth.uid() is not null);

create policy "Authenticated users can delete offers" 
  on offers for delete 
  using (auth.uid() is not null);

-- Offer Items: Authenticated users can manage offer items
create policy "Authenticated users can view offer_items" 
  on offer_items for select 
  using (auth.uid() is not null);

create policy "Authenticated users can insert offer_items" 
  on offer_items for insert 
  with check (auth.uid() is not null);

create policy "Authenticated users can update offer_items" 
  on offer_items for update 
  using (auth.uid() is not null);

create policy "Authenticated users can delete offer_items" 
  on offer_items for delete 
  using (auth.uid() is not null);

-- Service Actions: Authenticated users can manage service actions
create policy "Authenticated users can view service_actions" 
  on service_actions for select 
  using (auth.uid() is not null);

create policy "Authenticated users can insert service_actions" 
  on service_actions for insert 
  with check (auth.uid() is not null);

create policy "Authenticated users can update service_actions" 
  on service_actions for update 
  using (auth.uid() is not null);

create policy "Authenticated users can delete service_actions" 
  on service_actions for delete 
  using (auth.uid() is not null);

-- Offer Payments: Authenticated users can manage offer payments
create policy "Authenticated users can view offer_payments" 
  on offer_payments for select 
  using (auth.uid() is not null);

create policy "Authenticated users can insert offer_payments" 
  on offer_payments for insert 
  with check (auth.uid() is not null);

create policy "Authenticated users can update offer_payments" 
  on offer_payments for update 
  using (auth.uid() is not null);

create policy "Authenticated users can delete offer_payments" 
  on offer_payments for delete 
  using (auth.uid() is not null);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate 10-digit offer number
create or replace function generate_offer_number()
returns text as $$
declare
  offer_num text;
  random_num bigint;
  max_attempts int := 10;
  attempt int := 0;
begin
  loop
    -- Generate random 10-digit number (1000000000 to 9999999999)
    random_num := floor(1000000000 + random() * 9000000000)::bigint;
    offer_num := random_num::text;
    
    -- Check if this number already exists
    if not exists (select 1 from offers where offer_number = offer_num) then
      return offer_num;
    end if;
    
    attempt := attempt + 1;
    if attempt >= max_attempts then
      raise exception 'Unable to generate unique offer number after % attempts', max_attempts;
    end if;
  end loop;
end;
$$ language plpgsql;

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for offers updated_at
create trigger update_offers_updated_at
  before update on offers
  for each row
  execute function update_updated_at_column();

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_offers_status on offers(status);
create index if not exists idx_offers_created_at on offers(created_at desc);
create index if not exists idx_offers_client_id on offers(client_id);
create index if not exists idx_offer_items_offer_id on offer_items(offer_id);
create index if not exists idx_service_actions_offer_id on service_actions(offer_id);
create index if not exists idx_offer_payments_offer_id on offer_payments(offer_id);
create index if not exists idx_cars_client_id on cars(client_id);

-- Performance indexes for search and filtering
create index if not exists idx_offers_offer_number on offers(offer_number);
create index if not exists idx_offers_customer_name on offers(customer_name);
create index if not exists idx_offers_customer_phone on offers(customer_phone);
create index if not exists idx_offers_status_created_at on offers(status, created_at desc);

-- ============================================
-- TRIGGER TO CREATE PROFILE ON USER SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (auth_id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'mechanic'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

