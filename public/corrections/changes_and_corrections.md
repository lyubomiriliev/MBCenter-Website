# Changes & Corrections - Implementation Brief

> **Visual references:** See attached `changes_and_corrections.pdf` for annotated screenshots corresponding to each item.

---

## 1. Account Settings Page

**PDF reference:** Page 1 (image 1)

- Rename the "My Account" label at the top to **"Account Settings"**

**PDF reference:** Page 1 (image 2)

- Remove the separate fields per account. Instead, add a **"Select Account" dropdown menu** at the top of the section - when an account is selected, its data should auto-populate all corresponding fields below
- In each password field (right side), add an **eye icon toggle** that reveals/hides the password when clicked

---

## 2. Account Settings - Additional Sections

**PDF reference:** Page 2 (image 3)

- The current per-account separate field layout becomes unnecessary once the dropdown above is implemented - **remove it**
- Add a **"Select Account" dropdown** so settings can be managed per account individually
- Add a **"Document Creators" section** with the ability to add or remove creators
- Add an **"Hourly Rate" section** where the default hourly rate can be changed
- Add an **"Earnings" section** containing:
  - Mechanic Earnings - Hourly Rate
  - Receptionist Earnings - % of Turnover

---

## 3. Quote Save Button Bug

**PDF reference:** Page 3 (image 4, image 5)

- **Bug:** The Save button remains inactive when editing a quote - it only activates if rows are manually reordered
- **Bug:** After spending extended time in a quote (writing/editing), clicking Save causes infinite loading with no actual save occurring
- **Bug:** Saving also freezes when attempting to exit the quote
- Fix the save/persist logic so changes are reliably saved regardless of session duration or edit method

---

## 4. Earnings Panel in Quotes

**PDF reference:** Page 4 (image 6)

- Next to the existing panel (rearrange the notes and discount percentages to make room), **add an "Earnings" panel to the right** containing two sub-sections:
  - **Mechanic Earnings:**
    - "Select Mechanic" dropdown
    - Hourly Rate field
    - Repair Time field
    - "Save" button
  - **Receptionist Earnings:**
    - "Select Receptionist" dropdown
    - % of Turnover field
    - Repair Total field
    - "Save" button

---

## 5. Earnings Button in Quote Actions

**PDF reference:** Page 4 (image 7)

- Add an **"Earnings" button** to the quote action bar/footer (alongside existing action buttons)

---

## 6. Earnings - Worker Log & Monthly File

**PDF reference:** Page 4–5 (image 7, image 8)

- Create an **Earnings section/page** with two side-by-side panels:
  - **"Mechanic Earnings"** panel - with "Select Mechanic" dropdown; on selection, loads that mechanic's earnings file
  - **"Receptionist Earnings"** panel - with "Select Receptionist" dropdown; on selection, loads that receptionist's earnings file
- Add a **visible log/summary area** showing total accumulated earnings per worker and their current salary to date
- When an earning entry is saved from a quote for a worker, it should **append to a monthly file** with the following columns:

  | Vehicle | Repair Name | Repair Time | Hourly Rate | Total Amount | Date |
  |---------|-------------|-------------|-------------|--------------|------|

---

## 7. Monthly Earnings Sheet - Mechanic

**PDF reference:** Page 5 (image 8)

Design a clean monthly earnings sheet. The title should follow the pattern:
**"Earnings for [Worker Name] - [Month] [Year]"**

Required rows/fields:
- All individual repair entries (Vehicle, Repair Name, Repair Time, Hourly Rate, Total, Date)
- **Total Earnings** - sum of all entries
- **Net 50%** - total divided by 2 (worker receives half of earned labour)
- **Card** - entered manually at month end; displayed with a **minus sign** (deducted from earnings)
- **Fines** - field below "Card"; **only visible if a value has been entered**
- ~~Euro Correction~~ - **remove this field** (system will calculate exact rate going forward)
- Bottom right: **date, time, and employee signature**

---

## 8. Monthly Earnings Sheet - Receptionist

