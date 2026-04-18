# Bug Fixes & UI Corrections — Batch 6
> Auto Repair Shop Management System | April 2026
> Read the attached PDF alongside this file — it contains reference screenshots for each fix.

---

## Fix List

| # | File(s) | Summary |
|---|---------|---------|
| 1 | `PartsFieldArray.tsx` (offers) | Replace auto-create with explicit "Добави в склада" button + delivery price prompt |
| 2 | `PartsFieldArray.tsx` (offers) | Margin/Profit values must recalculate when user manually changes price after warehouse auto-fill |
| 3 | Assyst component | Add placeholders: Сервизен код → "W0W", Код на обслужване → "B2" |
| 4 | Mechanic account / sidebar | Remove "Склад" (Warehouse) button/link from mechanic role |
| 5 | `warehouse/page.tsx` (table header) | Center header text vertically; increase font size 1–2px; send screenshot after |
| 6 | Offers list header | Increase font size 1px + bold in the offers list header only; send screenshot after |
| 7 | Warehouse part save toast | Change toast text to "Запазено" (same as offers) |
| 8 | Service card creation | Deduct warehouse stock quantities when a service card is created from an offer |
| 9 | `WarehousePartModal.tsx` | Reorder fields: Quantity on same row as Manufacturer; Replaced By on same row as Part Number; send screenshot after |

---

## Fix #1 — Replace Auto-create with Explicit "Добави в склада" Button

**File:** `PartsFieldArray.tsx` (AddEditPartModal, inside offer creation/edit)

**Current behavior (to remove):** When a new part is added to an offer and the part number doesn't exist in the warehouse, a warehouse entry is silently auto-created in the background.

**New behavior:**
- Remove the silent auto-create logic entirely.
- Add a **"Добави в склада" (Add to Warehouse)** button inside the AddEditPartModal.
- The button must be visible both when creating a new offer part AND when editing an existing offer part — so the user can add it to the warehouse at any time, not just at creation.
- When clicked:
  1. Show a small prompt/inline field asking for **Доставна цена (Delivery Price)**.
  2. After the user enters the delivery price and confirms, create the warehouse entry with all available data from the modal (name, part number, manufacturer, sale price from the offer, delivery price from the prompt, quantity = 0).
  3. Show a success message: "Частта е добавена в склада."
- If the part number already exists in the warehouse, the button should either be hidden or show "Вече е в склада" (disabled state) — do not create duplicates.
- Check warehouse existence by querying `warehouse_parts` on `part_number` when the modal opens or when part number changes.

---

## Fix #2 — Margin/Profit Must Recalculate When Price is Manually Changed

**File:** `PartsFieldArray.tsx` (AddEditPartModal)

**Problem:** When a warehouse part is selected via the autocomplete dropdown, it auto-fills the price and shows the warehouse Margin % and Profit. But if the user then manually changes the price in the modal, the Margin and Profit values do not update — they stay frozen at the warehouse values.

**Fix:** Margin % and Profit must always recalculate live based on:
- **Delivery price** = warehouse cost_price (from the selected warehouse record, stored in local state)
- **Sale price** = the current value in the Цена/бр field (whatever the user has typed)

Formula:
- Margin % = ((sale - cost) / cost) × 100
- Profit = sale - cost

Recalculate on every keystroke in the price field. If cost is 0 or unknown, show "—" for Margin % and raw diff for Profit.

The warehouse cost_price must be stored in local state when a warehouse part is selected, and used for all subsequent calculations even after the user edits the price.

---

## Fix #3 — Assyst: Add Placeholders to Code Fields

**File:** Assyst component (wherever the Assyst Plus panel is rendered)

**Fix:** Add placeholder text to two fields:
- **Сервизен код** input → placeholder: `W0W`
- **Код на обслужване** input → placeholder: `B2`

These are just HTML placeholder attributes — the fields remain editable. No other logic changes.

---

## Fix #4 — Remove "Склад" from Mechanic Account

**File:** Sidebar navigation component (`AdminSidebar.tsx` or equivalent) + any mechanic-specific nav

**Fix:** The "Склад" (Warehouse) nav link must NOT be visible or accessible to users with the mechanic role.

- Find where the Warehouse nav item was added during the Warehouse module implementation.
- Add a role check: hide the link when the current user's role is `mechanic`.
- The link must remain visible for admin and reception roles.
- Also check if there are any direct route guards on `/warehouse` — add a redirect for mechanics if not already present.

---

## Fix #5 — Warehouse Table Header: Center Vertically + Increase Font Size

**File:** `warehouse/page.tsx` (table header row)

