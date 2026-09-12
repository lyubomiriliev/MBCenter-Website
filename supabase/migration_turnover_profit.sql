-- Migration: parts cost on turnover rows, for the monthly profit figure
--
-- Profit = turnover - what the parts cost us. The cost is snapshotted onto the
-- row when the entry is created, so later price changes in the warehouse or the
-- offer cannot retroactively rewrite a past month's profit.
--
-- Safe to run on live data: adds one nullable-by-default column and backfills
-- existing service-card rows from their linked offer.
-- Run this in the Supabase SQL Editor.

ALTER TABLE daily_turnover
  ADD COLUMN IF NOT EXISTS parts_cost numeric(10,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN daily_turnover.parts_cost IS
  'Cost of parts for this job at the time it was recorded. Profit = amount - parts_cost.';

-- Backfill service-card rows from the parts on their offer.
UPDATE daily_turnover dt
SET parts_cost = COALESCE(sub.cost, 0)
FROM (
  SELECT oi.offer_id,
         SUM(COALESCE(oi.cost_price, 0) * COALESCE(oi.quantity, 1)) AS cost
  FROM offer_items oi
  WHERE oi.type = 'part'
  GROUP BY oi.offer_id
) sub
WHERE dt.offer_id = sub.offer_id
  AND dt.parts_cost = 0;
