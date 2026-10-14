import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "fs";
import {
  emptyDb,
  mockSupabase,
  seedWorkers,
  signIn,
  SUPABASE_HOST,
  type Role,
} from "./helpers";

/**
 * "Изтегли сервизна поръчка" — the printed sheet handed to the mechanic with
 * the car key. Visible to admin and reception only.
 */

const ADMIN = "oliverqueeneb@gmail.com";
const RECEPTION = "reception@mbcenter.bg";
const OFFER_ID = "offer-wo-1";
const EDIT_URL = `/bg/mb-admin/offers/edit/?id=${OFFER_ID}`;

function makeOffer() {
  const now = new Date().toISOString();
  return {
    id: OFFER_ID,
    offer_number: "8931214711",
    customer_name: "Тест Клиент",
    customer_phone: "0888000000",
    customer_email: null,
    car_model_text: "GLE (V167)",
    car_model_detail: "GLE 53 AMG 4MATIC",
    repair_name: "Техническо обслужване двигател",
    vin_text: "4JGFB6BE6LA133033",
    license_plate: "CB9538OK",
    mileage: 125000,
    mileage_unit: "km",
    car_year: null,
    created_by_name: "Приемна",
    status: "draft",
    total_net: 0,
    total_vat: 0,
    total_gross: 0,
    discount_percent: 0,
    discount_parts_percent: 0,
    discount_services_percent: 0,
    currency: "EUR",
    notes: null,
    notes_internal: null,
    notes_service: "Шум отпред вдясно",
    service_card_number: null,
    service_card_generated_at: null,
    performed_by: null,
    assyst_remaining_time: null,
    assyst_remaining_mileage: null,
    assyst_service_code: null,
    assyst_service_description: null,
    assyst_mileage_unit: null,
    prepayments_eur: null,
    created_at: now,
    updated_at: now,
    last_edited_at: null,
    client_id: null,
    car_id: null,
    created_by: null,
    client: null,
    car: null,
    items: [
      {
        id: "i1",
        offer_id: OFFER_ID,
        type: "part",
        description: "Маслен филтър",
        brand: null,
        part_number: "A2561840000",
        unit_price: 20,
        quantity: 1,
        total: 20,
        sort_order: 0,
        cost_price: 10,
      },
    ],
    service_actions: [],
  };
}

/**
 * The shared mock answers every GET with an array, but the edit page loads
 * the offer with `.single()`, which expects one object. Serve the offer here;
 * routes added later take precedence, everything else falls through.
 */
async function serveOffer(page: Page, offer: ReturnType<typeof makeOffer>) {
  const gets = { count: 0 };
  await page.route(`https://${SUPABASE_HOST}/rest/v1/offers**`, (route) => {
    const req = route.request();
    if (req.method() !== "GET") return route.fallback();
    gets.count++;
    const single = (req.headers()["accept"] ?? "").includes("vnd.pgrst.object");
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify(single ? offer : [offer]),
    });
  });
  return gets;
}

async function openAs(page: Page, role: Role, email: string, url = EDIT_URL) {
  const offer = makeOffer();
  await signIn(page, { email, role });
  await mockSupabase(page, seedWorkers(emptyDb()), { role, full_name: "Тест" });
  const gets = await serveOffer(page, offer);
  await page.goto(url);
  return { offer, gets };
}

const orderButton = (page: Page) =>
  page.getByRole("button", { name: "Изтегли сервизна поръчка" });
const offerButton = (page: Page) =>
  page.getByRole("button", { name: "Изтегли оферта" });

