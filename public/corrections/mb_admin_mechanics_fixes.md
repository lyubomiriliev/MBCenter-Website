# MB Admin Mechanics - Corrections for Claude Code

## Context

This document summarizes the requested fixes for the `mb-admin-mechanics` project. The issues affect the service user profile `service@mbcenter.bg`, the offers flow, the checks flow, the earnings pages, and the visual/price-calculation structure for mechanics and receivers.

Primary files mentioned:

- `@offers/page.tsx`
- `@offers/edit/page.tsx`
- `@checks/page.tsx`
- `@create-check/page.tsx`
- `@earnings/page.tsx`
- `@earnings/edit/page.tsx`
- `@FloatingSummary.tsx`

---

## Fix 1 - Prevent data loss when saving offers and checks

### Bulgarian request translated

Through the service profile `service@mbcenter.bg`, please check whether something can be optimized. Quite often, users fill in an offer or a check, click save, and then an error appears during saving. Everything they entered is lost and they have to fill it in again from the beginning. This applies both to offers and checks.

Affected area:

- `mb-admin-mechanics`
- `@offers/edit/page.tsx`
- `@checks/page.tsx`
- `@create-check/page.tsx`

### Required behavior

When the user fills in an offer or a check and saving fails, the form data must not be lost.

Implement safer save handling:

1. Do not clear or reset the form until the save request has succeeded.
2. Show a clear error message if the save fails.
3. Keep all entered values in the form after the error.
4. Disable the save button while saving to prevent double-submits.
5. Add proper loading/saving state and `try/catch` handling around the save request.
6. If the project already has toast notifications, show a toast/error alert on failure.
7. If possible, preserve draft values locally while the user is editing, especially for longer forms.
8. Review both offer editing/creation and check creation/update flows.

### Acceptance criteria

- If saving an offer fails, all fields remain filled in.
- If saving a check fails, all fields remain filled in.
- The user can click save again after the error without re-entering everything.
- The UI clearly communicates that saving failed.
- No existing successful save behavior is broken.

---

## Fix 2 - Add `Advance` field in earnings and deduct it from the total

### Image reference

Image 1 shows the current earnings summary where the fields are:

- Card
- Fines
- Bonus
- Cash amount / remaining amount

The requested change is to add a new field between `Card` and `Fines`.

### Bulgarian request translated

In earnings, between `Card` and `Fines`, add `Advance`. This amount should also be deducted from the total whenever it exists.

Affected files:

- `@earnings/page.tsx`
- `@earnings/edit/page.tsx`

### Required behavior

Add a new monthly deduction field:

- Bulgarian label: `Аванс (€)`
- English meaning: `Advance (€)`

The order of fields should be:

1. Card / `Карта (€)`
2. Advance / `Аванс (€)`
3. Fines / `Глоби (€)`
4. Bonus / `Бонус (€)`

The `Advance` amount must be subtracted from the employee's payable amount, just like `Card` and `Fines`.

### Suggested calculation logic

Use the existing naming conventions in the project, but the formula should follow this logic:

```ts
const totalEarned = /* existing total earned */;
const cardDeduction = Number(card || 0);
const advanceDeduction = Number(advance || 0);
const finesDeduction = Number(fines || 0);
const bonusAddition = Number(bonus || 0);

const amountToPay = totalEarned - cardDeduction - advanceDeduction - finesDeduction + bonusAddition;
```

### Required persistence

Check how `card`, `fines`, and `bonus` are currently stored. Add `advance` consistently in the same structure/database/table/document/state.

Make sure `advance` works in:

- earnings view page
- earnings edit page
- PDF generation/export, if the same totals are included there
- any monthly summary totals
- any save/update API calls

### Acceptance criteria

- `Advance` appears between `Card` and `Fines`.
- `Advance` is saved and loaded correctly.
- `Advance` is deducted from the payable amount.
- Empty `Advance` behaves as `0`.
- Existing `Card`, `Fines`, and `Bonus` behavior remains unchanged.

