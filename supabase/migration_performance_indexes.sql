-- Performance optimization indexes
-- Run this in your Supabase SQL Editor

-- Add index for offer_number searches (used in filters)
create index if not exists idx_offers_offer_number on offers(offer_number);

-- Add index for customer_name searches (used in filters)
create index if not exists idx_offers_customer_name on offers(customer_name);

-- Add index for customer_phone searches (used in filters)  
create index if not exists idx_offers_customer_phone on offers(customer_phone);

-- Add composite index for common query pattern (status + created_at)
create index if not exists idx_offers_status_created_at on offers(status, created_at desc);

-- Analyze tables to update statistics for query planner
analyze offers;
analyze offer_items;
analyze service_actions;
analyze clients;
analyze cars;