test.describe("Сервизна поръчка", () => {
  test("admin sees it next to Изтегли оферта, each half the row", async ({
    page,
  }) => {
    await openAs(page, "admin", ADMIN);
    await expect(orderButton(page)).toBeVisible({ timeout: 20_000 });
    await expect(offerButton(page)).toBeVisible();

    const a = (await offerButton(page).boundingBox())!;
    const b = (await orderButton(page).boundingBox())!;
    expect(Math.abs(a.y - b.y)).toBeLessThan(1); // same row
    expect(Math.abs(a.width - b.width)).toBeLessThan(2); // equal halves
    expect(b.x).toBeGreaterThan(a.x + a.width - 1); // order button on the right
  });

  test("the label fits one line when it can, else two, icon always beside it", async ({
    page,
  }) => {
    await openAs(page, "admin", ADMIN);
    await expect(orderButton(page)).toBeVisible({ timeout: 20_000 });

    // Icon → text gap and how far the icon+text group is off-centre.
    const layout = (button: ReturnType<typeof orderButton>) =>
      button.evaluate((el) => {
        const svg = el.querySelector("svg")!.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(el);
        const lines = Array.from(range.getClientRects()).filter(
          (r) => r.width > 0 && r.left > svg.right,
        );
        const textLeft = Math.min(...lines.map((r) => r.left));
        const textRight = Math.max(...lines.map((r) => r.right));
        const box = el.getBoundingClientRect();
        return {
          lines: new Set(lines.map((r) => Math.round(r.top))).size,
          gap: textLeft - svg.right,
          offCentre: Math.abs(svg.left - box.left - (box.right - textRight)),
        };
      });

    // Sidebar is 20rem at lg, 22rem at xl, 28rem from 2200px, 34rem from
    // 3000px, and full width below lg. Where the button is wide enough the
    // whole label must sit on one line; otherwise on two.
    const oneLine = new Set([900, 3000]);
    for (const width of [1024, 1279, 1280, 1920, 2200, 3000, 900]) {
      await page.setViewportSize({ width, height: 900 });
      const order = await layout(orderButton(page));
      const offer = await layout(offerButton(page));
      expect(order.lines, `lines @${width}`).toBe(oneLine.has(width) ? 1 : 2);
      expect(Math.abs(order.gap - offer.gap), `gap @${width}`).toBeLessThan(1);
      expect(order.offCentre, `centred @${width}`).toBeLessThan(3);
    }
  });

  test("reception sees it", async ({ page }) => {
    await openAs(page, "reception", RECEPTION);
    await expect(orderButton(page)).toBeVisible({ timeout: 20_000 });
  });

  test("mechanics do not see it in their view", async ({ page }) => {
    await openAs(
      page,
      "mechanic",
      "mechanic@mbcenter.bg",
      `/bg/mb-admin-mechanics/offers/edit/?id=${OFFER_ID}`,
    );
    await expect(page.getByText("Техническо обслужване двигател")).toBeVisible({
      timeout: 20_000,
    });
    await expect(orderButton(page)).toHaveCount(0);
  });

  test("downloads a PDF re-read from the DB, without touching the offer", async ({
    page,
  }, testInfo) => {
    const { gets } = await openAs(page, "admin", ADMIN);
    await expect(orderButton(page)).toBeVisible({ timeout: 20_000 });
    const writes: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes(SUPABASE_HOST) && ["POST", "PATCH", "DELETE"].includes(r.method()))
        writes.push(`${r.method()} ${r.url()}`);
    });
    const getsBefore = gets.count;

    const downloadPromise = page.waitForEvent("download", { timeout: 25_000 });
    await orderButton(page).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("service-order-8931214711.pdf");
    const file = testInfo.outputPath("service-order.pdf");
    await download.saveAs(file);
    expect(readFileSync(file).subarray(0, 4).toString()).toBe("%PDF");
    expect(gets.count).toBeGreaterThan(getsBefore);
    expect(writes.filter((w) => w.includes("/rest/v1/offers"))).toEqual([]);
  });

  test("unsaved edits block printing with a clear message", async ({ page }) => {
    await openAs(page, "admin", ADMIN);
    await expect(orderButton(page)).toBeVisible({ timeout: 20_000 });

    const repair = page.getByPlaceholder("Въведете наименование на ремонта");
    await expect(repair).toHaveValue("Техническо обслужване двигател");
    await repair.fill("Смяна на накладки");

    let downloaded = false;
    page.on("download", () => (downloaded = true));
    await orderButton(page).click();

    await expect(page.getByText(/Има незапазени промени/)).toBeVisible();
    await page.waitForTimeout(1500);
    expect(downloaded).toBe(false);
  });

  test("Изтегли оферта still downloads the offer", async ({ page }) => {
    await openAs(page, "admin", ADMIN);
    await expect(offerButton(page)).toBeVisible({ timeout: 20_000 });

    const downloadPromise = page.waitForEvent("download", { timeout: 25_000 });
    await offerButton(page).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("offer-8931214711.pdf");
  });
});
