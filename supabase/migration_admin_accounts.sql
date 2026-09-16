-- Migration: personal admin accounts (Ивайло + Християн)
--
-- The two auth users already exist (created in the Supabase Dashboard). This
-- only gives each one an admin profile, so that:
--   * they get the same rights as the shared admin@mbcenter.bg account, and
--   * every entry in Логове is attributed to a person, not to "Админ".
--
-- The shared admin@mbcenter.bg account is deliberately left untouched.
--
-- Safe to run on live data and before the new front-end is deployed: it only
-- inserts/updates the two named profiles and changes nothing else. Re-running
-- it is a no-op.
-- Run this in the Supabase SQL Editor.

-- ============================================
-- PROFILES FOR THE TWO ACCOUNTS
-- ============================================
-- Matched by email against auth.users, so no ids need to be pasted by hand.
-- If an account does not exist yet, its row is simply skipped — create the
-- user in Authentication > Users and run this file again.
INSERT INTO public.profiles (auth_id, role, full_name)
SELECT u.id, 'admin', v.full_name
FROM (VALUES
  ('ivaylo@mbcenter.bg',    'Ивайло'),
  ('christian@mbcenter.bg', 'Християн')
) AS v(email, full_name)
JOIN auth.users u ON lower(u.email) = v.email
ON CONFLICT (auth_id) DO UPDATE
  SET role = 'admin',
      -- Keep a name that was already set by hand; only fill in a missing one.
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

-- ============================================
-- CHECK
-- ============================================
-- Confirm both accounts came out as admins:
--
--   SELECT u.email, p.role, p.full_name
--   FROM public.profiles p
--   JOIN auth.users u ON u.id = p.auth_id
--   WHERE lower(u.email) IN ('ivaylo@mbcenter.bg', 'christian@mbcenter.bg');
--
-- Expect two rows, both with role = 'admin'.
--
-- Note: profiles.role carries a CHECK constraint from the original schema that
-- allows only ('admin', 'mechanic'). 'admin' satisfies it, so nothing needs to
-- change here — but be aware of it before introducing any other role.
