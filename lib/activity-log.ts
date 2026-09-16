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

/** Bulgarian labels for the offer fields people recognise in the form. */
const OFFER_LABELS: Record<string, string> = {
  customer_name: "Клиент",
  customer_phone: "Телефон",
  customer_email: "Имейл",
  car_model_text: "Модел",
  car_model_detail: "Точен модел",
  repair_name: "Наименование на ремонт",
  vin_text: "VIN номер",
  license_plate: "Регистрационен номер",
  mileage: "Пробег",
  created_by_name: "Създадена от",
  performed_by: "Извършил",
  status: "Статус",
  total_net: "Сума без ДДС",
  total_vat: "ДДС",
  total_gross: "Общо с ДДС",
  discount_percent: "Отстъпка (%)",
  discount_parts_percent: "Отстъпка части (%)",
  discount_services_percent: "Отстъпка труд (%)",
  notes: "Бележка",
  notes_internal: "Вътрешна бележка",
  notes_service: "Бележка за сервиза",
  service_card_number: "Сервизна карта",
  prepayments_eur: "Авансови плащания",
};

/** Columns the database maintains itself; never a log line. */
const OFFER_IGNORED = new Set([
  "id",
  "created_at",
  "updated_at",
  "last_edited_at",
  "effective_at",
  "created_by",
  "client_id",
  "car_id",
  "offer_number",
  "currency",
]);

const OFFER_STATUS_BG: Record<string, string> = {
  draft: "Чернова",
  sent: "Изпратена",
  approved: "Одобрена",
  parts_ordered: "Поръчани части",
  finished: "Приключена",
  cancelled: "Отказана",
};

const OFFER_MONEY = new Set(["total_net", "total_vat", "total_gross"]);

function formatOfferValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "status") return OFFER_STATUS_BG[String(value)] ?? String(value);
  if (OFFER_MONEY.has(field)) return money(value);
  if (Array.isArray(value)) {
    return value.length ? value.map((v) => String(v)).join(", ") : "—";
  }
  return String(value);
}

/**
 * Compare an offer before and after a save.
 *
 * Walks every column of the saved row rather than a chosen few, so a field
 * added to the form later is logged without anyone remembering to list it
 * here. `OFFER_IGNORED` removes only bookkeeping noise.
 */
export function diffOffer(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): ActivityChange[] {
  const changes: ActivityChange[] = [];
  for (const field of Object.keys(after)) {
    if (OFFER_IGNORED.has(field)) continue;
    const from = formatOfferValue(field, before?.[field]);
    const to = formatOfferValue(field, after[field]);
    if (from === to) continue;
    changes.push({ field, label: OFFER_LABELS[field] ?? field, from, to });
  }
  return changes;
}

/** "Оферта №00123" — the handle the log shows for an offer. */
export function offerLabel(offer: {
  offer_number?: string | null;
  customer_name?: string | null;
}): string {
  if (offer.offer_number) return `Оферта №${offer.offer_number}`;
  return offer.customer_name || "Оферта";
}

/** Bulgarian section names, so the log reads like the menu. */
export const SECTION_LABELS: Record<string, string> = {
  offers: "Оферти",
  // Entries written before the section names matched the table names.
  offer: "Оферти",
  daily_turnover: "Дневен оборот",
  daily_turnover_notes: "Забележки оборот",
  warehouse_parts: "Склад",
  earnings_entries: "Заработки",
  earnings_monthly_summary: "Заработки (месец)",
  leave_periods: "Отпуски",
  leave_entitlements: "Право на отпуск",
  inspections: "Прегледи",
  mechanics: "Механици",
  receptionists: "Приемчици",
  hourly_activities: "Дейности на час",
  fixed_activities: "Дейности на бройка",
};

/** Labels for the fields that show up across the other sections. */
const COMMON_LABELS: Record<string, string> = {
  name: "Име",
  full_name: "Име",
  description: "Описание",
  quantity: "Количество",
  part_number: "Номер на част",
  manufacturer: "Производител",
  unit_price: "Единична цена",
  cost_price: "Доставна цена",
  amount: "Сума",
  amount_eur: "Сума",
  hours: "Часове",
  rate: "Ставка",
  entry_date: "Дата",
  start_date: "От дата",
  end_date: "До дата",
  days: "Дни",
  kind: "Вид",
  note: "Бележка",
  notes: "Бележка",
  status: "Статус",
  mechanic_name: "Механик",
  worker_name: "Служител",
  month: "Месец",
  year: "Година",
};

const COMMON_IGNORED = new Set([
  "id",
  "created_at",
  "updated_at",
  "last_edited_at",
  "effective_at",
  "created_by",
]);

const COMMON_MONEY = new Set([
  "amount",
  "amount_eur",
  "unit_price",
  "cost_price",
  "rate",
]);

function formatCommon(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (COMMON_MONEY.has(field)) return money(value);
  if (Array.isArray(value)) {
    return value.length ? value.map((v) => String(v)).join(", ") : "—";
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Compare any row before and after a change.
 *
 * Used by the sections that have no diff helper of their own. Walks the keys
 * of the new row, so a column added later is logged without being listed here
 * first; only bookkeeping columns are skipped.
 */
export function diffRow(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown>,
): ActivityChange[] {
  const changes: ActivityChange[] = [];
  for (const field of Object.keys(after)) {
    if (COMMON_IGNORED.has(field)) continue;
    const from = formatCommon(field, before?.[field]);
    const to = formatCommon(field, after[field]);
    if (from === to) continue;
    changes.push({ field, label: COMMON_LABELS[field] ?? field, from, to });
  }
  return changes;
}

/**
 * Log a change in any section, in one call.
 *
 * `logActivity` needs an actor and a label; this fills both in from the
 * signed-in profile and the row itself, so a screen only has to say what it
 * did and to which row.
 */
export function logChange(opts: {
  table: string;
  action: ActivityAction;
  actor: ActivityActor;
  row: Record<string, unknown> | null | undefined;
  /** Previous state, for an edit. Omit for create and delete. */
  before?: Record<string, unknown> | null;
}) {
  const { table, action, actor, row, before } = opts;
  const section = SECTION_LABELS[table] ?? table;

  const name =
    (row?.name as string) ??
    (row?.full_name as string) ??
    (row?.description as string) ??
    (row?.part_number as string) ??
    (row?.worker_name as string) ??
    (row?.mechanic_name as string) ??
    null;

  const changes =
    action === "edit" && row ? diffRow(before, row) : undefined;

  // An edit that changed nothing real is not worth an entry.
  if (action === "edit" && (!changes || changes.length === 0)) return;

  void logActivity({
    actor,
    entityType: table,
    entityId: (row?.id as string) ?? null,
    entityLabel: name ? `${section} · ${name}` : section,
    action,
    changes,
  });
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
