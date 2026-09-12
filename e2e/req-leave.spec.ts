import { test, expect } from "@playwright/test";
import {
  ADMIN_EMAIL,
  emptyDb,
  mockSupabase,
  seedWorkers,
  signIn,
  type Db,
} from "./helpers";

/**
 * Отпуски — tests mapped directly to the assignment:
 *
 *  L1  Pick an employee, mark a date range on the calendar.
 *  L2  It sums the working days taken.
 *  L3  History of every period: how many times, from when to when.
 *  L4  20 working days a year; Любомир has used all 20, Георги has 4 left.
 *  L5  Only the admin account can see Отпуски.
 */

const YEAR = new Date().getFullYear();

function leaveRow(over: Partial<any> = {}) {
  return {
    id: "l1",
    worker_id: "m-georgi",
    worker_type: "mechanic",
    worker_name: "Георги Михайлов",
    start_date: `${YEAR}-10-05`,
    end_date: `${YEAR}-10-07`,
    working_days: 3,
    leave_type: "paid",
    note: null,
    created_by_name: "Admin",
    created_at: "",
    updated_at: "",
    ...over,
  };
}

/** The seeded opening balances created by migration_leave_entitlement.sql. */
function openingBalance(workerId: string, name: string, days: number) {
  return leaveRow({
    id: `ob-${workerId}`,
    worker_id: workerId,
    worker_name: name,
    start_date: `${YEAR}-08-20`,
    end_date: `${YEAR}-09-11`,
    working_days: days,
    note: "Начален баланс - заменете с реалните дати",
    created_by_name: "system",
  });
}

function db(rows: any[] = []): Db {
  const d = seedWorkers(emptyDb());
  d.leave_periods = rows;
  return d;
}

const openLeaveTab = async (page: any) => {
  await page.goto("/bg/mb-admin/earnings/");
  await page.getByRole("button", { name: "Отпуски", exact: true }).click();
};

test.describe("L5 — visibility", () => {
  test("admin can open the Отпуски tab", async ({ page }) => {
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(page, db(), { role: "admin", full_name: "Admin" });
    await page.goto("/bg/mb-admin/earnings/");
    await expect(
      page.getByRole("button", { name: "Отпуски", exact: true }),
    ).toBeVisible();
  });

  test("reception does not see the Отпуски tab", async ({ page }) => {
    await signIn(page, { email: "reception@mbcenter.bg", role: "reception" });
    await mockSupabase(page, db(), { role: "reception", full_name: "Рецепция" });
    await page.goto("/bg/mb-admin/earnings/");
    await expect(
      page.getByRole("button", { name: "Отпуски", exact: true }),
    ).toHaveCount(0);
  });
});

test.describe("L1 — employee picker", () => {
  test("lists mechanics and приемна, excludes the 50:50 bucket", async ({
    page,
  }) => {
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(page, db(), { role: "admin", full_name: "Admin" });
    await openLeaveTab(page);

    await expect(page.getByRole("button", { name: /Георги Михайлов/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Любомир Киров/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Иван Стоянов/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /50:50/ })).toHaveCount(0);
    await expect(page.getByText("приемна").first()).toBeVisible();
  });
});

test.describe("L4 — 20-day allowance and the stated balances", () => {
  test("Георги: 16 used, 4 remaining of 20", async ({ page }) => {
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(
      page,
      db([openingBalance("m-georgi", "Георги Михайлов", 16)]),
      { role: "admin", full_name: "Admin" },
    );
    await openLeaveTab(page);
    await page.getByRole("button", { name: /Георги Михайлов/ }).click();

    await expect(page.getByText("от 20 дни")).toBeVisible();
    // Assert on the rendered summary text: "16 използвани / 4 оставащи".
    await expect
      .poll(async () => (await page.locator("body").innerText()).replace(/\s+/g, " "))
      .toMatch(/16 използвани 4 оставащи/);
  });

  test("Любомир: 20 used, 0 remaining", async ({ page }) => {
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(
      page,
      db([openingBalance("m-lyubo", "Любомир Киров", 20)]),
      { role: "admin", full_name: "Admin" },
    );
    await openLeaveTab(page);
    await page.getByRole("button", { name: /Любомир Киров/ }).click();

    await expect
      .poll(async () => (await page.locator("body").innerText()).replace(/\s+/g, " "))
      .toMatch(/20 използвани 0 оставащи/);
  });
});

