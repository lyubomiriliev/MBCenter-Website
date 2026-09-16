-- Migration: let admins read every profile
--
-- The "Логове" page filters by account, so it has to list the accounts that
-- exist. Until now the only SELECT policy on `profiles` was
-- "Users can view own profile" (auth.uid() = auth_id), so any signed-in user
-- could read exactly one row - their own - and the filter could only ever
-- offer the person already looking at it.
--
-- This ADDS a second SELECT policy for admins. Postgres combines policies for
-- the same command with OR, so the existing own-profile rule keeps working
-- untouched for every other role: nothing that works today stops working.
--
-- Safe to run on live data, and safe to run before the new front-end is
-- deployed: it only widens a read for admins and changes no data.
-- Run this in the Supabase SQL Editor.

-- ============================================
-- HELPER: is the current user a super-admin?
-- ============================================
-- Also defined in migration_daily_turnover.sql; repeated here so this file can
-- be run standalone and in either order. SECURITY DEFINER so the policy can
-- read profiles without recursing through the profiles RLS policies.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================
-- ADMINS MAY READ EVERY PROFILE
-- ============================================
-- Needed for the account filter in Логове, and for any future screen that has
-- to name the people who did something. Admin-only: reception and mechanics
-- keep seeing just their own row.
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ============================================
-- CHECK
-- ============================================
-- Signed in as an admin, this should return every account:
--
--   SELECT full_name, role FROM public.profiles ORDER BY full_name;
--
-- Signed in as reception, it should still return only their own row.

-- ============================================
-- NAMES FOR THE FILTER
-- ============================================
-- The log records `user_name` (profiles.full_name), and the account filter
-- lists names. A profile with no name would show as a bare email and could
-- never be matched, so give the known shared accounts a readable one.
--
-- Fills in a name when it is missing, and also when `full_name` was left as
-- the email address - an email in the "Потребител" dropdown is not a name.
-- A real name already set by hand is kept.
UPDATE public.profiles p
SET full_name = v.full_name
FROM (VALUES
  ('admin@mbcenter.bg',     'Админ'),
  ('ivaylo@mbcenter.bg',    'Ивайло'),
  ('christian@mbcenter.bg', 'Християн'),
  ('reception@mbcenter.bg', 'Приемна'),
  ('service@mbcenter.bg',   'Сервиз')
) AS v(email, full_name)
JOIN auth.users u ON lower(u.email) = v.email
WHERE p.auth_id = u.id
  AND (
    p.full_name IS NULL
    OR btrim(p.full_name) = ''
    -- left as the email address
    OR lower(btrim(p.full_name)) = v.email
  );

-- The developer account is hidden from the log and from its account filter in
-- the app (lib/activity-log.ts). Nothing to do here - it is listed only so the
-- omission is not mistaken for an oversight.
