/**
 * Daily turnover writes.
 *
 * A turnover row is created when a service card is generated, and manually
 * from the turnover page. Reception can create rows but cannot edit or delete
 * them — that is enforced by RLS in supabase/migration_daily_turnover.sql.
 */

import { supabase } from "@/lib/supabase/client";
import type {
  DailyTurnoverInsert,
  OfferWithRelations,
  PaymentMethod,
} from "@/types/database";

export interface PaymentSplitInput {
  method: PaymentMethod;
  amount: number;
}

/** True when this offer already has turnover rows recorded. */
export async function offerHasTurnover(offerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("daily_turnover")
    .select("id")
    .eq("offer_id", offerId)
    .limit(1);

  if (error) {
    // Surface the failure instead of guessing. Callers decide what to do:
    // guessing "recorded" silently drops a payment, guessing "not recorded"
    // silently duplicates one.
    console.error("[turnover] existence check failed:", error);
    throw error;
  }
  return (data?.length ?? 0) > 0;
}

/**
 * Record the payment for a generated service card.
 *
 * Idempotent per offer: if rows already exist for this offer, nothing is
 * written, so re-generating a service card never double-counts turnover.
 */
export async function recordServiceCardTurnover(params: {
  offer: Pick<
    OfferWithRelations,
    | "id"
    | "offer_number"
    | "service_card_number"
    | "customer_name"
    | "car_model_text"
    | "license_plate"
    | "repair_name"
  >;
  splits: PaymentSplitInput[];
  createdByName?: string | null;
  entryDate?: string;
}): Promise<{ inserted: number; skipped: boolean }> {
  const { offer, splits, createdByName, entryDate } = params;

  if (!offer.id || offer.id === "temp") return { inserted: 0, skipped: true };
  if (await offerHasTurnover(offer.id)) return { inserted: 0, skipped: true };

  // A split payment stays ONE row: the per-method columns carry the breakdown,
  // and the database trigger derives payment_method ("mixed" when several) and
  // the total from them.
  const byMethod = { cash: 0, card: 0, bank: 0 };
  for (const s of splits) {
    if (s.amount > 0) byMethod[s.method] += s.amount;
  }
  const total = round2(byMethod.cash + byMethod.card + byMethod.bank);
  if (total <= 0) return { inserted: 0, skipped: true };

  const methodsUsed = (["cash", "card", "bank"] as PaymentMethod[]).filter(
    (m) => byMethod[m] > 0,
  );

  // Snapshot what the parts cost us, so the monthly profit figure cannot be
  // rewritten later by warehouse or offer price changes.
  let partsCost = 0;
  try {
    const { data: items } = await supabase
      .from("offer_items")
      .select("cost_price, quantity")
      .eq("offer_id", offer.id)
      .eq("type", "part");
    for (const it of (items ?? []) as { cost_price: number | null; quantity: number | null }[]) {
      partsCost += (Number(it.cost_price) || 0) * (Number(it.quantity) || 1);
    }
  } catch (error) {
    console.error("[turnover] could not read parts cost:", error);
  }

  const rows: DailyTurnoverInsert[] = [
    {
      source: "service_card",
      offer_id: offer.id,
      offer_number: offer.offer_number ?? null,
      service_card_number: offer.service_card_number ?? null,
      entry_date: entryDate ?? localDateKey(new Date()),
      vehicle: offer.car_model_text ?? null,
      license_plate: offer.license_plate ?? null,
      repair_name: offer.repair_name ?? null,
      client_name: offer.customer_name ?? null,
      amount: total,
      payment_method: methodsUsed.length > 1 ? "mixed" : methodsUsed[0],
      amount_cash: round2(byMethod.cash),
      amount_card: round2(byMethod.card),
      amount_bank: round2(byMethod.bank),
      parts_cost: round2(partsCost),
      notes: null,
      created_by_name: createdByName ?? null,
    },
  ];

  if (rows.length === 0) return { inserted: 0, skipped: true };

  const { error } = await supabase
    .from("daily_turnover")
    .insert(rows as never);

  if (error) {
    console.error("[turnover] insert failed:", error);
    throw error;
  }

  return { inserted: rows.length, skipped: false };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Local YYYY-MM-DD (toISOString would shift across the UTC boundary). */
export function localDateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
