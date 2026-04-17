# Warehouse Module — Implementation Prompt

## Context

You are working on the **MBCenter Next.js admin app** at `/Users/lyubomirsmacbookpro/Desktop/mbcenter/mbcenter-web`.

**Stack:** Next.js 14 (App Router) · Supabase (direct client, no API routes) · React Hook Form + Zod · TanStack Query · Tailwind CSS · shadcn/ui · next-intl

The customer has submitted requirements (translated from Bulgarian) for a new **Warehouse / Parts Inventory** module. This document is the complete spec + build prompt. Do everything in the order listed. Do not skip steps. Do not create files not listed here.

---

## What the customer wants (translated from Bulgarian)

1. A **"Warehouse" button** in the left sidebar — obvious, opens a warehouse page.
2. Inside: an **"Add Part"** button; the add/edit dialog resembles the existing offer-part modal.
3. Fields: Part Name, Part Number, Manufacturer (default = `MERCEDES`), Quantity, **Cost Price**, **Sale Price**. The dialog also computes and shows **Margin %** and **Profit (EUR)** live. These also appear in the main list.
4. A **"Replaced By"** field (substitute part number) on every part — used in search too.
5. Main list columns (exact order): **Name · Part Number · Manufacturer · Qty · Cost Price · Sale Price · Margin (% and amount) · Status · Date · Actions**
6. **Status badges** (same glowing style as offer statuses): Green = qty > 3, Yellow = qty 1–3, Red = qty = 0.
7. **Inline quantity edit** — clicking the qty number opens the same QuantityPopover that already exists in `PartsFieldArray.tsx`.
8. **Offer → Warehouse auto-fill**: in the offer form part-number field, typing triggers a warehouse lookup; selecting a result auto-fills Name + Sale Price, and shows stock qty + margin.
9. **Offer → Warehouse auto-create**: when adding a part to an offer that has NO warehouse match, silently create a warehouse entry (qty=0, cost=0, sale price from offer).
10. **Search** on main page: searches Name, Part Number, and Replaced-By simultaneously.
11. **Search state persists** when navigating away and back (sessionStorage, same pattern as offers).
12. **Export/Import** via Excel (.xlsx): export all parts → user edits → import back (upsert by part_number).
13. **"Transfer Data" button** on every existing offer edit page: user picks a target offer number, and the current offer's parts + labor lines are **appended** to that offer (car/client data NOT copied).

---

## Implementation order — follow exactly

### STEP 1 — Database

Add to `supabase/schema.sql` and run in the Supabase SQL editor:

```sql
CREATE TABLE warehouse_parts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  part_number  TEXT NOT NULL,
  manufacturer TEXT NOT NULL DEFAULT 'MERCEDES',
  quantity     INTEGER NOT NULL DEFAULT 0,
  cost_price   NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price   NUMERIC(10,2) NOT NULL DEFAULT 0,
  replaced_by  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX warehouse_parts_part_number_idx ON warehouse_parts (part_number);
CREATE INDEX warehouse_parts_created_at_idx ON warehouse_parts (created_at DESC);

ALTER TABLE warehouse_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage warehouse"
  ON warehouse_parts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER warehouse_parts_updated_at
  BEFORE UPDATE ON warehouse_parts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### STEP 2 — TypeScript types

Add to `types/database.ts`:

```typescript
export interface WarehousePart {
  id: string;
  name: string;
  part_number: string;
  manufacturer: string;
  quantity: number;
  cost_price: number;
  sale_price: number;
  replaced_by: string | null;
  created_at: string;
  updated_at: string;
}
export type WarehousePartInsert = Omit<WarehousePart, 'id' | 'created_at' | 'updated_at'>;
export type WarehousePartUpdate = Partial<WarehousePartInsert>;
```

---

### STEP 3 — Zod schema

Create `lib/schemas/warehouse.ts`:

```typescript
import { z } from "zod";

export const warehousePartSchema = z.object({
  name: z.string().min(1, "Part name is required"),
  part_number: z.string().min(1, "Part number is required"),
  manufacturer: z.string().default("MERCEDES"),
  quantity: z.number().int().min(0, "Quantity must be 0 or more"),
  cost_price: z.number().min(0, "Cost price must be 0 or more"),
  sale_price: z.number().min(0, "Sale price must be 0 or more"),
  replaced_by: z.string().optional(),
});

