import { test, expect } from "@playwright/test";
import { ADMIN_EMAIL, emptyDb, mockSupabase, signIn, type Db } from "./helpers";

/**
 * Логове — the activity log.
 *
 *  L1  Admin sees the entries, newest first.
 *  L2  The developer account's own entries are never shown.
 *  L3  Reception has no access to the section at all.
 */

const DEV_EMAIL = "oliverqueeneb@gmail.com";

function logRow(over: Partial<any> = {}) {
  return {
    id: "l1",
    auth_id: "u1",
    user_name: "Ивайло",
    user_email: "ivaylo@mbcenter.bg",
    entity_type: "daily_turnover",
    entity_id: "t1",
    entity_label: "S500 W222",
    action: "edit",
    changes: [
      { field: "amount", label: "Сума", from: "300,00 €", to: "350,00 €" },
    ],
    created_at: new Date().toISOString(),
    ...over,
  };
}

function dbWith(activity_log: any[]): Db {
  return { ...emptyDb(), activity_log } as Db;
}

test("admin sees a log entry with its field changes", async ({ page }) => {
  await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
  await mockSupabase(page, dbWith([logRow()]), {
    role: "admin",
    full_name: "Admin",
  });

  await page.goto("/bg/mb-admin/logs/");

  await expect(page.getByRole("heading", { name: "Логове" })).toBeVisible();

  // Scope to the table: the account name also appears in the "who" filter.
  const row = page.getByRole("row", { name: /S500 W222/ });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("Ивайло");
  await expect(row).toContainText("Сума: 300,00 € → 350,00 €");
  await expect(row).toContainText("редакция");
});

test("the developer account's own entries are hidden", async ({ page }) => {
  const db = dbWith([
    logRow({ id: "keep", user_name: "Християн", entity_label: "BMW X5" }),
    logRow({
      id: "hide",
      user_name: "Developer",
      user_email: DEV_EMAIL,
      entity_label: "СКРИТ ЗАПИС",
    }),
  ]);
  await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
  await mockSupabase(page, db, { role: "admin", full_name: "Admin" });

  await page.goto("/bg/mb-admin/logs/");

  // The client's own entry is there...
  await expect(page.getByText("BMW X5")).toBeVisible();
  // ...but nothing done by the developer account.
  await expect(page.getByText("СКРИТ ЗАПИС")).toHaveCount(0);
  await expect(page.getByText("Developer")).toHaveCount(0);
});

test("the user filter lists every account, not just the current one", async ({
  page,
}) => {
  // The log is empty on purpose: the filter must still offer all accounts,
  // because it is loaded from `profiles`, not from the entries on screen.
  await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
  await mockSupabase(
    page,
    dbWith([]),
    { role: "admin", full_name: "Админ" },
    {
      otherProfiles: [
        { full_name: "Ивайло" },
        { full_name: "Християн" },
        { full_name: "Приемна", role: "reception" },
      ],
    },
  );

  await page.goto("/bg/mb-admin/logs/");
  await expect(page.getByRole("heading", { name: "Логове" })).toBeVisible();

  // Open the "Потребител" dropdown.
  await page.getByRole("combobox").nth(1).click();

  for (const name of ["Всички", "Админ", "Ивайло", "Християн", "Приемна"]) {
    await expect(page.getByRole("option", { name })).toBeVisible();
  }
});

test("the developer account is not offered in the user filter", async ({
  page,
}) => {
  // Some profiles carry the email as their full_name, so the exclusion has to
  // match on the address too, not just on a display name.
  await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
  await mockSupabase(
    page,
    dbWith([]),
    { role: "admin", full_name: "Админ" },
    {
      otherProfiles: [
        { full_name: "Ивайло" },
        { full_name: DEV_EMAIL },
      ],
    },
  );

  await page.goto("/bg/mb-admin/logs/");
  await page.getByRole("combobox").nth(1).click();

  await expect(page.getByRole("option", { name: "Ивайло" })).toBeVisible();
  await expect(page.getByRole("option", { name: DEV_EMAIL })).toHaveCount(0);
});

test("reception cannot read the log", async ({ page }) => {
  await signIn(page, { email: "reception@mbcenter.bg", role: "reception" });
  await mockSupabase(page, dbWith([logRow()]), {
    role: "reception",
    full_name: "Приемна",
  });

  await page.goto("/bg/mb-admin/logs/");

  // The page refuses rather than showing an empty table, and no entry leaks.
  await expect(page.getByText("Достъпно само за администратор.")).toBeVisible();
  await expect(page.getByText("S500 W222")).toHaveCount(0);
});

test("reception has no Логове link in the sidebar", async ({ page }) => {
  await signIn(page, { email: "reception@mbcenter.bg", role: "reception" });
  await mockSupabase(page, dbWith([]), {
    role: "reception",
    full_name: "Приемна",
  });

  await page.goto("/bg/mb-admin/offers/");
  await expect(page.getByRole("link", { name: "Логове" })).toHaveCount(0);
});