---

## Fix 3 - Make receiver earnings use the same visual layout as mechanics

### Image reference

Image 2 shows the receiver earnings section. Image 3 shows the mechanic earnings section and the expected visual direction.

### Bulgarian request translated

Change the receiver earnings section so it uses the same visual style as the mechanics section. Also, the input field for `Cash` / `В брой` is unnecessary - remove it. Only keep the receiver pricing/calculation logic.

Also, at the bottom, where it currently says `Remaining` / `Остатък`, change it so it matches the receiver wording: `Cash` / `В брой`.

### Affected files

Likely affected:

- `@earnings/page.tsx`
- `@earnings/edit/page.tsx`
- related shared earnings components, if any
- PDF export logic, if the receiver earnings summary is exported

### Required behavior

1. Receiver earnings should visually match the mechanics earnings design.
2. Keep the receiver-specific pricing logic.
3. Remove the unnecessary editable input field for `В брой` / `Cash` in the receiver section.
4. The cash amount should be calculated automatically, not manually typed.
5. Rename the bottom label from `Остатък` / `Remaining` to `В брой` / `Cash`, matching the receiver section terminology.
6. Do not break the current receiver calculation/pricing logic.

### Acceptance criteria

- Receiver earnings section has the same visual structure as mechanics.
- The manual `В брой` input field is removed where it is unnecessary.
- Receiver cash amount is still calculated correctly.
- The label `Остатък` is replaced with `В брой` in the relevant bottom summary.
- Mechanics earnings behavior remains unchanged.

---

## Fix 4 - Offer list date logic

### Bulgarian request translated

When an old offer is edited, it appears at the top of the offers list, but the displayed date stays as the old creation date. In the offers list, the date should be the date of the last change while it is still only an offer. If a service card has already been created, then the offers list should use the service card date.

The idea is that when opening a specific car/model later, it should be easier to see the dates on which the relevant repairs were made.

Affected files:

- `@offers/page.tsx`
- `@offers/edit/page.tsx`
- `@FloatingSummary.tsx`, if timestamps are updated from there

### Required behavior

The date shown in the offers list should follow this priority:

1. If a service card exists for the offer:
   - show the service card date.
2. If no service card exists, but the offer was edited/updated:
   - show the offer last modified date.
3. If no service card exists and the offer has never been edited:
   - show the original offer creation date.

### Important timestamp rule

Creating a service card should not incorrectly overwrite the offer's own update timestamp unless the offer itself was actually edited.

Keep separate concepts:

- offer creation date
- offer last updated date
- service card creation/date

### Acceptance criteria

- Edited offers show the last modified date in the list when there is no service card.
- Offers with service cards show the service card date in the list.
- Creating a service card does not incorrectly change the offer's update timestamp.
- Sorting and display remain consistent.

---

## Fix 5 - Add missing vehicle models 292 and 216

### Bulgarian request translated

There are missing models in the vehicle model dropdown/list. I noticed that when selecting a car model from the list, models `292` and `216` are missing.

### Required behavior

Add the missing vehicle models:

- `292`
- `216`

Also review the source model list to make sure there are no other missing models in the same dropdown.

### Acceptance criteria

- Models `292` and `216` are available in the vehicle model dropdown.
- The dropdown uses the complete source model data.
- Existing model selection behavior remains unchanged.

---

# Full Claude Code Prompt

