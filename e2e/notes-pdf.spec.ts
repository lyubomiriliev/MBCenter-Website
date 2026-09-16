import { test, expect } from "@playwright/test";
import { emptyDb, mockSupabase, seedWorkers, signIn, type Db,
  todayKey,
} from "./helpers";

const ADMIN = "oliverqueeneb@gmail.com";
const RECEPTION = "reception@mbcenter.bg";
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

test.describe("Забележки за деня", () => {
  test("reception can write and save the day's note", async ({ page }) => {
    const db = dbWithRow();
    await signIn(page, { email: RECEPTION, role: "reception" });
    const { writes } = await mockSupabase(page, db, {
      role: "reception",
      full_name: "Приемна",
    });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(
      page.getByRole("heading", { name: "Дневен оборот" }),
    ).toBeVisible();

    const field = page.getByPlaceholder(/Липсва фактура/);
    await expect(field).toBeVisible();
    await field.fill("Клиентът ще доплати утре");
    await page.getByRole("button", { name: "Запази", exact: true }).click();

    await expect
      .poll(() =>
        writes.filter((w) => w.table === "daily_turnover_notes").length,
      )
      .toBe(1);
    const body = writes.find(
      (w) => w.table === "daily_turnover_notes",
    )!.body;
    expect(body.note).toBe("Клиентът ще доплати утре");
    expect(body.note_date).toBe(today());
  });

  test("an existing note is loaded into the field", async ({ page }) => {
    const db = dbWithRow();
    db.daily_turnover_notes = [
      { id: "n1", note_date: today(), note: "Вчерашна забележка", created_by_name: "Admin" },
    ];
    await signIn(page, { email: ADMIN, role: "admin" });
    await mockSupabase(page, db, { role: "admin", full_name: "Admin" });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(page.getByPlaceholder(/Липсва фактура/)).toHaveValue(
      "Вчерашна забележка",
    );
  });

  test("the note field is hidden in month view", async ({ page }) => {
    await signIn(page, { email: ADMIN, role: "admin" });
    await mockSupabase(page, dbWithRow(), { role: "admin", full_name: "Admin" });

    await page.goto("/bg/mb-admin/turnover/");
    await page.getByRole("button", { name: "Месец", exact: true }).click();
    await expect(page.getByPlaceholder(/Липсва фактура/)).toHaveCount(0);
  });
});

test.describe("PDF", () => {
  test("the print button is available to reception", async ({ page }) => {
    await signIn(page, { email: RECEPTION, role: "reception" });
    await mockSupabase(page, dbWithRow(), {
      role: "reception",
      full_name: "Приемна",
    });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(
      page.getByRole("button", { name: /Разпечатай PDF/ }),
    ).toBeVisible();
  });

  test("clicking it downloads a PDF with a meaningful name", async ({
    page,
  }) => {
    await signIn(page, { email: ADMIN, role: "admin" });
    await mockSupabase(page, dbWithRow(), { role: "admin", full_name: "Admin" });

    await page.goto("/bg/mb-admin/turnover/");
    await expect(page.getByText("S500 W222")).toBeVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 25_000 });
    await page.getByRole("button", { name: /Разпечатай PDF/ }).click();
    const download = await downloadPromise;

    // dneven-oborot-YYYY-MM-DD.pdf for a day, -YYYY-MM for a month.
    expect(download.suggestedFilename()).toMatch(
      /^dneven-oborot-\d{4}-\d{2}(-\d{2})?\.pdf$/,
    );
  });
});
