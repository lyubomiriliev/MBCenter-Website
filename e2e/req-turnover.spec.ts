import { test, expect } from "@playwright/test";
import {
  ADMIN_EMAIL,
  emptyDb,
  mockSupabase,
  seedWorkers,
  signIn,
  field,
  type Db,
  todayKey,
} from "./helpers";


/**
 * Дневен оборот — tests mapped directly to the assignment:
 *
 *  R1  Manual entry: car, repair, amount, payment method.
 *  R2  Reception may NOT edit or delete; admin may.
 *  R3  Month turnover total is shown.
 *  R4  Profit is shown ONLY on the admin account.
 *  R5  Mixed payment stays one entry with a readable breakdown.
 */

const today = () => todayKey();

function turnoverRow(over: Partial<any> = {}) {
  return {
    id: "t1",
    source: "manual",
    entry_date: today(),
    vehicle: "S500 W222",
    license_plate: "CB8748EO",
    repair_name: "Смяна на масло",
    client_name: "Любомир Илиев",
    amount: 500,
    amount_cash: 500,
    amount_card: 0,
    amount_bank: 0,
    parts_cost: 200,
    payment_method: "cash",
    notes: null,
    offer_id: null,
    offer_number: null,
    service_card_number: null,
    created_by_name: "Admin",
    ...over,
  };
}

function dbWith(rows: any[]): Db {
  const db = seedWorkers(emptyDb());
  db.daily_turnover = rows;
  return db;
}