export type WarehousePartFormData = z.infer<typeof warehousePartSchema>;
```

---

### STEP 4 — Data hook

Create `hooks/useWarehouseParts.ts`. Follow the exact same pattern as `hooks/useOffers.ts`:
- `useWarehouseParts(filters)` — TanStack Query `useQuery`, queryKey `['warehouse_parts', filters]`, pageSize 50
- Filter: `supabase.from('warehouse_parts').select('*').or('name.ilike.%{q}%,part_number.ilike.%{q}%,replaced_by.ilike.%{q}%')` when search is non-empty
- `useCreateWarehousePart()` — `useMutation`, inserts one row; invalidates queryKey
- `useUpdateWarehousePart()` — `useMutation`, updates by id; invalidates queryKey
- `useDeleteWarehousePart()` — `useMutation`, deletes by id; invalidates queryKey
- `useUpsertWarehouseParts(rows[])` — for bulk import: `supabase.from('warehouse_parts').upsert(rows, { onConflict: 'part_number' })`
- Export helper: `async function exportWarehouseToXlsx(parts: WarehousePart[])` — uses the `xlsx` npm package; generates `warehouse_backup_YYYY-MM-DD.xlsx`

---

### STEP 5 — Extract shared QuantityPopover

Move the `QuantityPopover` component from lines 40–122 of `components/admin/forms/PartsFieldArray.tsx` into a new file `components/admin/shared/QuantityPopover.tsx`. Export it as a named export. Update the import in `PartsFieldArray.tsx`. The component signature and behaviour must stay identical.

---

### STEP 6 — StockStatusBadge component

Create `components/admin/warehouse/StockStatusBadge.tsx`:

```tsx
// Props: qty: number
// qty > 3  → "In Stock"    / "Налично"           → bg-green-500/20 text-green-400 border-green-500/30
// qty 1–3  → "Limited"     / "Ограничена нал."   → bg-yellow-500/20 text-yellow-400 border-yellow-500/30
// qty = 0  → "Out of Stock"/ "Няма наличност"    → bg-red-500/20 text-red-400 border-red-500/30
```

Use the `Badge` component from `components/ui/badge.tsx`. Use `useTranslations("admin.warehouse")` for labels. Follow `components/admin/offers/OfferStatusBadge.tsx` exactly for structure.

---

### STEP 7 — WarehousePartModal component

Create `components/admin/warehouse/WarehousePartModal.tsx`.

Model it after `AddEditPartModal` in `components/admin/forms/PartsFieldArray.tsx` (lines 124–310). Use shadcn `Dialog`, `Input`, `Label`, `Button`.

Fields (in order):
1. Part Name (required)
2. Part Number (required)
3. Manufacturer (default = `"MERCEDES"`)
4. Quantity (int ≥ 0)
5. Cost Price EUR (decimal ≥ 0)
6. Sale Price EUR (decimal ≥ 0)
7. Replaced By (optional)
8. **Read-only computed row:** Margin % | Profit EUR — update live as prices change
   - Margin %: `cost_price === 0 ? "—" : ((sale_price - cost_price) / cost_price * 100).toFixed(1) + "%"`
   - Profit: `(sale_price - cost_price).toFixed(2) + " €"`

Validate with `warehousePartSchema` on confirm. Props: `open`, `onOpenChange`, `initialValues: WarehousePart | null`, `onConfirm(data)`.

---

### STEP 8 — Warehouse page

Create `app/[locale]/(admin)/mb-admin/warehouse/page.tsx`.

Structure:
```
[Page header: "Warehouse"]
[Search input] [Export button] [Import button (file input)] [Add Part button]
[Table]
  Header row (sticky): Name | Part# | Manufacturer | Qty | Cost | Sale | Margin | Status | Date | Actions
  Data rows: one per warehouse part
    - Qty cell: wrapped in QuantityPopover; on confirm calls useUpdateWarehousePart({quantity: N})
    - Status cell: <StockStatusBadge qty={part.quantity} />
    - Margin cell: show "X.X% / €Y.YY" (two lines, smaller text for the euro amount)
    - Date cell: format created_at as DD.MM.YYYY
    - Actions: Edit icon (opens WarehousePartModal pre-filled) + Delete icon (confirm dialog)
