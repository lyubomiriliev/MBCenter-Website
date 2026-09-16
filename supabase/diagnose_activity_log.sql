-- Diagnostic: what is in "Логове"?
--
-- Read-only. Run in the Supabase SQL Editor.

-- 1. How many entries, and the newest ones.
SELECT count(*) AS total FROM public.activity_log;

SELECT created_at, user_name, entity_type, action, entity_label, changes
FROM public.activity_log
ORDER BY created_at DESC
LIMIT 20;

-- 2. Per section, so it is obvious which screens are logging.
SELECT entity_type, count(*) AS entries, max(created_at) AS last_entry
FROM public.activity_log
GROUP BY 1
ORDER BY entries DESC;

-- 3. Per account. oliverqueeneb@gmail.com is deliberately never logged.
SELECT coalesce(user_name, user_email, '(няма име)') AS account,
       count(*) AS entries
FROM public.activity_log
GROUP BY 1
ORDER BY entries DESC;

-- 4. Does entity_type still carry the old two-value CHECK?
--    If this returns a constraint mentioning 'daily_turnover' and 'offer',
--    run supabase/migration_activity_log_sections.sql — without it every
--    write from склад / заработки / отпуски is REJECTED.
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.activity_log'::regclass
  AND contype = 'c';
