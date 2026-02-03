-- Performance optimization for auth queries
-- Add index on profiles.auth_id for faster profile lookups

create index if not exists idx_profiles_auth_id on profiles(auth_id);

-- Analyze tables for query planner optimization
analyze profiles;
