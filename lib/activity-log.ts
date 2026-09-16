/**
 * Activity log (Логове) — who changed what, and when.
 *
 * Every write here is BEST-EFFORT. Logging is an observability feature, not
 * part of the business transaction: if the table is missing (migration not
 * run yet), the network drops, or RLS rejects the insert, the action the user
 * actually asked for must still succeed. Nothing in this module throws.
 *
 * Reading is admin-only and enforced by RLS, not by this module.
 */

import { supabase } from "@/lib/supabase/client";
import type {
  ActivityAction,
  ActivityChange,
  ActivityEntityType,
  ActivityLogEntry,
} from "@/types/database";

/**
 * Accounts whose actions are never written to the log.
 *
 * The developer account works on the live site while building and fixing
 * things, and that maintenance noise would bury the entries the client
 * actually cares about — who on their team changed which record.
 *
 * This only skips the WRITE. Anything logged before an account was added
 * here stays in the table, and reading is unaffected.
 */
export const UNLOGGED_EMAILS = ["oliverqueeneb@gmail.com"];

/** Whether this account's actions should be recorded at all. */
function isLoggable(email: string | null): boolean {
  if (!email) return true; // unknown account: log it rather than lose it
  return !UNLOGGED_EMAILS.includes(email.trim().toLowerCase());
}

/** The signed-in user, as the log wants to remember them. */
export interface ActivityActor {
  authId: string | null;
  name: string | null;
  email: string | null;
}

interface LogArgs {
  actor: ActivityActor;
  entityType: ActivityEntityType;
  entityId: string | null;
  entityLabel: string | null;
  action: ActivityAction;
  /** Field-level diff; omit for create and delete. */
  changes?: ActivityChange[];
}

/**
 * Append one entry. Never throws and never rejects — failures are logged to
 * the console and swallowed, so a caller can `void logActivity(...)` without
 * a catch and without awaiting.
 */
export async function logActivity(args: LogArgs): Promise<void> {
  // Checked here rather than at each call site, so a new caller cannot
  // accidentally reintroduce the developer account's noise.
  if (!isLoggable(args.actor.email)) return;

  try {
    // `activity_log` is not in the generated Database map (newer tables are
    // hand-written interfaces here), so the insert argument widens to `never`
    // — same `as never` cast the other turnover writes use.
    const { error } = await supabase.from("activity_log").insert({
      auth_id: args.actor.authId,
      user_name: args.actor.name,
      user_email: args.actor.email,
      entity_type: args.entityType,
      entity_id: args.entityId,
      entity_label: args.entityLabel,
      action: args.action,
      changes: args.changes ?? [],
    } as never);
    if (error) {
      // PGRST205 = table missing, i.e. migration_activity_log.sql has not been
      // run yet. Expected before the migration lands; not worth alarming about.
      console.warn("[activity-log] insert failed:", error.message);
    }
  } catch (err) {
    console.warn("[activity-log] insert threw:", err);
  }
}

/** Money as the UI shows it: "350,00 €". */
function money(value: unknown): string {
  const n = Number(value) || 0;
  return `${n.toFixed(2).replace(".", ",")} €`;
}

const METHOD_BG: Record<string, string> = {
  cash: "Брой",
  card: "Карта",
  bank: "Банка",
  mixed: "Смесено",
};

/**
 * The turnover fields worth logging, with the Bulgarian label the user sees
 * in the edit form and how each value should read in the log.
 *
 * `parts_cost` is included deliberately: the log is admin-only by RLS, and an
 * admin correcting a cost is exactly the kind of change worth an audit trail.
 */
const TURNOVER_FIELDS: {
  field: string;
  label: string;
  format: (v: unknown) => string;
}[] = [
  { field: "entry_date", label: "Дата", format: (v) => String(v ?? "—") },
  { field: "client_name", label: "Клиент", format: (v) => String(v ?? "—") },
  { field: "vehicle", label: "Автомобил", format: (v) => String(v ?? "—") },
  { field: "license_plate", label: "Рег. номер", format: (v) => String(v ?? "—") },
  { field: "repair_name", label: "Ремонт", format: (v) => String(v ?? "—") },
  { field: "amount", label: "Сума", format: money },
  { field: "advance_applied", label: "Аванс", format: money },
  {
    field: "payment_method",
    label: "Начин на плащане",
    format: (v) => METHOD_BG[String(v)] ?? String(v ?? "—"),
  },
  { field: "amount_cash", label: "Брой", format: money },
  { field: "amount_card", label: "Карта", format: money },
  { field: "amount_bank", label: "Банка", format: money },
  {
    field: "parts_cost",
    label: "Себестойност на частите",
    format: money,
  },
  { field: "notes", label: "Бележка", format: (v) => String(v ?? "—") },
];

/**
 * Compare a turnover row before and after an edit.
 *
 * Only genuinely changed fields are returned, so an edit that touched one
 * field logs one line instead of the whole row. Values are compared as their
 * formatted strings, which keeps 300 and "300.00" from reading as a change.
 */
export function diffTurnover(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): ActivityChange[] {
  const changes: ActivityChange[] = [];
  for (const { field, label, format } of TURNOVER_FIELDS) {
    if (!(field in after)) continue;
    const from = format(before[field]);
    const to = format(after[field]);
    if (from !== to) changes.push({ field, label, from, to });
  }
  return changes;
}

/** "Дневен оборот" row handle: the vehicle, or the offer it came from. */
export function turnoverLabel(row: {
  vehicle?: string | null;
  license_plate?: string | null;
  offer_number?: string | null;
  service_card_number?: string | null;
}): string {
  const car = [row.vehicle, row.license_plate].filter(Boolean).join(" · ");
  if (car) return car;
  if (row.service_card_number) return `Сервизна карта ${row.service_card_number}`;
  if (row.offer_number) return `Оферта №${row.offer_number}`;
  return "Запис";
}

/** Render one entry's diff as "Сума: 300,00 € → 350,00 €; ...". */
export function formatChanges(entry: ActivityLogEntry): string {
  if (!entry.changes?.length) return "";
  return entry.changes
    .map((c) => `${c.label}: ${c.from} → ${c.to}`)
    .join("; ");
}
