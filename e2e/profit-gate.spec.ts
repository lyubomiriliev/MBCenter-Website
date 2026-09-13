import { test, expect } from "@playwright/test";
import { emptyDb, mockSupabase, seedWorkers, signIn, type Db } from "./helpers";
const today = () => new Date().toISOString().slice(0, 10);

function db(): Db {
  const d = seedWorkers(emptyDb());
  d.daily_turnover = [
    { id:"a1", source:"service_card", entry_date: today(), vehicle:"S-Class (W221)",
      license_plate:"CB4745XA", repair_name:"Аванс", client_name:"ТЕСТ",
      amount:300, amount_cash:300, amount_card:0, amount_bank:0, parts_cost:0,
      payment_method:"cash", is_advance:true, advance_applied:0, notes:null,
      offer_id:"o1", offer_number:"2242875388", service_card_number:null,
      created_by_name:"Admin" },
    { id:"b1", source:"service_card", entry_date: today(), vehicle:"S-Class (W221)",
      license_plate:"CB4745XA", repair_name:"ТО", client_name:"ТЕСТ",
      amount:715, amount_cash:0, amount_card:715, amount_bank:0, parts_cost:306.21,
      payment_method:"card", is_advance:false, advance_applied:300, notes:null,
      offer_id:"o1", offer_number:"2242875388", service_card_number:"00020531",
      created_by_name:"Admin" },
  ];
  return d;
}

const openMonth = async (page: any) => {
  await page.goto("/bg/mb-admin/turnover/");
  await expect(page.getByRole("heading", { name: "Дневен оборот" })).toBeVisible();
  await page.getByRole("button", { name: "Месец", exact: true }).click();
  await expect(page.getByText("S-Class (W221)").first()).toBeVisible();
};

test("приемна sees NO profit anywhere in month view", async ({ page }) => {
  await signIn(page, { email: "reception@mbcenter.bg", role: "reception" });
  await mockSupabase(page, db(), { role: "reception", full_name: "Приемна" });
  await openMonth(page);

  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  expect(body).not.toContain("Печалба");
  expect(body).not.toContain("708.79");
  expect(body).toContain("Оборот");
});

test("admin sees profit in the day header", async ({ page }) => {
  await signIn(page, { email: "oliverqueeneb@gmail.com", role: "admin" });
  await mockSupabase(page, db(), { role: "admin", full_name: "Admin" });
  await openMonth(page);

  const body = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  expect(body).toContain("Печалба 708.79 €");
});