```md
You are working in the `mb-admin-mechanics` project. Please inspect the existing implementation and fix the following issues cleanly without changing unrelated behavior.

Main files mentioned by the client:

- `@offers/page.tsx`
- `@offers/edit/page.tsx`
- `@checks/page.tsx`
- `@create-check/page.tsx`
- `@earnings/page.tsx`
- `@earnings/edit/page.tsx`
- `@FloatingSummary.tsx`

## 1. Prevent form data loss when saving offers and checks fails

In the service profile `service@mbcenter.bg`, users often fill in offers or checks, click save, and then get a save error. When this happens, everything they entered is lost and they must fill it in again.

Please review and improve the save flow in:

- `@offers/edit/page.tsx`
- `@checks/page.tsx`
- `@create-check/page.tsx`

Required behavior:

- Do not clear/reset the form until the save request succeeds.
- If saving fails, keep all entered values in the form.
- Show a clear error message/toast when saving fails.
- Disable the save button while saving to avoid double-submits.
- Wrap save logic in proper `try/catch/finally` handling.
- Make sure the user can click save again after the error without re-entering everything.
- If suitable for the existing architecture, add local draft/state preservation for long forms.

## 2. Add `Advance` / `Аванс` field in earnings

In the earnings pages, add a new deduction field between `Card` and `Fines`.

Affected files:

- `@earnings/page.tsx`
- `@earnings/edit/page.tsx`

Field label:

- Bulgarian: `Аванс (€)`
- English meaning: `Advance (€)`

Field order should be:

1. `Карта (€)` / Card
2. `Аванс (€)` / Advance
3. `Глоби (€)` / Fines
4. `Бонус (€)` / Bonus

Calculation requirement:

`Advance` must be deducted from the final payable amount whenever it exists.

Use the existing naming and data conventions, but the calculation should follow this logic:

```ts
amountToPay = totalEarned - card - advance - fines + bonus;
```

Empty values should behave as `0`.

Also make sure `advance` is saved, loaded, edited, and included in any monthly summaries or PDF exports if the existing page exports these values.

## 3. Update receiver earnings visual layout and remove unnecessary cash input

The receiver earnings section should use the same visual style/layout as the mechanics earnings section.

Keep the receiver-specific pricing/calculation logic, but change the UI:

- Make receiver earnings visually consistent with mechanics earnings.
- Remove the unnecessary editable input field for `В брой` / `Cash`.
- The cash amount should be calculated automatically, not typed manually.
- At the bottom, where the label currently says `Остатък` / `Remaining`, change it to `В брой` / `Cash`, matching the receiver terminology.
- Do not break the existing receiver calculation/pricing logic.
- Do not change mechanics behavior except where shared styles/components require safe reuse.

## 4. Fix the offers list date logic

Current issue:
When an old offer is edited, it appears at the top of the offers list, but the date displayed in the list remains the old original creation date.

Required date priority for the offers list:

1. If the offer has a service card:
   - show the service card date.
2. If the offer does not have a service card but has been edited:
   - show the offer last modified/updated date.
3. If the offer has no service card and has never been edited:
   - show the original offer creation date.

Important:
Creating a service card should not incorrectly overwrite the offer's own update timestamp unless the offer itself was actually changed.

Keep these concepts separate:

- offer creation date
- offer last updated date
- service card date

Check:

- `@offers/page.tsx`
- `@offers/edit/page.tsx`
- `@FloatingSummary.tsx`, if it participates in timestamp updates

## 5. Add missing vehicle models 292 and 216

The vehicle model dropdown/list is missing models:

- `292`
- `216`

Please find the source list/data used by the vehicle model dropdown, add these missing models, and check whether other model codes are missing from the same source.

## Final acceptance checks

Please verify all of the following before finishing:

- Failed save on offers does not erase entered data.
- Failed save on checks does not erase entered data.
- Save buttons have proper saving/loading state.
- `Аванс (€)` appears between `Карта (€)` and `Глоби (€)`.
- `Аванс` is deducted from the final payable amount.
- Receiver earnings use the same visual style as mechanics.
- The unnecessary manual `В брой` input is removed from the receiver section.
- Bottom label `Остатък` is changed to `В брой` where requested.
- Offer list date uses service card date first, then offer updated date, then offer creation date.
- Creating a service card does not incorrectly modify the offer update timestamp.
- Vehicle models `292` and `216` are available in the model dropdown.
- No unrelated behavior is changed.
```
