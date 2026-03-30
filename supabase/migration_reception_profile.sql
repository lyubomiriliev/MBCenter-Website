-- Migration: Add reception user account
-- Run this in the Supabase SQL editor to create the reception account
-- and its profile entry so it appears in the Earnings dropdowns.

-- Step 1: Create the auth user for the reception account
-- NOTE: You cannot create auth users via SQL directly in Supabase.
-- Go to: Authentication > Users > Invite user
-- Email: reception@mbcenter.bg
-- After creating, note the UUID (auth_id) and run Step 2.

-- Step 2: Insert the profile for the reception user
-- Replace 'REPLACE_WITH_AUTH_UUID' with the actual UUID from the auth user you created.

-- INSERT INTO profiles (auth_id, role, full_name)
-- VALUES ('REPLACE_WITH_AUTH_UUID', 'reception', 'Рецепционист')
-- ON CONFLICT (auth_id) DO UPDATE
--   SET role = 'reception',
--       full_name = COALESCE(profiles.full_name, 'Рецепционист');

-- Step 3 (alternative): If you want to use the existing service@mbcenter.bg account
-- and just update its role to 'reception', find its auth_id first:
-- SELECT id, email FROM auth.users WHERE email = 'service@mbcenter.bg';
-- Then update:
-- UPDATE profiles SET role = 'reception', full_name = 'Рецепционист' WHERE auth_id = 'FOUND_UUID';

-- Step 4: To add a new receptionist to the earnings dropdown,
-- go to Settings > add their name in "Механици" section if using the mechanics table,
-- OR create a new auth user with role='reception' in profiles.

-- Quick helper: list all current profiles and their roles
SELECT p.id, p.auth_id, p.role, p.full_name, u.email
FROM profiles p
JOIN auth.users u ON u.id = p.auth_id
ORDER BY p.role, p.full_name;
