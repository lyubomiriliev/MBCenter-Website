"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuthContext } from "@/components/admin/SupabaseAuthContext";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangeField } from "@/components/admin/DateRangeField";
import { cn } from "@/lib/utils";
import { localDateKey } from "@/lib/turnover";
import {
  formatChanges,
  SECTION_LABELS,
  UNLOGGED_EMAILS,
} from "@/lib/activity-log";
import type {
  ActivityAction,
  ActivityEntityType,
  ActivityLogEntry,
} from "@/types/database";

/** How many entries one page of the log holds. */
const PAGE_SIZE = 50;

/** Sections offered in the filter, in menu order. */
const SECTIONS = [
  "offers",
  "daily_turnover",
  "daily_turnover_notes",
  "inspections",
  "warehouse_parts",
  "earnings_entries",
  "earnings_monthly_summary",
  "leave_periods",
  "mechanics",
  "receptionists",
] as const;

/** The Bulgarian name of a section; falls back to the raw table name. */
function sectionLabel(table: string): string {
  return SECTION_LABELS[table] ?? table;
}

const ACTION_LABEL: Record<ActivityAction, { bg: string; en: string }> = {
  create: { bg: "създаване", en: "create" },
  edit: { bg: "редакция", en: "edit" },
  delete: { bg: "изтриване", en: "delete" },
};

const ACTION_STYLE: Record<ActivityAction, string> = {
  create: "bg-green-500/20 text-green-400 border-green-500/30",
  edit: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  delete: "bg-red-500/20 text-red-400 border-red-500/30",
};

/**
 * Accounts kept out of the filter.
 *
 * `UNLOGGED_EMAILS` holds the developer account, but a profile's `full_name`
 * is sometimes the email itself, so both the name and the address have to be
 * checked.
 */
function isHiddenAccount(nameOrEmail: string): boolean {
  return UNLOGGED_EMAILS.includes(nameOrEmail.trim().toLowerCase());
}

