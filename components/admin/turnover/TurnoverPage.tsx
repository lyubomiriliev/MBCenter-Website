"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuthContext } from "@/components/admin/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { localDateKey } from "@/lib/turnover";
import { canSeeBetaSections } from "@/lib/feature-flags";
import type { DailyTurnover, PaymentMethod } from "@/types/database";

const MONTHS_BG = [
  "януари", "февруари", "март", "април", "май", "юни",
  "юли", "август", "септември", "октомври", "ноември", "декември",
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const METHOD_LABEL: Record<PaymentMethod, { bg: string; en: string }> = {
  cash: { bg: "Брой", en: "Cash" },
  card: { bg: "Карта", en: "Card" },
  bank: { bg: "Банка", en: "Bank" },
};

const METHOD_STYLE: Record<PaymentMethod, string> = {
  cash: "bg-green-500/20 text-green-400 border-green-500/30",
  card: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  bank: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

type ViewMode = "day" | "month";

interface ManualForm {
  entry_date: string;
  vehicle: string;
  license_plate: string;
  repair_name: string;
  client_name: string;
  amount: string;
  payment_method: PaymentMethod;
  /** What the parts cost us; drives the profit figure. Optional. */
  parts_cost: string;
  notes: string;
  /** Opt-in: split one payment across several methods (new entries only). */
  splitMode: boolean;
  splitAmounts: Record<PaymentMethod, string>;
}

/**
 * The methods a row actually used. A single-method row yields one badge with
 * no amount (the Сума column already shows it); a mixed row yields one badge
 * per method, each labelled with its part.
 */
function methodParts(r: DailyTurnover) {
  const parts = (
    [
      ["cash", Number(r.amount_cash) || 0],
      ["card", Number(r.amount_card) || 0],
      ["bank", Number(r.amount_bank) || 0],
    ] as [PaymentMethod, number][]
  )
    .filter(([, amount]) => amount > 0)
    .map(([method, amount]) => ({ method, amount, showAmount: true }));

  if (parts.length > 1) return parts;

  // Single method (or a legacy row with no breakdown yet).
  const only =
    parts[0]?.method ??
    (r.payment_method === "mixed" ? "cash" : r.payment_method);
  return [{ method: only, amount: Number(r.amount) || 0, showAmount: false }];
}

/**
 * Draft persistence for the "Нов запис" form.
 *
 * A save can fail (a missing migration, a lost connection, a permission
 * error) and retyping a whole entry is painful, so the in-progress form is
 * mirrored to localStorage and restored when the dialog is reopened. Only
 * NEW entries are kept — editing an existing row always loads from the row.
 * Cleared on a successful save or an explicit cancel.
 */
const DRAFT_KEY = "mbc.turnover.draft";

function loadDraft(): ManualForm | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ManualForm>;
    if (!parsed || typeof parsed !== "object") return null;
    // Merge over a fresh form so a shape change in a later version can never
    // produce a half-populated object.
    return {
      ...emptyForm(),
      ...parsed,
      splitAmounts: {
        ...emptyForm().splitAmounts,
        ...(parsed.splitAmounts ?? {}),
      },
    };
  } catch {
    return null;
  }
}

