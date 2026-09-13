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

/**
 * True when this offer's FINAL payment has already been recorded.
 *
 * Advance rows are excluded deliberately: an offer may already have advances
 * in the turnover while its closing balance is still outstanding.
 */
export async function offerHasTurnover(offerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("daily_turnover")
    .select("id")
    .eq("offer_id", offerId)
    .eq("is_advance", false)
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
  /** Advances already collected for this job, for the profit calculation. */
  advanceApplied?: number;
}): Promise<{ inserted: number; skipped: boolean }> {
  const {
    offer,
    splits,
    createdByName,
    entryDate,
    advanceApplied = 0,
  } = params;

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
      is_advance: false,
      // Advances already collected for this job. Added back for the profit
      // calculation only — turnover still counts just this row's amount.
      advance_applied: round2(advanceApplied),
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

/**
 * Records an advance (авансово плащане) on the day the money was taken.
 *
 * Kept separate from the closing payment so each day's till is correct: the
 * advance belongs to its own day, and the closing day carries only the
 * remaining balance.
 */
export async function recordAdvanceTurnover(params: {
  offer: Pick<
    OfferWithRelations,
    | "id"
    | "offer_number"
    | "customer_name"
    | "car_model_text"
    | "license_plate"
    | "repair_name"
  >;
  amount: number;
  method: PaymentMethod;
  entryDate?: string;
  createdByName?: string | null;
}): Promise<{ inserted: number }> {
  const { offer, amount, method, entryDate, createdByName } = params;
  if (!offer.id || offer.id === "temp" || !(amount > 0)) {
    return { inserted: 0 };
  }

  const value = round2(amount);
  const row: DailyTurnoverInsert = {
    source: "service_card",
    offer_id: offer.id,
    offer_number: offer.offer_number ?? null,
    service_card_number: null,
    entry_date: entryDate ?? localDateKey(new Date()),
    vehicle: offer.car_model_text ?? null,
    license_plate: offer.license_plate ?? null,
    repair_name: offer.repair_name
      ? `Аванс - ${offer.repair_name}`
      : "Авансово плащане",
    client_name: offer.customer_name ?? null,
    amount: value,
    payment_method: method,
    amount_cash: method === "cash" ? value : 0,
    amount_card: method === "card" ? value : 0,
    amount_bank: method === "bank" ? value : 0,
    // Cost belongs to the closing row, so an advance never inflates profit.
    parts_cost: 0,
    is_advance: true,
    advance_applied: 0,
    notes: null,
    created_by_name: createdByName ?? null,
  };

  const { error } = await supabase
    .from("daily_turnover")
    .insert(row as never);

  if (error) {
    console.error("[turnover] advance insert failed:", error);
    throw error;
  }
  return { inserted: 1 };
}

/** Total of the advances already recorded in the turnover for this offer. */
export async function advancesRecorded(offerId: string): Promise<number> {
  const { data, error } = await supabase
    .from("daily_turnover")
    .select("amount")
    .eq("offer_id", offerId)
    .eq("is_advance", true);

  if (error) {
    console.error("[turnover] advance lookup failed:", error);
    throw error;
  }
  return (data ?? []).reduce(
    (sum: number, r: { amount: number | null }) => sum + (Number(r.amount) || 0),
    0,
  );
}
