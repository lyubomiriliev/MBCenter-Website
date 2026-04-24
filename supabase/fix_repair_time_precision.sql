-- Normalize repair_time to the nearest minute.
-- repair_time is decimal hours (e.g. 1h 20min = 1.3333...).
-- Rounding each row to exact minute-precision ensures single-row values are
-- clean; the app-side sumHours() helper prevents float drift when aggregating.

UPDATE earnings_entries
SET repair_time = ROUND(repair_time * 60)::numeric / 60
WHERE worker_type = 'mechanic'
  AND repair_time IS NOT NULL;
