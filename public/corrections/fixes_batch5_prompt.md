# Bug Fixes & UI Corrections — Batch 5
> Auto Repair Shop Management System | April 2026
> Read the attached PDF alongside this file — it contains reference screenshots for each fix.

---

## Fix List

| # | File | Summary |
|---|------|---------|
| 1 | `offers/edit/page.tsx` | Show both offer number AND service card number in the header, labeled |
| 2 | `warehouse/page.tsx` | Add sort options (Status, Amount, Date); default sort = newest date |
| 3 | `warehouse/page.tsx` | Replace simple prev/next pagination with full numbered pagination component |
| 4 | `warehouse/page.tsx` | Pagination footer text: "Показване на X до Y от Z **части**" (not оферти) |
| 5 | `create-offer/page.tsx` | Manufacturer field not auto-filling from warehouse when part is non-Mercedes |
| 6 | `earnings/page.tsx` | Georgi's earnings panel has broken/compressed layout — fix to match Lyubo's |
| 7 | `earnings/page.tsx` | Add "Бонус (€)" field after "Глоби (€)" |
| 8 | `earnings/page.tsx` | Bonus field appears in PDF only when a value is entered |
| 9 | `earnings/page.tsx` | In the PDF, "Бонус (€)" row styled same as "Карта" row but bold |

---

## Fix #1 — Offer Edit Header: Show Both Numbers

**File:** `offers/edit/page.tsx`

**Problem:** The header currently shows only the offer number (e.g. `№3106113538`). When a service card has been created from this offer, the service card has its own number — but the header still shows only the offer number, giving no indication of the linked service card number.

**Fix:** Display both numbers in the header with clear labels:
- `Оферта №3106113538`
- `Сервизна карта №XXXXXXXXXX`

Show both on the same line or stacked — your choice based on available space. If no service card exists yet, show only the offer number (current behavior). Labels must make clear which number is which.

**How to find the service card number:** Query the service cards table for a record linked to this offer's ID. Check how the existing relationship is structured in the DB (likely `offer_id` foreign key on the service cards table or equivalent).

---

## Fix #2 — Warehouse: Add Sort Options

**File:** `warehouse/page.tsx`

**Problem:** The warehouse list has no sort controls. The offers list already has Status ↑↓, Sum ↑↓, Date ↓ sort buttons — add the same pattern to the warehouse page.

**Fix:**
- Add sortable column headers matching the style in the offers table (see reference screenshot in PDF — the row showing Статус ↑↓ / Сума ↑↓ / Дата ↓).
- Default sort: **newest date first** (`created_at DESC`).
- Sortable columns: **Date** (primary), **Status** (stock level), **Sale Price**.
- Reuse the exact same sort UI component/pattern already used in the offers list.

---

## Fix #3 — Warehouse: Replace Pagination with Full Numbered Component

**File:** `warehouse/page.tsx`

**Problem:** Current warehouse pagination is a minimal prev/next only (shows "2 / 3" with ← →). The offers list uses a full numbered pagination component with: Предишна | 1 | 2 | … | 5 | Следваща.

**Fix:** Replace the simple pagination with the full component already used in the offers list. It must show: Previous button, page number buttons, ellipsis for large ranges, last page button, Next button. Reuse the existing pagination component — do not build a new one.

---

## Fix #4 — Warehouse: Pagination Footer Text

**File:** `warehouse/page.tsx`

**Fix:** The text below the pagination must read:
`Показване на X до Y от Z части`

Not "оферти" — the warehouse deals with **части** (parts). Update the translation key or the hardcoded string, whichever applies.

---

## Fix #5 — Create Offer: Manufacturer Not Auto-filling from Warehouse

**File:** `create-offer/page.tsx` (specifically `AddEditPartModal` inside `PartsFieldArray.tsx`)

**Problem:** When adding a part to an offer by selecting it from the warehouse dropdown, the Manufacturer field only populates correctly when the part is branded "MERCEDES". For any other manufacturer (e.g. FÖRCH), the field does not reflect the warehouse value — it stays as MERCEDES or stays empty.

**Root cause:** The auto-fill logic on warehouse selection likely hardcodes `manufacturer = 'MERCEDES'` or skips setting it. It should use `match.manufacturer` from the selected warehouse record.

**Fix:** When a warehouse part is selected from the dropdown autocomplete:
- Set `manufacturer` field = `match.manufacturer` (the actual stored value, e.g. "FÖRCH").
- This must work for ALL manufacturers, not just MERCEDES.
- Verify the field visibly updates in the modal when a non-Mercedes warehouse part is selected.

---

## Fix #6 — Earnings Page: Georgi's Panel Layout Broken

**File:** `earnings/page.tsx`

**Problem:** Georgi Mihailov's earnings panel has compressed/broken column widths — the hours column is squashed and the overall layout looks different from Lyubo Kirov's panel which renders correctly. Both mechanics should have identical layout.

**Fix:** Make Georgi's panel layout identical to Lyubo's. Check what is different between the two rendered panels — likely a container width, column width, or CSS class difference caused by data length (e.g. longer car model names pushing columns). Fix so the layout is consistent regardless of content length. Column widths must be fixed/constrained, not content-driven.

**Reference:** See PDF screenshots — Georgi's panel (compressed) vs Lyubo's panel (correct layout). Match Lyubo's exactly.

---

## Fix #7 — Earnings Page: Add "Бонус (€)" Field

**File:** `earnings/page.tsx`

**Fix:** Add a new input field "Бонус (€)" in the МЕСЕЧНИ УДРЪЖКИ (Monthly Deductions) section, positioned immediately after the "Глоби (€)" field.

- Same styling as the existing Глоби field (label + number input).
- Value is optional — default empty / 0.
- The bonus amount should be stored and used in the В БРОЙ calculation.
- **Calculation logic:** В БРОЙ = Нето 50% - Карта - Глоби + Бонус
  (bonus adds to the payout, deductions subtract).

---

## Fix #8 — Earnings PDF: Bonus Appears Only When Filled

**File:** `earnings/page.tsx` (PDF generation section)

**Fix:** The "Бонус (€)" row must appear in the generated PDF **only if** a bonus value has been entered (value > 0 or non-empty). If the bonus field is empty or 0, the PDF should look exactly as it does today — no bonus row rendered at all.

---

## Fix #9 — Earnings PDF: Bonus Row Styling

**File:** `earnings/page.tsx` (PDF generation section)

**Fix:** When the bonus row IS shown in the PDF, style it to match the "Карта" row exactly — same font, same size, same layout — but with **bold text** for both the label "Бонус (€)" and the amount.

Position in PDF: immediately below the "Карта" row.

---

## Checklist — Verify Before Done

- [ ] Fix #1: Header shows both offer number AND service card number with labels; single offer (no card) shows only offer number
- [ ] Fix #2: Warehouse sort controls added; default sort is newest date first
- [ ] Fix #3: Full numbered pagination in warehouse matches offers pagination exactly
- [ ] Fix #4: Pagination footer says "части" not "оферти"
- [ ] Fix #5: Selecting a non-Mercedes warehouse part fills Manufacturer with the actual stored value
- [ ] Fix #6: Georgi's earnings panel layout matches Lyubo's exactly
- [ ] Fix #7: "Бонус (€)" field exists after "Глоби (€)" and affects В БРОЙ calculation
- [ ] Fix #8: Bonus row absent from PDF when bonus is 0 or empty
- [ ] Fix #9: Bonus row in PDF is bold, positioned below Карта, same font/size as Карта row