**Fix:**
- Vertically center all header text within the header row (currently stuck to the bottom).
- Increase font size by 1–2px compared to the current header font size.
- Apply only to the warehouse table header — not the data rows.

**After making this change: send a screenshot of the result before proceeding to the next fix.** The user wants to review it visually.

---

## Fix #6 — Offers List Header: Font Size +1px and Bold

**File:** Offers list table header (wherever the offers table header is rendered — `OffersTable.tsx` or similar)

**Fix:**
- Increase the font size in the offers list table header by 1px.
- Make the header text bold.
- Apply only to the offers list header row — not the warehouse header, not the data rows.

**After making this change: send a screenshot of the result before proceeding.** The user wants to review it visually.

---

## Fix #7 — Warehouse Part Save Toast: Change Text to "Запазено"

**File:** `WarehousePartModal.tsx` + anywhere a toast fires after saving a warehouse part

**Problem:** When adding or editing a warehouse part and saving, the toast notification shows "Редактирай част ✓" (or similar). This is wrong.

**Fix:** Change the success toast text to **"Запазено"** — exactly the same word used in the offers flow. Find all toast calls that fire on successful warehouse part save (create and update) and update the message string.

---

## Fix #8 — Deduct Warehouse Stock When Service Card is Created (CRITICAL)

**Files:** Service card creation logic — wherever a service card is created from an offer (likely `create-service-card` route, API route, or server action)

**Behavior:**
- When a service card is created from an offer, find all parts in that offer's `offer_items` that have a matching `part_number` in `warehouse_parts`.
- For each match: subtract the offer line item quantity from `warehouse_parts.quantity`.
- Example: offer has 2x part A0001 → warehouse has 11 in stock → after service card creation → warehouse shows 9.
- Stock cannot go below 0 — if the deduction would result in negative stock, set quantity to 0 (do not allow negative).
- This deduction must happen **only once**, at the moment the service card is created — not on offer save, not on offer edit.
- Run inside a transaction if possible, or as a batch upsert, to avoid partial updates.
- If a part number from the offer doesn't exist in the warehouse — skip it silently, do not error.
- Do not show any UI notification for this — it happens silently in the background.

**⚠ This is the most critical fix in this batch. Test explicitly:**
1. Create an offer with a part that exists in the warehouse (e.g. qty 11 in warehouse, qty 2 in offer).
2. Create a service card from that offer.
3. Verify warehouse quantity is now 9.
4. Verify creating the service card again does NOT deduct again (idempotency check — consider adding a flag or checking if already deducted).

---

## Fix #9 — WarehousePartModal: Reorder Fields into 2-Column Rows

**File:** `WarehousePartModal.tsx`

**Current layout (single column):**
1. Part Name (full width)
2. Part Number (full width)
3. Manufacturer (full width)
4. Quantity (full width)
5. Cost Price + Sale Price (already 2-col)
6. Replaced By (full width)
7. Margin + Profit (already 2-col)

**New layout:**
1. Part Name (full width)
2. Part Number | Replaced By (split 50/50 on same row)
3. Manufacturer | Quantity (split 50/50 on same row)
4. Cost Price | Sale Price (unchanged — already 2-col)
5. Margin + Profit (unchanged)

This makes the modal more compact and matches the style of the offer part modal.

**After making this change: send a screenshot of the result before proceeding.** The user wants to review the layout visually.

---

## Checklist — Verify Before Done

- [ ] Fix #1: "Добави в склада" button visible in AddEditPartModal (both new and edit modes); prompts for delivery price; creates warehouse entry; shows success message; disabled/hidden if part already in warehouse
- [ ] Fix #1: Silent auto-create background logic removed entirely
- [ ] Fix #2: Margin and Profit recalculate on every keystroke in price field after warehouse auto-fill; warehouse cost_price stored in local state
- [ ] Fix #3: Сервизен код has placeholder "W0W"; Код на обслужване has placeholder "B2"
- [ ] Fix #4: Warehouse nav link hidden for mechanic role; visible for admin and reception
- [ ] Fix #5: Warehouse header text vertically centered + font size increased; **screenshot sent**
- [ ] Fix #6: Offers list header font +1px and bold; **screenshot sent**
- [ ] Fix #7: Toast on warehouse part save shows "Запазено" (both create and update)
- [ ] Fix #8: Service card creation deducts warehouse quantities for matching parts
- [ ] Fix #8: Stock never goes below 0
- [ ] Fix #8: Deduction happens only once per service card creation (not on re-edit)
- [ ] Fix #8: Parts not in warehouse are silently skipped
- [ ] Fix #9: Part Number and Replaced By on same row; Manufacturer and Quantity on same row; **screenshot sent**