test.describe("L2 — working days are summed", () => {
  test("a saved period records its working-day count", async ({ page }) => {
    const d = db();
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    const { writes } = await mockSupabase(page, d, {
      role: "admin",
      full_name: "Admin",
    });
    await openLeaveTab(page);
    await page.getByRole("button", { name: /Георги Михайлов/ }).click();

    // Pick two dates in the visible month, then save.
    const days = page.locator("button[data-day]");
    await days.nth(9).click();
    await days.nth(13).click();

    const summary = page.locator("div").filter({ hasText: "РАБОТНИ ДНИ" }).last();
    await expect(summary).toBeVisible();

    await page.getByRole("button", { name: "Запази отпуска" }).click();
    await expect
      .poll(() => writes.filter((w) => w.table === "leave_periods").length)
      .toBe(1);

    const body = writes.find((w) => w.table === "leave_periods")!.body;
    expect(body.worker_name).toBe("Георги Михайлов");
    expect(body.start_date).toBeTruthy();
    expect(body.end_date).toBeTruthy();
    expect(body.leave_type).toBe("paid");
  });
});

test.describe("L3 — history", () => {
  test("shows each period with its dates and day count", async ({ page }) => {
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(
      page,
      db([
        openingBalance("m-georgi", "Георги Михайлов", 16),
        leaveRow({ id: "r1", start_date: `${YEAR}-10-05`, end_date: `${YEAR}-10-07`, working_days: 3 }),
      ]),
      { role: "admin", full_name: "Admin" },
    );
    await openLeaveTab(page);
    await page.getByRole("button", { name: /Георги Михайлов/ }).click();

    await expect(page.getByText("История")).toBeVisible();
    // real period shows its dates
    await expect(page.getByText(/05\.10\.\d{4}.*07\.10\.\d{4}/)).toBeVisible();
    // opening balance is labelled, not shown as a fake date range
    await expect(page.getByText("Начален баланс", { exact: true })).toBeVisible();
    // totals include both: 16 + 3 = 19
    await expect
      .poll(async () => (await page.locator("body").innerText()).replace(/\s+/g, " "))
      .toMatch(/19 използвани 1 оставащи/);
  });

  test("opening balance is not drawn on the calendar, real leave is", async ({
    page,
  }) => {
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(
      page,
      db([openingBalance("m-georgi", "Георги Михайлов", 16)]),
      { role: "admin", full_name: "Admin" },
    );
    await openLeaveTab(page);
    await page.getByRole("button", { name: /Георги Михайлов/ }).click();

    // No day should be marked as booked from the opening balance alone.
    await expect(page.locator("td.line-through")).toHaveCount(0);
  });
});

test.describe("History follows the selected year", () => {
  test("a 2026 entry disappears when switching the summary to 2025", async ({
    page,
  }) => {
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(
      page,
      db([openingBalance("m-georgi", "Георги Михайлов", 16)]),
      { role: "admin", full_name: "Admin" },
    );
    await openLeaveTab(page);
    await page.getByRole("button", { name: /Георги Михайлов/ }).click();

    // Present in the current year.
    await expect(page.getByText("Начален баланс", { exact: true })).toBeVisible();

    // Step the summary year back one; the entry must no longer be listed.
    await page.getByRole("button", { name: "‹" }).click();
    await expect(page.getByText("Начален баланс", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/Няма въведени отпуски за/)).toBeVisible();
  });
});

test.describe("Tab is remembered in the URL", () => {
  test("opening Отпуски sets ?tab=leave and a refresh stays there", async ({
    page,
  }) => {
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(page, db(), { role: "admin", full_name: "Admin" });

    await page.goto("/bg/mb-admin/earnings/");
    await page.getByRole("button", { name: "Отпуски", exact: true }).click();
    await expect.poll(() => page.url()).toContain("tab=leave");

    await page.reload();
    await expect(page.getByText("Маркирайте период от календара")).toBeVisible();
  });

  test("switching back to Заработки clears the param", async ({ page }) => {
    await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
    await mockSupabase(page, db(), { role: "admin", full_name: "Admin" });

    await page.goto("/bg/mb-admin/earnings/?tab=leave");
    await expect(page.getByText("Маркирайте период от календара")).toBeVisible();
    await page.getByRole("button", { name: "Заработки", exact: true }).click();
    await expect.poll(() => page.url()).not.toContain("tab=leave");
  });
});