/** "16.09.2026 10:24" */
function formatStamp(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function LogsPage() {
  const locale = useLocale();
  const isBg = locale === "bg";
  const { isSuperAdmin } = useSupabaseAuthContext();

  // The page is admin-only. RLS is the real boundary — the SELECT policy on
  // activity_log requires public.is_admin() — but the UI refuses too, so a
  // non-admin never sees an empty table and wonders why.
  const allowed = isSuperAdmin();

  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [entityFilter, setEntityFilter] = useState<ActivityEntityType | "all">(
    "all",
  );
  const [userFilter, setUserFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /**
   * Every account that could appear in the log, loaded up front.
   *
   * Taken from `profiles` rather than from the entries on screen: the filter
   * has to offer an account even when that account has not done anything yet,
   * or on a page where none of its entries happen to appear.
   *
   * Reading other people's profiles is admin-only and needs
   * supabase/migration_profiles_admin_read.sql. Without it RLS returns just
   * the signed-in user's own row, and the filter falls back to the names
   * found in the loaded entries.
   */
  const [accounts, setAccounts] = useState<string[]>([]);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    void (async () => {
      const { data, error: err } = await supabase
        .from("profiles")
        .select("full_name")
        .order("full_name", { ascending: true });

      if (cancelled) return;
      if (err) {
        console.warn("[logs] account list failed:", err.message);
        return;
      }
      // Only names: the log stores `user_name`, so a profile without one
      // could never be matched by the filter anyway. The developer account is
      // left out, matching the entries it never writes.
      const names = Array.from(
        new Set(
          (data ?? [])
            .map((p: { full_name: string | null }) => p.full_name?.trim())
            .filter((n): n is string => !!n && !isHiddenAccount(n)),
        ),
      );
      setAccounts(names);
    })();
    return () => {
      cancelled = true;
    };
  }, [allowed]);

  const load = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    setError("");

    let query = supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE); // +1 row probes for a next page

    // Hide the developer account's own entries. logActivity already skips
    // writing them, but anything recorded before that was in place is still
    // in the table, so the page filters them out on the way in too.
    for (const email of UNLOGGED_EMAILS) {
      query = query.or(`user_email.is.null,user_email.neq.${email}`);
    }

    if (entityFilter !== "all") query = query.eq("entity_type", entityFilter);
    if (userFilter !== "all") query = query.eq("user_name", userFilter);
    if (fromDate) query = query.gte("created_at", `${fromDate}T00:00:00`);
    if (toDate) query = query.lte("created_at", `${toDate}T23:59:59`);

    const { data, error: err } = await query;

    setLoading(false);
    if (err) {
      console.error("[logs] load failed:", err);
      setError(
        err.code === "PGRST205"
          ? isBg
            ? "Липсва миграция: изпълнете supabase/migration_activity_log.sql в Supabase SQL Editor."
            : "Missing migration: run supabase/migration_activity_log.sql in the Supabase SQL Editor."
          : isBg
            ? "Грешка при зареждане на логовете."
            : "Failed to load the logs.",
      );
      setEntries([]);
      return;
    }

    const rows = (data ?? []) as ActivityLogEntry[];
    setHasMore(rows.length > PAGE_SIZE);
    setEntries(rows.slice(0, PAGE_SIZE));
  }, [allowed, page, entityFilter, userFilter, fromDate, toDate, isBg]);

  useEffect(() => {
    void load();
  }, [load]);

  // Reset to the first page whenever a filter changes, so the view never lands
  // on a page number that no longer exists.
  useEffect(() => {
    setPage(0);
  }, [entityFilter, userFilter, fromDate, toDate]);

  /**
   * Options for the "who" filter: every known account, plus any name that
   * appears in the loaded entries but no longer has a profile (a deleted
   * account still has history worth filtering by).
   */
  const users = useMemo(() => {
    const all = new Set(accounts);
    for (const e of entries) {
      if (e.user_name && !isHiddenAccount(e.user_name)) all.add(e.user_name);
    }
    return Array.from(all).sort((a, b) => a.localeCompare(b, "bg"));
  }, [accounts, entries]);

  /** Whether anything is filtered, so "Изчисти" is only live when it does something. */
  const hasFilters =
    entityFilter !== "all" || userFilter !== "all" || !!fromDate || !!toDate;

  const resetFilters = () => {
    setEntityFilter("all");
    setUserFilter("all");
    setFromDate("");
    setToDate("");
  };

  if (!allowed) {
    return (
      <div className="p-4 sm:p-10">
        <AdminHeader
          title={isBg ? "Логове" : "Logs"}
          subtitle={
            isBg
              ? "Достъпно само за администратор."
              : "Available to the administrator only."
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-10">
      <AdminHeader
        title={isBg ? "Логове" : "Logs"}
        subtitle={
          isBg
            ? "Кой какво е променил в дневния оборот и офертите."
            : "Who changed what in the daily turnover and the offers."
        }
      />

      {/* Filters */}
      <div className="rounded-xl border border-mb-border bg-mb-anthracite p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-44">
            <label className="text-xs text-mb-silver mb-1.5 block">
              {isBg ? "Раздел" : "Section"}
            </label>
            <Select
              value={entityFilter}
              onValueChange={(v) =>
                setEntityFilter(v as ActivityEntityType | "all")
              }
            >
              <SelectTrigger className="bg-gray-100 text-gray-900 border-mb-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-100 text-mb-anthracite border-mb-border">
                <SelectItem value="all">
                  {isBg ? "Всички" : "All"}
                </SelectItem>
                {SECTIONS.map((table) => (
                  <SelectItem key={table} value={table}>
                    {sectionLabel(table)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-44">
            <label className="text-xs text-mb-silver mb-1.5 block">
              {isBg ? "Потребител" : "User"}
            </label>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="bg-gray-100 text-gray-900 border-mb-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-100 text-mb-anthracite border-mb-border">
                <SelectItem value="all">
                  {isBg ? "Всички" : "All"}
                </SelectItem>
                {users.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DateRangeField
            className="w-44"
            label={isBg ? "Дата от" : "Date from"}
            value={fromDate}
            onChange={setFromDate}
            placeholder={isBg ? "Изберете дата" : "Select date"}
            max={toDate || localDateKey(new Date())}
          />

          <DateRangeField
            className="w-44"
            label={isBg ? "Дата до" : "Date to"}
            value={toDate}
            onChange={setToDate}
            placeholder={isBg ? "Изберете дата" : "Select date"}
            min={fromDate}
          />

          <Button
            type="button"
            onClick={resetFilters}
            disabled={!hasFilters}
            className="bg-mb-blue text-white hover:bg-mb-blue/90 disabled:opacity-40 shrink-0"
          >
            {isBg ? "Изчисти" : "Clear"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Entries */}
      <div className="rounded-xl border border-mb-border bg-mb-anthracite overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-mb-black/40 text-left text-xs uppercase tracking-wide text-mb-silver">
              <tr>
                <th className="py-2 px-3 font-medium whitespace-nowrap">
                  {isBg ? "Дата и час" : "Date and time"}
                </th>
                <th className="py-2 px-3 font-medium">
                  {isBg ? "Потребител" : "User"}
                </th>
                <th className="py-2 px-3 font-medium">
                  {isBg ? "Раздел" : "Section"}
                </th>
                <th className="py-2 px-3 font-medium">
                  {isBg ? "Запис" : "Record"}
                </th>
                <th className="py-2 px-3 font-medium">
                  {isBg ? "Действие" : "Action"}
                </th>
                <th className="py-2 px-3 font-medium">
                  {isBg ? "Промени" : "Changes"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mb-border/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-mb-silver">
                    {isBg ? "Зареждане…" : "Loading…"}
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-mb-silver">
                    {isBg ? "Няма записи." : "No entries."}
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="hover:bg-white/5">
                    <td className="py-2 px-3 whitespace-nowrap text-mb-silver">
                      {formatStamp(e.created_at)}
                    </td>
                    <td className="py-2 px-3 text-white">
                      {e.user_name ?? e.user_email ?? "—"}
                    </td>
                    <td className="py-2 px-3 text-mb-silver whitespace-nowrap">
                      {sectionLabel(e.entity_type)}
                    </td>
                    <td className="py-2 px-3 text-mb-silver">
                      {e.entity_label ?? "—"}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={cn(
                          "inline-block whitespace-nowrap rounded-md border px-2 py-0.5 text-xs",
                          ACTION_STYLE[e.action],
                        )}
                      >
                        {ACTION_LABEL[e.action]?.[isBg ? "bg" : "en"] ??
                          e.action}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-mb-silver">
                      {formatChanges(e) || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paging */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-mb-silver">
          {isBg ? "Страница" : "Page"} {page + 1}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="bg-mb-blue text-white hover:bg-mb-blue/90 disabled:opacity-40"
          >
            {isBg ? "Назад" : "Previous"}
          </Button>
          <Button
            type="button"
            disabled={!hasMore || loading}
            onClick={() => setPage((p) => p + 1)}
            className="bg-mb-blue text-white hover:bg-mb-blue/90 disabled:opacity-40"
          >
            {isBg ? "Напред" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
