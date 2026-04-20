# Bug Fixes & UI Corrections — Batch 7
> Auto Repair Shop Management System | April 2026
> Read the attached PDF alongside this file — it contains reference screenshots for each fix.

---

## Fix List

| # | File | Summary |
|---|------|---------|
| 1 | `warehouse/page.tsx` | Add time (HH:MM) alongside date — show both in the Date column |
| 2 | Assyst component | Сервизен код field: make it as wide as the field above it |
| 3 | Assyst component | Код на обслужване field: make it as wide as "Оставащ пробег" above it |
| 4 | Assyst component | Сервизен код: allow many characters (no short limit); Код на обслужване: cap at 10–12 chars |
| 5 | `PartsFieldArray.tsx` | Edit mode: always load warehouse data (stock, cost, margin) without touching the offer price |
| 6 | `FloatingSummary.tsx` | Offer summary: calculate and show total delivery cost + profit from warehouse parts |
| 7 | `offers/page.tsx` | When an offer is updated, bump its date to now so it sorts to the top of the list |

---

## Fix #1 — Warehouse: Show Date + Time in Date Column

**File:** `warehouse/page.tsx`

**Fix:** The Date column currently shows only the date (DD.MM.YYYY). Change it to show both date and time:
- Format: `DD.MM.YYYY HH:MM`
- Use the `updated_at` timestamp (not `created_at`) — this way any edit to the part reflects the latest change time, which is the point of tracking it.
- If `updated_at` is not already being fetched in the warehouse query, add it to the SELECT.
- Apply to every row in the list.

---

## Fix #2 — Assyst: Сервизен код Field Width

**File:** Assyst component (wherever the Assyst Plus panel is rendered)

**Problem:** "Сервизен код" is narrower than "Оставащо време (дни)" above it. They should be the same width.

**Fix:** Make "Сервизен код" input the same width as "Оставащо време (дни)" — both should occupy the same left-column width in the grid.

---

## Fix #3 — Assyst: Код на обслужване Field Width

**File:** Assyst component

**Problem:** "Код на обслужване" is narrower than "Оставащ пробег (км)" above it. They should be the same width.

**Fix:** Make "Код на обслужване" input the same width as "Оставащ пробег (км)" — both should occupy the same right-column width in the grid. Note: the Запази button sits to the right of Код на обслужване — adjust layout so the field expands to match the column above it and the button stays in place.

---

## Fix #4 — Assyst: Character Limits on Code Fields

**File:** Assyst component

**Fix:**
- **Сервизен код**: remove any short character limit — this field can contain many characters (long service codes). Remove `maxLength` if present or raise it significantly (e.g. 100).
- **Код на обслужване**: cap at **12 characters** (`maxLength="12"`). This code is always short by nature.

---

## Fix #5 — Edit Offer Part: Always Load Warehouse Info Without Overwriting Price

**File:** `PartsFieldArray.tsx` (AddEditPartModal, edit mode)

**Problem:** When opening an existing offer part for editing, the modal shows "Вече е в склада" but does NOT load the warehouse data (stock quantity, delivery cost, margin, profit). To see this info, the user has to manually click in the part number field, wait for the dropdown, and re-select the part — but this overwrites the offer price with the warehouse sale price, losing any custom price set in the offer.

**Fix — two separate behaviors:**

**a) On modal open in edit mode:**
- When the modal opens with an existing part that has a `part_number`, immediately query `warehouse_parts` for that part number (exact match).
- If found: populate the info display fields:
  - Stock quantity (Наличност)
  - Delivery cost (Доставна цена)
  - Margin % and Profit (calculated from warehouse cost vs the **current offer price**)
- Do NOT touch the price field — keep whatever price is stored in the offer.
- Do NOT trigger the autocomplete dropdown.

**b) Margin recalculation:**
- Use the warehouse `cost_price` as the cost basis.
- Use the **offer's current price** (not the warehouse sale price) as the sale figure.
- Recalculate live on every keystroke in the price field (as per Batch 6 Fix #2).

**⚠ Critical:** The price field must never be overwritten when opening in edit mode. Only the info display (stock, cost, margin) should be populated from the warehouse. The price stays exactly as stored in the offer.

---

## Fix #6 — Offer Summary: Show Total Delivery Cost + Profit from Warehouse Parts

**File:** `FloatingSummary.tsx`

**Problem:** The floating offer summary (Обобщение) does not calculate or display delivery cost and profit from parts, even when those parts exist in the warehouse with known cost prices.

**Fix:** In the summary panel, add two new calculated rows:
- **Доставна цена на части** (Total parts delivery cost): sum of `cost_price × quantity` for all offer parts that have a matching warehouse record with a known cost_price > 0.
- **Печалба от части** (Parts profit): sum of `(offer_price - cost_price) × quantity` for the same parts.

**How to get cost_price:** When parts are loaded into the offer form, their warehouse data (including cost_price) should already be in local state after Fix #5. Use that stored cost_price. If cost_price is unknown (part not in warehouse or cost = 0), exclude that part from both calculations — do not show 0 as if it's real data.

**Display:** Add these two rows to the summary below the existing parts total. Show them only if at least one part has a known cost_price > 0. Format same as existing summary rows (label left, value right, same font/size).

---

## Fix #7 — Offers List: Bump Date on Update, Sort Updated Offers to Top

**File:** `offers/page.tsx` (and likely the offer update API/action)

**Problem:** When an existing offer is edited and saved, its date in the offers list stays at the original creation date. Old offers that get updated stay buried in the list instead of surfacing to the top.

**Fix — two parts:**

**a) Update the timestamp on save:**
- When an offer is updated (not created), set `updated_at = NOW()` on the offer record.
- Check if `updated_at` is already being set in the update logic — if not, add it explicitly.

**b) Sort by updated_at:**
- In the offers list query, change the default sort from `created_at DESC` to `updated_at DESC`.
- This means any offer that is edited will bubble to the top of the list.
- If `updated_at` doesn't exist on the offers table, add it (with a default trigger same as `warehouse_parts`), or use `created_at` as fallback only for offers that have never been updated.

**⚠ Verify:** Edit an old offer → save → confirm it now appears at the top of the offers list.

---

## Checklist — Verify Before Done

- [ ] Fix #1: Warehouse Date column shows DD.MM.YYYY HH:MM using updated_at timestamp
- [ ] Fix #2: Сервизен код field is same width as Оставащо време (дни) above it
- [ ] Fix #3: Код на обслужване field is same width as Оставащ пробег (км) above it
- [ ] Fix #4: Сервизен код has no short character limit (accepts long input); Код на обслужване capped at 12 chars
- [ ] Fix #5: Edit mode loads warehouse stock, cost, margin info without touching the offer price
- [ ] Fix #5: Margin recalculates using warehouse cost vs current offer price (not warehouse sale price)
- [ ] Fix #5: Price field never overwritten when opening edit modal
- [ ] Fix #6: Summary shows total delivery cost and profit rows when warehouse cost data is available
- [ ] Fix #6: Parts with unknown/zero cost_price excluded from summary calculations
- [ ] Fix #7: Offer updated_at is set to NOW() on every save/update
- [ ] Fix #7: Offers list sorted by updated_at DESC — updated offers appear at top