**PDF reference:** Page 5–6

Same structure as mechanic sheet, but **no hourly earnings** - only percentage of turnover.

Columns:

| Vehicle | Repair Name | Total Repair Amount | Rate % | Earnings | Date |
|---------|-------------|---------------------|--------|----------|------|

Footer rows (bottom section):
- Total Earnings
- **Fixed** (fixed salary component)
- Card
- Cash
- **Total Salary** = Cash + Card

---

## 9. Reception Account Label

**PDF reference:** Page 6 (image 9)

- In the reception account profile, rename the label **"Administrator" → "Reception"**

---

## 10. Inspections / Reviews Page

**PDF reference:** Page 7 (image 10)

- **Bug:** Clicking "Inspections" causes indefinite loading until the page is manually refreshed - fix this loading issue
- Rename the button/label **"Inspections" → "Reviews"**

---

## 11. Reviews List - Layout & Fields

**PDF reference:** Page 7 (image 11)

- **Spread out the sections** in the reviews list so items are not hidden/overlapping
- Rename the field label **"Registration" → "Reg. Number"**
- Add a **"Create Quote"** action to each review entry that:
  - Creates a new quote
  - Pre-populates it with the vehicle and client data from the selected review

---

## 12. Review Form - Make & Model Fields

**PDF reference:** Page 8 (image 12)

- The **Make** and **Model** fields in review forms should support **both typing and dropdown selection** (combo input)
- Set **Mercedes-Benz** as the default value for the Make field

---

## 13. Quote Labels - Font Size & Weight

**PDF reference:** Page 8 (image 13, image 14)

- Increase the **section/column label font size by 1 unit** throughout quotes
- Make these labels **bold** so they visually distinguish from the content text below them

---

## 14. Quote & Service Card - Bottom Text Formatting

**PDF reference:** Page 9 (image 15, image 16)

- The text rows at the very **bottom of quotes and service cards** should use the **same font and font size** as the column headers above them (currently they are mismatched)

---

## 15. Quote Summary - Background

**PDF reference:** Page 9–10 (image 17)

- **Remove the light grey background** from the entire summary/totals section (saves toner on print)
- **Keep** the coloured highlighting only on:
  - The subtotal/totals rows
  - The final "Amount Due" / payment row

---

## 16. Signature & Stamp Field

**PDF reference:** Page 10 (image 17)

- **Shorten** the signature/stamp field slightly (see PDF for reference dimensions and label placement)
- Replace the solid line with **faint dotted/dashed points** (light grey)
- Apply this same dotted line style to the **signature field in quotes** as well

---

## 17. Parts & Service Activities - Numbering Alignment

**PDF reference:** Page 10 (image 18)

- The numbering column for parts and service activities is **not centered** - fix alignment so numbers are consistently centered within their column

---

## Summary Checklist

| # | Area | Type | Done |
|---|------|------|------|
| 1 | Account Settings | Label rename | ☑ |
| 2 | Account Settings | Eye icon passwords + Document Creators + Hourly Rate + Earnings sections | ☑ |
| 3 | Quotes | Save button bug fix | ☑ (already fixed) |
| 4 | Quotes | Earnings panel | ☑ |
| 5 | Quotes | Earnings button | ☑ |
| 6 | Earnings | Worker log + monthly file | ☑ |
| 7 | Earnings | Mechanic sheet design | ☑ |
| 8 | Earnings | Receptionist sheet design | ☑ |
| 9 | Reception account | Label rename | ☑ |
| 10 | Reviews | Loading bug + rename | ☑ |
| 11 | Reviews | Layout + Reg. Number + Create Quote | ☑ |
| 12 | Review form | Make/Model combo input + default | ☑ |
| 13 | Quotes | Label font size + bold | ☑ |
| 14 | Quotes & Service cards | Bottom text font match | ☑ |
| 15 | Quote summary | Remove grey background | ☑ |
| 16 | Signature field | Shorten + dotted line | ☑ |
| 17 | Parts/Activities | Numbering centering | ☑ |
