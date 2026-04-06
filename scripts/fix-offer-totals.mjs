/**
 * One-time migration: recalculate total_gross / total_net / total_vat
 * for all existing offers using the correct formula:
 *
 *   partsTotal    = sum(unit_price * quantity) for all offer_items
 *   serviceTotal  = sum(fixed_price_amount if is_fixed_price,
 *                       else time_hours * price_per_hour_eur_net)
 *   partsDiscount = partsTotal    * (discount_parts_percent / 100)
 *   svcDiscount   = serviceTotal  * (discount_services_percent / 100)
 *   gross = net   = partsTotal + serviceTotal - partsDiscount - svcDiscount
 *   vat           = 0  (prices already include VAT)
 *
 * Run with:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/fix-offer-totals.mjs
 *
 * The service role key bypasses RLS. Get it from:
 *   Supabase dashboard → Project Settings → API → service_role secret
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hungfycufkzhcraotaub.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error(
    "ERROR: SUPABASE_SERVICE_ROLE_KEY env var is required.\n" +
    "Get it from: Supabase dashboard → Project Settings → API → service_role secret\n" +
    "Run as: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/fix-offer-totals.mjs"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function parseTimeToHours(s) {
  const t = (s ?? "").trim();
  if (!t) return 0;
  if (t.includes(":")) {
    const parts = t.split(":");
    return (parseInt(parts[0], 10) || 0) + (parseInt(parts[1], 10) || 0) / 60;
  }
  const hMatch = t.match(/(\d+)\s*ч/) || t.match(/(\d+)\s*h/i);
  const mMatch = t.match(/(\d+)\s*мин/) || t.match(/(\d+)\s*min/i);
  if (hMatch || mMatch) {
    return (hMatch ? parseInt(hMatch[1], 10) : 0) +
           (mMatch ? parseInt(mMatch[1], 10) : 0) / 60;
  }
  const n = parseFloat(t.replace(",", "."));
  if (!Number.isNaN(n) && n >= 0 && /^[\d.,\s]+$/.test(t)) return n;
  return 0;
}

async function main() {
  console.log("Fetching all offers...");

  // Fetch all offers with items and service actions (paginated)
  let allOffers = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("offers")
      .select(
        `id, discount_parts_percent, discount_services_percent,
         items:offer_items(unit_price, quantity),
         service_actions(is_fixed_price, fixed_price_amount, time_required_text, price_per_hour_eur_net)`
      )
      .range(from, from + PAGE - 1);

    if (error) {
      console.error("Fetch error:", error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    allOffers = allOffers.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  console.log(`Found ${allOffers.length} offers. Recalculating...`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const offer of allOffers) {
    const partsTotal = (offer.items || []).reduce((sum, item) => {
      return sum + (item.unit_price || 0) * (item.quantity || 1);
    }, 0);

    const serviceTotal = (offer.service_actions || []).reduce((sum, action) => {
      if (action.is_fixed_price && action.fixed_price_amount != null) {
        return sum + action.fixed_price_amount;
      }
      const hours = parseTimeToHours(action.time_required_text || "0");
      return sum + hours * (action.price_per_hour_eur_net || 0);
    }, 0);

    const discountParts = partsTotal * ((offer.discount_parts_percent || 0) / 100);
    const discountSvc = serviceTotal * ((offer.discount_services_percent || 0) / 100);
    const gross = partsTotal + serviceTotal - discountParts - discountSvc;

    const { error } = await supabase
      .from("offers")
      .update({ total_gross: gross, total_net: gross, total_vat: 0 })
      .eq("id", offer.id);

    if (error) {
      console.error(`  ERROR offer ${offer.id}: ${error.message}`);
      errors++;
    } else {
      updated++;
    }
  }

  console.log(`\nDone. Updated: ${updated}, Errors: ${errors}`);
}

main();
