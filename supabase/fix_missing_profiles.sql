-- Fix Missing Profiles
-- Run this in Supabase SQL Editor if users exist without profiles

-- Create profiles for any auth.users that don't have a profile
INSERT INTO public.profiles (auth_id, full_name, role)
SELECT 
  id as auth_id,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  'mechanic' as role
FROM auth.users
WHERE id NOT IN (SELECT auth_id FROM public.profiles WHERE auth_id IS NOT NULL)
ON CONFLICT (auth_id) DO NOTHING;

-- Verify the fix
SELECT 
  u.id as user_id,
  u.email,
  p.id as profile_id,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.auth_id
ORDER BY u.created_at DESC;