function saveDraft(form: ManualForm) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  } catch {
    // Storage can be unavailable (private mode, quota); drafts are a
    // convenience, never a requirement.
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const parseAmount = (v: string) => {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const emptyForm = (): ManualForm => ({
  entry_date: localDateKey(new Date()),
  vehicle: "",
  license_plate: "",
  repair_name: "",
  client_name: "",
  amount: "",
  payment_method: "cash",
  parts_cost: "",
  notes: "",
  splitMode: false,
  splitAmounts: { cash: "", card: "", bank: "" },
});

export function TurnoverPage() {
  const locale = useLocale();
  const isBg = locale === "bg";
  const { profile, user, isSuperAdmin } = useSupabaseAuthContext();
  // Only the true admin may correct or remove turnover rows; reception is read-only.
  const canEdit = isSuperAdmin();
  // Profit is owner-level information: the true admin only, never приемна.
  // Role is the real gate; the beta flag only narrows it further while the
  // section is in testing. It must never widen access on its own - an "||"
  // here would hand profit to any role using the beta account.
  const canSeeProfit = isSuperAdmin() && canSeeBetaSections(user?.email);

  const [view, setView] = useState<ViewMode>("day");
  const [cursor, setCursor] = useState(() => new Date());
  const [rows, setRows] = useState<DailyTurnover[]>([]);
  // Month figures are shown even while looking at a single day, so the month's
  // running total and profit are always in view.
  const [monthTotals, setMonthTotals] = useState({
    all: 0,
    cost: 0,
    profit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DailyTurnover | null>(null);
  const [form, setForm] = useState<ManualForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DailyTurnover | null>(null);

  const range = useMemo(() => {
    if (view === "day") {
      const key = localDateKey(cursor);
      return { from: key, to: key };
    }
    const from = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    return { from: localDateKey(from), to: localDateKey(to) };
  }, [view, cursor]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase
      .from("daily_turnover")
      .select("*")
      .gte("entry_date", range.from)
      .lte("entry_date", range.to)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (err) {
      console.error("[turnover] load failed:", err);
      // PGRST205 = table missing, i.e. the migration has not been run yet.
      setError(
        err.code === "PGRST205"
          ? isBg
            ? "Таблицата за оборот не съществува. Изпълнете supabase/migration_daily_turnover.sql в Supabase SQL Editor."
            : "The turnover table does not exist. Run supabase/migration_daily_turnover.sql in the Supabase SQL Editor."
          : isBg
            ? "Грешка при зареждане на оборота."
            : "Failed to load turnover.",
      );
      setRows([]);
    } else {
      setRows((data ?? []) as DailyTurnover[]);
    }

    // Month-to-date figures, independent of the day/month view.
    const monthStart = localDateKey(
      new Date(cursor.getFullYear(), cursor.getMonth(), 1),
    );
    const monthEnd = localDateKey(
      new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0),
    );
    const { data: monthRows, error: monthErr } = await supabase
      .from("daily_turnover")
      .select("amount, parts_cost")
      .gte("entry_date", monthStart)
      .lte("entry_date", monthEnd);

    if (monthErr) {
      console.error("[turnover] month totals failed:", monthErr);
      setMonthTotals({ all: 0, cost: 0, profit: 0 });
    } else {
      let all = 0;
      let cost = 0;
      for (const r of (monthRows ?? []) as Pick<
        DailyTurnover,
        "amount" | "parts_cost"
      >[]) {
        all += Number(r.amount) || 0;
        cost += Number(r.parts_cost) || 0;
      }
      setMonthTotals({ all, cost, profit: all - cost });
    }

    setLoading(false);
  }, [range.from, range.to, isBg, cursor]);

  useEffect(() => {
    load();
  }, [load]);

  // Totals come from the per-method columns so a mixed row contributes its
  // cash part to Брой and its card part to Карта.
  const totals = useMemo(() => {
    const t = { cash: 0, card: 0, bank: 0, all: 0, cost: 0, profit: 0 };
    for (const r of rows) {
      t.cash += Number(r.amount_cash) || 0;
      t.card += Number(r.amount_card) || 0;
      t.bank += Number(r.amount_bank) || 0;
      t.all += Number(r.amount) || 0;
      t.cost += Number(r.parts_cost) || 0;
    }
    t.profit = t.all - t.cost;
    return t;
  }, [rows]);

  /** Month view groups rows per day so each day's take is visible at a glance. */
  const grouped = useMemo(() => {
    const map = new Map<string, DailyTurnover[]>();
    for (const r of rows) {
      const list = map.get(r.entry_date) ?? [];
      list.push(r);
      map.set(r.entry_date, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [rows]);

  const step = (dir: 1 | -1) => {
    setCursor((prev) => {
      const next = new Date(prev);
      if (view === "day") next.setDate(next.getDate() + dir);
      else next.setMonth(next.getMonth() + dir);
      return next;
    });
  };

  const periodLabel = useMemo(() => {
    if (view === "day") {
      return cursor.toLocaleDateString(isBg ? "bg-BG" : "en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
    const months = isBg ? MONTHS_BG : MONTHS_EN;
    return `${months[cursor.getMonth()]} ${cursor.getFullYear()}`;
  }, [view, cursor, isBg]);

  /** Non-zero per-method amounts entered in split mode. */
  // Mirror the in-progress new entry so a failed save never loses the typing.
  useEffect(() => {
    if (!formOpen || editing) return;
    saveDraft(form);
  }, [form, formOpen, editing]);

  const splitEntries = useMemo(
    () =>
      (["cash", "card", "bank"] as PaymentMethod[])
        .map((m) => ({ method: m, amount: round2(parseAmount(form.splitAmounts[m])) }))
        .filter((sp) => sp.amount > 0),
    [form.splitAmounts],
  );

  const splitTotal = useMemo(
    () => round2(splitEntries.reduce((sum, sp) => sum + sp.amount, 0)),
    [splitEntries],
  );

  const monthLabelShort = useMemo(() => {
    const months = isBg ? MONTHS_BG : MONTHS_EN;
    return `${months[cursor.getMonth()]} ${cursor.getFullYear()}`;
  }, [cursor, isBg]);

  const openCreate = () => {
    setEditing(null);
    // Restore an unsaved draft if one is waiting, otherwise start fresh on the
    // day currently in view.
    const draft = loadDraft();
    setForm(draft ?? { ...emptyForm(), entry_date: localDateKey(cursor) });
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (row: DailyTurnover) => {
    setEditing(row);
    setForm({
      entry_date: row.entry_date,
      vehicle: row.vehicle ?? "",
      license_plate: row.license_plate ?? "",
      repair_name: row.repair_name ?? "",
      client_name: row.client_name ?? "",
      amount: String(row.amount ?? ""),
      payment_method:
        row.payment_method === "mixed" ? "cash" : row.payment_method,
      parts_cost: Number(row.parts_cost) > 0 ? String(row.parts_cost) : "",
      notes: row.notes ?? "",
      // A mixed row opens straight into split mode with its parts filled in.
      splitMode: row.payment_method === "mixed",
      splitAmounts: {
        cash: Number(row.amount_cash) > 0 ? String(row.amount_cash) : "",
        card: Number(row.amount_card) > 0 ? String(row.amount_card) : "",
        bank: Number(row.amount_bank) > 0 ? String(row.amount_bank) : "",
      },
    });
    setFormError("");
    setFormOpen(true);
  };

  const save = async () => {
    if (!form.entry_date) {
      setFormError(isBg ? "Изберете дата." : "Pick a date.");
      return;
    }

    // Per-method amounts: from the split fields, or the single amount put
    // under the chosen method. Either way this is ONE row.
    const parts = form.splitMode
      ? {
          cash: round2(parseAmount(form.splitAmounts.cash)),
          card: round2(parseAmount(form.splitAmounts.card)),
          bank: round2(parseAmount(form.splitAmounts.bank)),
        }
      : {
          cash: form.payment_method === "cash" ? round2(parseAmount(form.amount)) : 0,
          card: form.payment_method === "card" ? round2(parseAmount(form.amount)) : 0,
          bank: form.payment_method === "bank" ? round2(parseAmount(form.amount)) : 0,
        };

    const total = round2(parts.cash + parts.card + parts.bank);
    if (!(total > 0)) {
      setFormError(
        form.splitMode
          ? isBg
            ? "Въведете поне една сума."
            : "Enter at least one amount."
          : isBg
            ? "Въведете валидна сума."
            : "Enter a valid amount.",
      );
      return;
    }

    const used = (["cash", "card", "bank"] as PaymentMethod[]).filter(
      (m) => parts[m] > 0,
    );

    setSaving(true);
    const payload = {
      entry_date: form.entry_date,
      vehicle: form.vehicle.trim() || null,
      license_plate: form.license_plate.trim() || null,
      repair_name: form.repair_name.trim() || null,
      client_name: form.client_name.trim() || null,
      notes: form.notes.trim() || null,
      parts_cost: round2(parseAmount(form.parts_cost)),
      amount: total,
      amount_cash: parts.cash,
      amount_card: parts.card,
      amount_bank: parts.bank,
      payment_method: used.length > 1 ? "mixed" : used[0],
    };

    const { error: err } = editing
      ? await supabase
          .from("daily_turnover")
          .update(payload as never)
          .eq("id", editing.id)
      : await supabase.from("daily_turnover").insert({
          ...payload,
          source: "manual",
          offer_id: null,
          offer_number: null,
          service_card_number: null,
          created_by_name: profile?.full_name ?? null,
        } as never);

    setSaving(false);
    if (err) {
      console.error("[turnover] save failed:", err);
      // PGRST204/42703 = the per-method columns are missing, i.e. the split
      // payments migration has not been run yet. Say so rather than blaming
      // permissions, which sends the reader down the wrong path.
      const missingColumn =
        err.code === "PGRST204" ||
        err.code === "42703" ||
        /amount_(cash|card|bank)/.test(err.message ?? "");
      setFormError(
        missingColumn
          ? isBg
            ? "Липсва миграция: изпълнете supabase/migration_turnover_split_payments.sql в Supabase SQL Editor."
            : "Missing migration: run supabase/migration_turnover_split_payments.sql in the Supabase SQL Editor."
          : isBg
            ? "Грешка при запис. Проверете правата си."
            : "Save failed. Check your permissions.",
      );
      return;
    }
    clearDraft();
    setFormOpen(false);

    // Move the view to the saved date when it falls outside the current period,
    // otherwise just refresh in place. Changing the cursor re-runs load() via
    // the range effect; when it does not change we must reload explicitly.
    const [y, m, d] = form.entry_date.split("-").map(Number);
    const savedAt = new Date(y, m - 1, d);
    const outOfView =
      form.entry_date < range.from || form.entry_date > range.to;

    if (outOfView) {
      setCursor(savedAt);
    } else {
      load();
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error: err } = await supabase
      .from("daily_turnover")
      .delete()
      .eq("id", deleteTarget.id);
    if (err) {
      console.error("[turnover] delete failed:", err);
      setError(
        isBg
          ? "Грешка при изтриване. Проверете правата си."
          : "Delete failed. Check your permissions.",
      );
    }
    setDeleteTarget(null);
    load();
  };

  return (
    <div className="space-y-6 p-4 sm:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isBg ? "Дневен оборот" : "Daily Turnover"}
          </h1>
          {!canEdit && (
            <p className="text-sm text-mb-silver mt-1">
              {isBg
                ? "Само за преглед — редакция и изтриване са само за администратор."
                : "View only — editing and deleting are admin-only."}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Day / Month switch */}
          <div className="flex rounded-xl border border-mb-border bg-mb-anthracite p-1">
            {(["day", "month"] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setView(m)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg transition-colors",
                  view === m
                    ? "bg-mb-blue text-white"
                    : "text-mb-silver hover:text-white",
                )}
              >
                {m === "day"
                  ? isBg ? "Ден" : "Day"
                  : isBg ? "Месец" : "Month"}
              </button>
            ))}
          </div>

          {/* Period picker */}
          <div className="flex items-center gap-2 bg-mb-anthracite border border-mb-border rounded-xl px-3 py-2">
            <button
              onClick={() => step(-1)}
              className="text-mb-silver hover:text-white p-1 transition-colors"
              aria-label={isBg ? "Назад" : "Previous"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-white font-medium text-sm min-w-[150px] text-center capitalize">
              {periodLabel}
            </span>
            <button
              onClick={() => step(1)}
              className="text-mb-silver hover:text-white p-1 transition-colors"
              aria-label={isBg ? "Напред" : "Next"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <Button onClick={openCreate} className="bg-mb-blue hover:bg-mb-blue/90">
            {isBg ? "Добави запис" : "Add entry"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(["cash", "card", "bank"] as PaymentMethod[]).map((m) => (
          <div
            key={m}
            className="rounded-xl border border-mb-border bg-mb-anthracite p-4"
          >
            <p className="text-xs uppercase tracking-wide text-mb-silver">
              {isBg ? METHOD_LABEL[m].bg : METHOD_LABEL[m].en}
            </p>
            <p className="mt-1 text-xl font-semibold text-white">
              {totals[m].toFixed(2)} €
            </p>
          </div>
        ))}
        <div className="rounded-xl border border-mb-blue/40 bg-mb-blue/10 p-4">
          <p className="text-xs uppercase tracking-wide text-mb-blue">
            {view === "day"
              ? isBg ? "Общо за деня" : "Day total"
              : isBg ? "Общо за месеца" : "Month total"}
          </p>
          <p className="mt-1 text-xl font-semibold text-white">
            {totals.all.toFixed(2)} €
          </p>
        </div>
      </div>

      {/* Month-to-date, plus profit for the owner only. */}
      <div
        className={cn(
          "grid gap-3",
          canSeeProfit ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1",
        )}
      >
        <div className="rounded-xl border border-mb-border bg-mb-anthracite p-4">
          <p className="text-xs uppercase tracking-wide text-mb-silver">
            {isBg ? "Оборот за месеца" : "Month turnover"}
            <span className="ml-1 normal-case opacity-70">
              ({monthLabelShort})
            </span>
          </p>
          <p className="mt-1 text-2xl font-bold text-white">
            {monthTotals.all.toFixed(2)} €
          </p>
        </div>

        {canSeeProfit && (
          <>
            <div className="rounded-xl border border-mb-border bg-mb-anthracite p-4">
              <p className="text-xs uppercase tracking-wide text-mb-silver">
                {isBg ? "Себестойност (части)" : "Parts cost"}
              </p>
              <p className="mt-1 text-2xl font-bold text-mb-silver">
                {monthTotals.cost.toFixed(2)} €
              </p>
            </div>
            <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-green-400">
                {isBg ? "Печалба за месеца" : "Month profit"}
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-bold",
                  monthTotals.profit >= 0 ? "text-green-400" : "text-red-400",
                )}
              >
                {monthTotals.profit.toFixed(2)} €
              </p>
            </div>
          </>
        )}
      </div>

      {/* Entries */}
      {loading ? (
        <p className="text-mb-silver">{isBg ? "Зареждане..." : "Loading..."}</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-mb-border bg-mb-anthracite p-8 text-center text-mb-silver">
          {isBg ? "Няма записи за този период." : "No entries for this period."}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, dayRows]) => {
            const dayTotal = dayRows.reduce(
              (sum, r) => sum + (Number(r.amount) || 0),
              0,
            );
            return (
              <div
                key={day}
                className="rounded-xl border border-mb-border bg-mb-anthracite overflow-hidden"
              >
                {view === "month" && (
                  <div className="flex items-center justify-between border-b border-mb-border px-4 py-2">
                    <span className="text-sm text-white">
                      {new Date(day + "T00:00:00").toLocaleDateString(
                        isBg ? "bg-BG" : "en-GB",
                        { day: "2-digit", month: "2-digit", year: "numeric", weekday: "short" },
                      )}
                    </span>
                    <span className="text-sm font-semibold text-mb-blue">
                      {dayTotal.toFixed(2)} €
                    </span>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-mb-border text-left text-xs uppercase tracking-wide text-mb-silver">
                        <th className="py-2 px-4 font-medium">
                          {isBg ? "Автомобил / Ремонт" : "Vehicle / Repair"}
                        </th>
                        <th className="py-2 px-3 font-medium">
                          {isBg ? "Клиент" : "Client"}
                        </th>
                        <th className="py-2 px-3 font-medium">
                          {isBg ? "Начин" : "Method"}
                        </th>
                        <th className="py-2 px-3 font-medium">
                          {isBg ? "Източник" : "Source"}
                        </th>
                        <th className="py-2 px-3 font-medium text-right">
                          {isBg ? "Сума" : "Amount"}
                        </th>
                        {canEdit && <th className="py-2 px-3 w-20" />}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-mb-border/40">
                      {dayRows.map((r) => (
                        <tr key={r.id} className="group hover:bg-white/5 transition-colors">
                          <td className="py-2 px-4">
                            <div className="text-white">
                              {r.vehicle || "-"}
                              {r.license_plate ? ` · ${r.license_plate}` : ""}
                            </div>
                            <div className="text-xs text-mb-silver">
                              {r.repair_name || "-"}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-mb-silver">
                            {r.client_name || "-"}
                          </td>
                          <td className="py-2 px-3">
                            {/* One badge per method actually used, each with
                                its own amount, so a mixed payment reads at a
                                glance without leaving the row. */}
                            <div className="flex flex-wrap gap-1">
                              {methodParts(r).map((part) => (
                                <span
                                  key={part.method}
                                  className={cn(
                                    "inline-block whitespace-nowrap rounded-md border px-2 py-0.5 text-xs",
                                    METHOD_STYLE[part.method],
                                  )}
                                >
                                  {isBg
                                    ? METHOD_LABEL[part.method].bg
                                    : METHOD_LABEL[part.method].en}
                                  {part.showAmount
                                    ? ` ${part.amount.toFixed(2)} €`
                                    : ""}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-xs text-mb-silver">
                            {r.source === "service_card" ? (
                              // Link back to the offer the card was made from,
                              // so a figure can be traced to its paperwork.
                              r.offer_id ? (
                                <Link
                                  href={`/${locale}/mb-admin/offers/edit?id=${r.offer_id}`}
                                  className="text-mb-blue underline-offset-2 hover:underline"
                                  title={
                                    isBg
                                      ? "Отвори сервизната карта"
                                      : "Open the service card"
                                  }
                                >
                                  {isBg ? "Сервизна карта" : "Service card"}{" "}
                                  {r.service_card_number ?? ""}
                                </Link>
                              ) : (
                                `${isBg ? "Сервизна карта" : "Service card"} ${r.service_card_number ?? ""}`.trim()
                              )
                            ) : isBg ? (
                              "Ръчно"
                            ) : (
                              "Manual"
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-white whitespace-nowrap">
                            {(Number(r.amount) || 0).toFixed(2)} €
                          </td>
                          {canEdit && (
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEdit(r)}
                                  className="p-1 text-mb-silver hover:text-white"
                                  title={isBg ? "Редактирай" : "Edit"}
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(r)}
                                  className="p-1 text-red-400 hover:text-red-300"
                                  title={isBg ? "Изтрий" : "Delete"}
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual entry / edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editing
                ? isBg ? "Редактиране на запис" : "Edit entry"
                : isBg ? "Нов запис" : "New entry"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 py-2 sm:grid-cols-2">
            <div className={cn("space-y-1", form.splitMode && "sm:col-span-2")}>
              <Label className="text-gray-200">{isBg ? "Дата" : "Date"} *</Label>
              <Input
                type="date"
                value={form.entry_date}
                onChange={(e) => setForm((f) => ({ ...f, entry_date: e.target.value }))}
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
            {!form.splitMode && (
              <div className="space-y-1">
                <Label className="text-gray-200">
                  {isBg ? "Сума (€)" : "Amount (€)"} *
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  placeholder="0.00"
                  className="bg-gray-100 text-gray-900 border-mb-border"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-gray-200">{isBg ? "Автомобил" : "Vehicle"}</Label>
              <Input
                value={form.vehicle}
                onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))}
                placeholder={isBg ? "напр. Mercedes E220" : "e.g. Mercedes E220"}
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-200">{isBg ? "Рег. номер" : "Plate"}</Label>
              <Input
                value={form.license_plate}
                onChange={(e) => setForm((f) => ({ ...f, license_plate: e.target.value }))}
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-gray-200">{isBg ? "Ремонт" : "Repair"}</Label>
              <Input
                value={form.repair_name}
                onChange={(e) => setForm((f) => ({ ...f, repair_name: e.target.value }))}
                placeholder={isBg ? "напр. Смяна на масло" : "e.g. Oil change"}
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-gray-200">{isBg ? "Клиент" : "Client"}</Label>
              <Input
                value={form.client_name}
                onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-200">
                  {isBg ? "Начин на плащане" : "Payment method"} *
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    setForm((f) => ({
                      ...f,
                      splitMode: !f.splitMode,
                      // Seed the chosen method with the amount already typed.
                      splitAmounts: !f.splitMode
                        ? {
                            cash: "",
                            card: "",
                            bank: "",
                            [f.payment_method]: f.amount,
                          }
                        : { cash: "", card: "", bank: "" },
                    }));
                    setFormError("");
                  }}
                  className="text-xs text-mb-blue hover:underline"
                >
                  {form.splitMode
                    ? isBg
                      ? "← Един начин"
                      : "← Single method"
                    : isBg
                      ? "Раздели по няколко начина"
                      : "Split across methods"}
                </button>
              </div>

              {!form.splitMode ? (
                <div className="grid grid-cols-3 gap-2">
                  {(["cash", "card", "bank"] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, payment_method: m }))
                      }
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                        form.payment_method === m
                          ? "border-mb-blue bg-mb-blue text-white"
                          : "border-mb-border bg-mb-black text-mb-silver hover:text-white",
                      )}
                    >
                      {isBg ? METHOD_LABEL[m].bg : METHOD_LABEL[m].en}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 rounded-lg border border-mb-border bg-mb-black p-3">
                  {(["cash", "card", "bank"] as PaymentMethod[]).map((m) => (
                    <div key={m} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 text-sm text-mb-silver">
                        {isBg ? METHOD_LABEL[m].bg : METHOD_LABEL[m].en}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        inputMode="decimal"
                        value={form.splitAmounts[m]}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((f) => ({
                            ...f,
                            splitAmounts: { ...f.splitAmounts, [m]: val },
                          }));
                          setFormError("");
                        }}
                        placeholder="0.00"
                        className="bg-gray-100 text-gray-900 border-mb-border"
                      />
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-mb-border pt-2 text-sm">
                    <span className="text-mb-silver">
                      {isBg ? "Общо" : "Total"}
                    </span>
                    <span className="font-semibold text-mb-blue">
                      {splitTotal.toFixed(2)} €
                    </span>
                  </div>
                  <p className="text-xs text-mb-silver">
                    {isBg
                      ? "Едно плащане, разделено по начини — остава един запис."
                      : "One payment split across methods — stays a single entry."}
                  </p>
                </div>
              )}
            </div>
            {/* Cost drives profit, which only the owner sees — so the field
                is shown only to them. */}
            {canSeeProfit && (
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-gray-200">
                  {isBg ? "Себестойност на частите (€)" : "Parts cost (€)"}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  inputMode="decimal"
                  value={form.parts_cost}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, parts_cost: e.target.value }))
                  }
                  placeholder="0.00"
                  className="bg-gray-100 text-gray-900 border-mb-border"
                />
                <p className="text-xs text-mb-silver">
                  {isBg
                    ? "По избор. Използва се за месечната печалба."
                    : "Optional. Used for the monthly profit figure."}
                </p>
              </div>
            )}
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-gray-200">{isBg ? "Бележка" : "Note"}</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
          </div>

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Explicit cancel discards the draft; closing via Escape or
                // the backdrop keeps it, so an accidental dismissal is
                // recoverable by reopening the dialog.
                clearDraft();
                setFormOpen(false);
              }}
              className="bg-red-500 hover:bg-red-600 text-white border-red-500"
            >
              {isBg ? "Отказ" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-mb-blue hover:bg-mb-blue/90"
            >
              {saving
                ? isBg ? "Запис..." : "Saving..."
                : isBg ? "Запази" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">
              {isBg ? "Изтриване на запис" : "Delete entry"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-mb-silver">
            {isBg
              ? "Сигурни ли сте? Това действие е необратимо."
              : "Are you sure? This cannot be undone."}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="border-mb-border bg-mb-black text-white hover:bg-mb-border hover:text-white"
            >
              {isBg ? "Отказ" : "Cancel"}
            </Button>
            <Button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              {isBg ? "Изтрий" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