[Empty state: "No parts found" + Add Part CTA]
[Pagination if > 50 results]
```

**Search persistence** (sessionStorage):
```typescript
const WAREHOUSE_FILTERS_KEY = "mb_warehouse_filters";
// On mount: read from sessionStorage, pre-fill search state
// On search change: write to sessionStorage
export function clearWarehouseFilters() {
  sessionStorage.removeItem(WAREHOUSE_FILTERS_KEY);
}
```

**Export**: on click, fetch all parts (no pagination limit), call `exportWarehouseToXlsx(parts)`.

**Import**: file input (hidden, accept=".xlsx,.csv"), on change parse with `xlsx`, show preview modal of first 10 rows, on confirm call `useUpsertWarehouseParts(rows)`. Show result toast: "X imported, Y skipped".

---

### STEP 9 — Navigation

In `components/admin/AdminSidebar.tsx`:

1. Add to the `navItems` array (after the Earnings entry):
```typescript
{
  href: "/warehouse",
  labelKey: "admin.sidebar.warehouse",
  icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  // no adminOnly or superAdminOnly — visible to all roles
},
```

2. In the `onClick` of the warehouse nav link, add: `clearWarehouseFilters()` (import from the warehouse page).

3. Add translation keys:

**`messages/en.json`** under `admin.sidebar`: `"warehouse": "Warehouse"`

**`messages/bg.json`** under `admin.sidebar`: `"warehouse": "Склад"`

Also add all new `admin.warehouse.*` translation keys for labels used in warehouse components.

---

### STEP 10 — Offer auto-fill from warehouse

Modify `components/admin/forms/PartsFieldArray.tsx` — inside `AddEditPartModal`:

1. Add a debounced warehouse lookup (300ms) triggered by changes to the `partNumber` state.
2. Query: `supabase.from('warehouse_parts').select('*').ilike('part_number', '%{term}%').limit(10)` — only when `term.length >= 2`.
3. Show results as an absolute-positioned dropdown beneath the part number input (z-50, bg-mb-anthracite, border border-mb-border, rounded-lg, shadow-xl).
4. On row select:
   - `setDescription(match.name)`
   - `setUnitPrice(match.sale_price)`
   - `setPriceInput(String(match.sale_price))`
   - Close dropdown
   - Show an info badge below the part number field: `"Stock: {match.quantity} | Margin: {computed}%"` styled with the matching StockStatusBadge colour.
5. Clicking outside the dropdown dismisses it.

---

### STEP 11 — Offer auto-create in warehouse

In `components/admin/forms/PartsFieldArray.tsx`, inside the `onConfirm` callback of `AddEditPartModal` (the handler that calls `append(part)` or `update(editIndex, part)`):

After appending/updating the offer part, add:

```typescript
// Auto-create warehouse entry if part_number is set and no match exists
if (part.partNumber && part.partNumber.trim() !== "") {
  try {
    const { data: existing } = await supabase
      .from('warehouse_parts')
      .select('id')
      .eq('part_number', part.partNumber.trim())
      .maybeSingle();
    if (!existing) {
      await supabase.from('warehouse_parts').insert({
        name: part.description,
        part_number: part.partNumber.trim(),
        manufacturer: part.brand || 'MERCEDES',
        quantity: 0,
        cost_price: 0,
        sale_price: part.unitPrice,
      });
    }
  } catch {
    // silently ignore — never block the offer save
  }
}
```

Do NOT await this before the modal closes. Fire it asynchronously. No error toasts.

---

### STEP 12 — Transfer Data button

In `components/admin/forms/CreateOfferFormV2.tsx`:

1. Add a `"Transfer Data"` button in the top action bar area (near the Save/PDF buttons).
2. Create a `TransferDataModal` component inline or in `components/admin/warehouse/TransferDataModal.tsx`:
   - Input: offer number (10-digit text)
   - On change with ≥ 3 chars: lookup `supabase.from('offers').select('id, offer_number, car_model_text, customer_name').ilike('offer_number', '%{q}%').limit(5)` — show results dropdown
   - Show preview: "Offer #XXXXXXXXXX — [car] — [customer]"
   - Confirm button: "Transfer Parts & Labor"
   - On confirm:
     ```typescript
     // 1. Get current offer's items and service_actions
     // 2. Get target offer's max sort_order for items and service_actions
     // 3. INSERT copies into offer_items with offer_id = targetId, new sort_orders
     // 4. INSERT copies into service_actions with offer_id = targetId, new sort_orders
     // 5. Do NOT copy: customer info, car info, notes, discounts, prepayments
     ```
   - Success toast: `"Parts and labor transferred to offer #XXXXXXXXXX"`
   - Source offer is NOT modified.

---

### Validation rules & edge cases

| Case | Behaviour |
|---|---|
| cost_price = 0, margin computation | Show `"—"` for margin %, still show profit EUR |
| Import row with empty name or part_number | Skip row, count as "skipped" |
| Import: part_number already exists | UPDATE (upsert), not duplicate |
| Import: never deletes existing parts not in file | Upsert only, no bulk delete |
| Auto-create: empty part_number | Skip silently |
| Auto-create fails | Catch error, do not block offer save, no user message |
| Transfer to same offer | Show validation error: "Cannot transfer to the same offer" |
| Transfer: target offer not found | Show error toast |
| Inline qty edit: min value via popover | 1 (use existing QuantityPopover min=1 logic) |
| Search empty | Show all parts (no filter) |
| Warehouse page: 0 parts | Show empty state with Add Part CTA |

---

### Final checklist — verify before marking done

- [ ] `warehouse_parts` table exists in Supabase with all columns + RLS
- [ ] `WarehousePart` type added to `types/database.ts`
- [ ] `lib/schemas/warehouse.ts` exists with Zod schema
- [ ] `hooks/useWarehouseParts.ts` — list, create, update, delete, upsert, export all working
- [ ] `components/admin/shared/QuantityPopover.tsx` — extracted; import in `PartsFieldArray.tsx` updated
- [ ] `components/admin/warehouse/StockStatusBadge.tsx` — green/yellow/red thresholds correct
- [ ] `components/admin/warehouse/WarehousePartModal.tsx` — all 7 fields + live margin/profit
- [ ] Manufacturer defaults to `"MERCEDES"` in modal
- [ ] Warehouse page at `/[locale]/mb-admin/warehouse/` loads and lists parts
- [ ] Column order: Name | Part# | Manufacturer | Qty | Cost | Sale | Margin | Status | Date | Actions
- [ ] Clicking Qty opens QuantityPopover; confirm saves to DB via `useUpdateWarehousePart`
- [ ] Status badge colours correct for qty boundaries (>3 / 1–3 / 0)
- [ ] Search across name + part_number + replaced_by with 300ms debounce
- [ ] Search state saved to sessionStorage key `mb_warehouse_filters`
- [ ] Sidebar "Warehouse" link clears sessionStorage on click
- [ ] Export generates `.xlsx` file named `warehouse_backup_YYYY-MM-DD.xlsx`
- [ ] Import: preview modal → confirm → upsert → success toast "X imported, Y skipped"
- [ ] Sidebar nav item added; visible to all roles; active state highlights correctly
- [ ] Translation keys added in both `messages/en.json` and `messages/bg.json`
- [ ] Offer part-number field shows warehouse dropdown suggestions (≥2 chars)
- [ ] Selecting suggestion fills Name + Sale Price + shows stock/margin badge
- [ ] New offer part with a part_number not in warehouse → auto-creates warehouse entry silently
- [ ] Auto-create skips if part_number is empty
- [ ] "Transfer Data" button on offer edit page
- [ ] Transfer appends items + service_actions to target offer (by offer_number)
- [ ] Transfer does NOT copy customer/car/notes/discounts/prepayments
- [ ] Transfer source offer unchanged
- [ ] Transfer to same offer shows validation error
