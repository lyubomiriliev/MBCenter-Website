import { test, expect } from "@playwright/test";
import { ADMIN_EMAIL, emptyDb, mockSupabase, seedWorkers, signIn } from "./helpers";

test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 Pro

test("leave section on a phone shows a single calendar and does not overflow", async ({
  page,
}) => {
  const db = seedWorkers(emptyDb());
  await signIn(page, { email: ADMIN_EMAIL, role: "admin" });
  await mockSupabase(page, db, { role: "admin", full_name: "Admin" });

  await page.goto("/bg/mb-admin/earnings/");
  await page.getByRole("button", { name: "Отпуски", exact: true }).click();
  await page.getByRole("button", { name: /Георги Михайлов/ }).click();
  await page.waitForTimeout(800);

  // Exactly one month grid on a phone.
  const months = page.locator(".rdp-month, [class*='rdp-month']");
  const grids = await page.locator("table").count();
  expect(grids).toBe(1);

  // No horizontal page overflow.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  // Every employee must be visible without horizontal scrolling.
  for (const name of ["Георги Михайлов", "Любомир Киров", "Иван Стоянов", "Дани"]) {
    await expect(page.getByRole("button", { name: new RegExp(name) })).toBeVisible();
  }
  const picker = page.locator("div.grid").first();
  const scrollable = await picker.evaluate(
    (el) => el.scrollWidth - el.clientWidth,
  );
  expect(scrollable).toBeLessThanOrEqual(1);

  await page.screenshot({ path: "/tmp/leave_mobile.png", fullPage: true });
});
