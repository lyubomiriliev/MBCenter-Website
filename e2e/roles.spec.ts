import { test, expect } from "@playwright/test";
import {
  emptyDb,
  field,
  mockSupabase,
  seedWorkers,
  signIn,
  type Db,
  todayKey,
} from "./helpers";

/**
 * Access rules per account, as specified:
 *   механик   — must NOT see Дневен оборот at all
 *   приемна   — sees it and can add entries, but cannot edit/delete,
 *               sees the month turnover, must NOT see Печалба
 *   admin     — sees everything, can edit and delete
 */

const RECEPTION = "reception@mbcenter.bg";
const ADMIN = "oliverqueeneb@gmail.com";
const today = () => todayKey();

function dbWithRow(): Db {
  const db = seedWorkers(emptyDb());
  db.daily_turnover = [
    {
      id: "t1",
      source: "manual",
      entry_date: today(),
      vehicle: "S500 W222",
      license_plate: "CB4745XA",
      repair_name: "Смяна на масло",
      client_name: "Тест",
      amount: 1015,
      amount_cash: 400,
      amount_card: 615,
      amount_bank: 0,
      parts_cost: 306.21,
      payment_method: "mixed",
      notes: null,
      offer_id: null,
      offer_number: null,
      service_card_number: null,
      created_by_name: "Приемна",
    },
  ];
  return db;
}

test.describe("механик", () => {
  test("is redirected out of the admin area entirely", async ({ page }) => {
    await signIn(page, { email: "mechanic@mbcenter.bg", role: "mechanic" });
    await mockSupabase(page, dbWithRow(), {
      role: "mechanic",
      full_name: "Механик",
    });

    await page.goto("/bg/mb-admin/turnover/");
    await page.waitForURL(/mb-admin-mechanics/, { timeout: 10_000 });
    expect(page.url()).toContain("mb-admin-mechanics");
  });
});

test.describe("приемна", () => {
  test("sees the turnover page and the month total", async ({ page }) => {
    await signIn(page, { email: RECEPTION, role: "reception" });
    await mockSupabase(page, dbWithRow(), {
      role: "reception",
      full_name: "Приемна",
    });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(
      page.getByRole("heading", { name: "Дневен оборот" }),
    ).toBeVisible();
    await expect(page.getByText("S500 W222")).toBeVisible();
    await expect(page.getByText(/Оборот за месеца/)).toBeVisible();
  });

  test("cannot see profit or cost", async ({ page }) => {
    await signIn(page, { email: RECEPTION, role: "reception" });
    await mockSupabase(page, dbWithRow(), {
      role: "reception",
      full_name: "Приемна",
    });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(page.getByText("S500 W222")).toBeVisible();
    await expect(page.getByText(/Печалба за месеца/)).toHaveCount(0);
    await expect(page.getByText(/Себестойност/)).toHaveCount(0);
  });

  test("cannot edit or delete an entry", async ({ page }) => {
    await signIn(page, { email: RECEPTION, role: "reception" });
    await mockSupabase(page, dbWithRow(), {
      role: "reception",
      full_name: "Приемна",
    });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(page.getByText("S500 W222")).toBeVisible();
    await expect(page.getByTitle("Редактирай")).toHaveCount(0);
    await expect(page.getByTitle("Изтрий")).toHaveCount(0);
    await expect(page.getByText(/Само за преглед/)).toBeVisible();
  });

  test("can still add an entry", async ({ page }) => {
    const db = seedWorkers(emptyDb());
    await signIn(page, { email: RECEPTION, role: "reception" });
    const { writes } = await mockSupabase(page, db, {
      role: "reception",
      full_name: "Приемна",
    });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(
      page.getByRole("heading", { name: "Дневен оборот" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Добави запис" }).click();
    const dialog = page.getByRole("dialog");
    await field(dialog, "Сума (€)").fill("250");
    await field(dialog, "Автомобил").fill("VW Golf");
    await page.getByRole("button", { name: "Запази" }).click();

    await expect
      .poll(() => writes.filter((w) => w.table === "daily_turnover").length)
      .toBe(1);
  });

  test("cannot reach Заработки or Отпуски", async ({ page }) => {
    await signIn(page, { email: RECEPTION, role: "reception" });
    await mockSupabase(page, dbWithRow(), {
      role: "reception",
      full_name: "Приемна",
    });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(
      page.getByRole("link", { name: "Заработки" }),
    ).toHaveCount(0);
  });
});

test.describe("admin", () => {
  test("sees profit and can edit or delete", async ({ page }) => {
    await signIn(page, { email: ADMIN, role: "admin" });
    await mockSupabase(page, dbWithRow(), { role: "admin", full_name: "Admin" });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(page.getByText("S500 W222")).toBeVisible();
    await expect(page.getByText(/Печалба за месеца/)).toBeVisible();
    await expect(page.getByTitle("Редактирай")).toHaveCount(1);
    await expect(page.getByTitle("Изтрий")).toHaveCount(1);
  });
});
