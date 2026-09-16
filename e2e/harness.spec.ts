import { test, expect } from "@playwright/test";
import { ADMIN_EMAIL, emptyDb, mockSupabase, seedWorkers, signIn,
  todayKey,
} from "./helpers";

test("harness: turnover page loads as admin with mocked data", async ({ page }) => {
  const db = seedWorkers(emptyDb());
  db.daily_turnover = [
    {
      id: "t1",
      source: "manual",
      entry_date: todayKey(),
      vehicle: "S500 W222",
      repair_name: "Смяна на масло",
      client_name: "Тест Клиент",
      amount: 700,
      amount_cash: 300,
      amount_card: 400,
      amount_bank: 0,
      parts_cost: 100,
      payment_method: "mixed",
      notes: null,
      offer_id: null,
      offer_number: null,
      service_card_number: null,
      created_by_name: "Admin",
    },
  ];

  await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
  await mockSupabase(page, db, { role: "admin", full_name: "Admin" });

  await page.goto("/bg/mb-admin/turnover/");
  await expect(page.getByRole("heading", { name: "Дневен оборот" })).toBeVisible();
  await expect(page.getByText("S500 W222")).toBeVisible();
  // mixed payment must render both parts on one row
  await expect(page.getByText("Брой 300.00 €")).toBeVisible();
  await expect(page.getByText("Карта 400.00 €")).toBeVisible();
});