test.describe("R1 — manual entry", () => {
  test("can add an entry with car, repair, amount and payment method", async ({
    page,
  }) => {
    const db = dbWith([]);
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    const { writes } = await mockSupabase(page, db, {
      role: "admin",
      full_name: "Admin",
    });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(
      page.getByRole("heading", { name: "Дневен оборот" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Добави запис" }).click();

    const dialog = page.getByRole("dialog");
    await field(dialog, "Сума (€)").fill("350");
    await field(dialog, "Автомобил").fill("BMW X5");
    await field(dialog, "Рег. номер").fill("CA1234XX");
    await field(dialog, "Ремонт").fill("Смяна на накладки");
    await field(dialog, "Клиент").fill("Иван Петров");
    await page.getByRole("button", { name: "Карта", exact: true }).click();
    await page.getByRole("button", { name: "Запази" }).click();

    await expect
      .poll(() => writes.filter((w) => w.table === "daily_turnover").length)
      .toBe(1);

    const body = writes.find((w) => w.table === "daily_turnover")!.body;
    expect(body.vehicle).toBe("BMW X5");
    expect(body.repair_name).toBe("Смяна на накладки");
    expect(body.amount).toBe(350);
    expect(body.payment_method).toBe("card");
    expect(body.amount_card).toBe(350);
  });
});

test.describe("R2 — reception cannot correct entries", () => {
  test("reception sees no edit or delete controls", async ({ page }) => {
    const db = dbWith([turnoverRow()]);
    await signIn(page, { email: ADMIN_EMAIL, role: "reception" });
    await mockSupabase(page, db, { role: "reception", full_name: "Рецепция" });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(page.getByText("S500 W222")).toBeVisible();

    await expect(page.getByTitle("Редактирай")).toHaveCount(0);
    await expect(page.getByTitle("Изтрий")).toHaveCount(0);
    await expect(
      page.getByText(/Само за преглед/),
    ).toBeVisible();
  });

  test("admin sees edit and delete controls", async ({ page }) => {
    const db = dbWith([turnoverRow()]);
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(page, db, { role: "admin", full_name: "Admin" });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(page.getByText("S500 W222")).toBeVisible();

    await expect(page.getByTitle("Редактирай")).toHaveCount(1);
    await expect(page.getByTitle("Изтрий")).toHaveCount(1);
  });

  test("reception can still create an entry", async ({ page }) => {
    const db = dbWith([]);
    await signIn(page, { email: ADMIN_EMAIL, role: "reception" });
    const { writes } = await mockSupabase(page, db, {
      role: "reception",
      full_name: "Рецепция",
    });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(
      page.getByRole("heading", { name: "Дневен оборот" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Добави запис" }).click();
    const dialog2 = page.getByRole("dialog");
    await field(dialog2, "Сума (€)").fill("120");
    await field(dialog2, "Автомобил").fill("Audi A6");
    await page.getByRole("button", { name: "Запази" }).click();

    await expect
      .poll(() => writes.filter((w) => w.table === "daily_turnover").length)
      .toBe(1);
  });
});

test.describe("R3 + R4 — month total and profit visibility", () => {
  const rows = [
    turnoverRow({ id: "a", amount: 500, amount_cash: 500, parts_cost: 200 }),
    turnoverRow({
      id: "b",
      amount: 300,
      amount_cash: 0,
      amount_card: 300,
      payment_method: "card",
      parts_cost: 100,
    }),
  ];

  test("admin sees month turnover AND profit", async ({ page }) => {
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(page, dbWith(rows), {
      role: "admin",
      full_name: "Admin",
    });

    await page.goto("/bg/mb-admin/turnover/");

    await expect(page.getByText(/Оборот за месеца/)).toBeVisible();
    await expect(page.getByText(/Печалба за месеца/)).toBeVisible();

    // 800 turnover - 300 cost = 500 profit
    await expect(page.getByText("800.00 €").first()).toBeVisible();
    await expect(page.getByText("500.00 €").first()).toBeVisible();
  });

  test("reception sees month turnover but NOT profit", async ({ page }) => {
    await signIn(page, { email: ADMIN_EMAIL, role: "reception" });
    await mockSupabase(page, dbWith(rows), {
      role: "reception",
      full_name: "Рецепция",
    });

    await page.goto("/bg/mb-admin/turnover/");

    await expect(page.getByText(/Оборот за месеца/)).toBeVisible();
    await expect(page.getByText(/Печалба за месеца/)).toHaveCount(0);
    await expect(page.getByText(/Себестойност/)).toHaveCount(0);
  });

  test("reception does not get the cost input in the entry form", async ({
    page,
  }) => {
    await signIn(page, { email: ADMIN_EMAIL, role: "reception" });
    await mockSupabase(page, dbWith([]), {
      role: "reception",
      full_name: "Рецепция",
    });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(
      page.getByRole("heading", { name: "Дневен оборот" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Добави запис" }).click();
    await expect(page.getByText(/Себестойност на частите/)).toHaveCount(0);
  });
});

test.describe("R5 — mixed payment stays one entry", () => {
  test("split save creates exactly one row with the breakdown", async ({
    page,
  }) => {
    const db = dbWith([]);
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    const { writes } = await mockSupabase(page, db, {
      role: "admin",
      full_name: "Admin",
    });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(
      page.getByRole("heading", { name: "Дневен оборот" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Добави запис" }).click();
    const dlg = page.getByRole("dialog");
    await field(dlg, "Автомобил").fill("S500 W222");
    await page.getByRole("button", { name: /Раздели по няколко начина/ }).click();

    // Target the split panel's own inputs by their method label, so the
    // separate "Аванс" field above them cannot shift these by one.
    await field(dlg, "Брой").fill("300");
    await field(dlg, "Карта").fill("200");
    await page.getByRole("button", { name: "Запази" }).click();

    await expect
      .poll(() => writes.filter((w) => w.table === "daily_turnover").length)
      .toBe(1);

    const body = writes.find((w) => w.table === "daily_turnover")!.body;
    const row = Array.isArray(body) ? body[0] : body;
    expect(Array.isArray(body) ? body.length : 1).toBe(1);
    expect(row.amount).toBe(500);
    expect(row.amount_cash).toBe(300);
    expect(row.amount_card).toBe(200);
    expect(row.payment_method).toBe("mixed");
  });

  test("an advance row shows its amount on the Аванс badge", async ({
    page,
  }) => {
    // Regression: the advance row used to render "Аванс" and "Брой" with no
    // figures at all, because a single-method row suppressed its amount.
    const db = dbWith([
      turnoverRow({
        amount: 200,
        amount_cash: 200,
        amount_card: 0,
        payment_method: "cash",
        is_advance: true,
      }),
    ]);
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(page, db, { role: "admin", full_name: "Admin" });

    await page.goto("/bg/mb-admin/turnover/");

    const row = page.getByRole("row", { name: /S500 W222/ });
    await expect(row).toContainText("Аванс 200.00 €");
  });

  test("a closing row shows the advance applied to it", async ({ page }) => {
    const db = dbWith([
      turnoverRow({
        amount: 350,
        amount_cash: 350,
        amount_card: 0,
        payment_method: "cash",
        is_advance: false,
        advance_applied: 200,
      }),
    ]);
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(page, db, { role: "admin", full_name: "Admin" });

    await page.goto("/bg/mb-admin/turnover/");

    // The client's example: "Аванс 200,00 € Брой 350,00 €".
    const row = page.getByRole("row", { name: /S500 W222/ });
    await expect(row).toContainText("Аванс 200.00 €");
    await expect(row).toContainText("Брой 350.00 €");
  });

  test("a single-method row keeps the amount off the badge", async ({
    page,
  }) => {
    // The Сума column already states it; repeating it would be noise.
    const db = dbWith([
      turnoverRow({
        amount: 400,
        amount_cash: 0,
        amount_card: 400,
        payment_method: "card",
      }),
    ]);
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(page, db, { role: "admin", full_name: "Admin" });

    await page.goto("/bg/mb-admin/turnover/");

    const row = page.getByRole("row", { name: /S500 W222/ });
    await expect(row).toContainText("Карта");
    await expect(row).not.toContainText("Карта 400.00 €");
  });

  test("a mixed row shows both parts on one line", async ({ page }) => {
    const db = dbWith([
      turnoverRow({
        amount: 700,
        amount_cash: 300,
        amount_card: 400,
        payment_method: "mixed",
      }),
    ]);
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(page, db, { role: "admin", full_name: "Admin" });

    await page.goto("/bg/mb-admin/turnover/");

    await expect(page.getByText("Брой 300.00 €")).toBeVisible();
    await expect(page.getByText("Карта 400.00 €")).toBeVisible();
    await expect(page.getByRole("row", { name: /S500 W222/ })).toHaveCount(1);
  });
});

test.describe("Beta gate (temporary, while the section is in testing)", () => {
  test("a non-beta account is redirected away from the turnover page", async ({
    page,
  }) => {
    await signIn(page, { email: "someone.else@mbcenter.bg", role: "admin" });
    await mockSupabase(page, dbWith([]), { role: "admin", full_name: "Друг" });

    await page.goto("/bg/mb-admin/turnover/");
    await page.waitForURL(/\/mb-admin\/offers/, { timeout: 10_000 });
    expect(page.url()).toContain("/mb-admin/offers");
  });

  test("a non-beta account has no Дневен оборот link in the sidebar", async ({
    page,
  }) => {
    await signIn(page, { email: "someone.else@mbcenter.bg", role: "admin" });
    await mockSupabase(page, dbWith([]), { role: "admin", full_name: "Друг" });

    await page.goto("/bg/mb-admin/offers/");
    await expect(
      page.getByRole("link", { name: "Дневен оборот" }),
    ).toHaveCount(0);
  });
});

test.describe("Source column links back to the service card", () => {
  test("a service-card row links to its offer", async ({ page }) => {
    const db = dbWith([
      turnoverRow({
        source: "service_card",
        offer_id: "offer-123",
        service_card_number: "00020530",
      }),
    ]);
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(page, db, { role: "admin", full_name: "Admin" });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(page.getByText("S500 W222")).toBeVisible();

    const link = page.getByRole("link", { name: /Сервизна карта 00020530/ });
    await expect(link).toBeVisible();
    // Next adds a trailing slash (trailingSlash: true), so match loosely.
    await expect(link).toHaveAttribute(
      "href",
      /\/bg\/mb-admin\/offers\/edit\/?\?id=offer-123/,
    );
  });

  test("a manual row shows Ръчно and is not a link", async ({ page }) => {
    const db = dbWith([turnoverRow({ source: "manual", offer_id: null })]);
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(page, db, { role: "admin", full_name: "Admin" });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(page.getByText("Ръчно")).toBeVisible();
    await expect(page.getByRole("link", { name: /Сервизна карта/ })).toHaveCount(0);
  });
});
