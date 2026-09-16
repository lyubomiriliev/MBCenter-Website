"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import type { DateRange } from "react-day-picker";
import { bg as bgLocale, enGB } from "date-fns/locale";
import { supabase } from "@/lib/supabase/client";
import { useSupabaseAuthContext } from "@/components/admin/SupabaseAuthContext";
import { logChange } from "@/lib/activity-log";
import { Calendar } from "@/components/ui/calendar";
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
import {
  bgPublicHolidays,
  countWorkingDays,
  dateKey,
  parseDateKey,
} from "@/lib/workdays";
import type {
  LeaveEntitlement,
  LeavePeriod,
  LeaveType,
  Mechanic,
  Receptionist,
  WorkerType,
} from "@/types/database";

interface Worker {
  id: string;
  name: string;
  type: WorkerType;
}

const LEAVE_LABEL: Record<LeaveType, { bg: string; en: string }> = {
  paid: { bg: "Платен", en: "Paid" },
  unpaid: { bg: "Неплатен", en: "Unpaid" },
  sick: { bg: "Болничен", en: "Sick" },
};

/**
 * Marker written by migration_leave_entitlement.sql on the seeded starting
 * balances. Such a row records how many days were already used, but its dates
 * are placeholders rather than the real leave period.
 */
const OPENING_BALANCE_NOTE = "Начален баланс";

function isOpeningBalance(p: LeavePeriod): boolean {
  return (p.note ?? "").startsWith(OPENING_BALANCE_NOTE);
}

/** Statutory minimum paid leave in Bulgaria; used when none is configured. */
const DEFAULT_LEAVE_DAYS = 20;

const LEAVE_STYLE: Record<LeaveType, string> = {
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  unpaid: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  sick: "bg-red-500/20 text-red-400 border-red-500/30",
};

/** True while the viewport is phone-sized. */
function useIsNarrow(breakpoint = 768) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return narrow;
}

export function LeaveSection() {
  const isBg = useLocale() === "bg";
  const { profile, user } = useSupabaseAuthContext();

  /** Who the activity log attributes a change to. */
  const logActor = () => ({
    authId: user?.id ?? null,
    name: profile?.full_name ?? null,
    email: user?.email ?? null,
  });
  const isNarrow = useIsNarrow();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selected, setSelected] = useState<Worker | null>(null);
  const [periods, setPeriods] = useState<LeavePeriod[]>([]);
  const [entitlement, setEntitlement] = useState<number | null>(null);
  // The calendar month is controlled so the year arrows move the grid too.
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const year = month.getFullYear();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [range, setRange] = useState<DateRange | undefined>();
  const [leaveType, setLeaveType] = useState<LeaveType>("paid");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LeavePeriod | null>(null);

  // Load the employee list once — both groups, matching Earnings.
  useEffect(() => {
    (async () => {
      const [mech, rec] = await Promise.all([
        supabase.from("mechanics").select("id, name, sort_order").order("sort_order"),
        supabase.from("receptionists").select("id, name, sort_order").order("sort_order"),
      ]);
      const list: Worker[] = [
        // "50:50" is an earnings-split bucket in the mechanics table, not a
        // person, so it is excluded from the leave picker.
        ...((mech.data ?? []) as Mechanic[])
          .filter((m) => m.name.trim() !== "50:50")
          .map((m) => ({
            id: m.id,
            name: m.name,
            type: "mechanic" as const,
          })),
        ...((rec.data ?? []) as Receptionist[]).map((r) => ({
          id: r.id,
          name: r.name,
          type: "receptionist" as const,
        })),
      ];
      setWorkers(list);
      setSelected((prev) => prev ?? list[0] ?? null);
    })();
  }, []);

  const loadPeriods = useCallback(async () => {
    if (!selected) {
      setPeriods([]);
      return;
    }
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase
      .from("leave_periods")
      .select("*")
      .eq("worker_id", selected.id)
      .eq("worker_type", selected.type)
      .order("start_date", { ascending: false });

    // Yearly allowance for this worker (defaults to 20 when not set).
    const { data: ent } = await supabase
      .from("leave_entitlements")
      .select("total_days")
      .eq("worker_id", selected.id)
      .eq("worker_type", selected.type)
      .eq("year", year)
      .maybeSingle();
    setEntitlement(
      ent ? ((ent as LeaveEntitlement).total_days ?? DEFAULT_LEAVE_DAYS) : null,
    );

    if (err) {
      console.error("[leave] load failed:", err);
      // PGRST205 = table missing, i.e. migration_leave.sql has not been run yet.
      setError(
        err.code === "PGRST205"
          ? isBg
            ? "Таблицата за отпуски не съществува. Изпълнете supabase/migration_leave.sql в Supabase SQL Editor."
            : "The leave table does not exist. Run supabase/migration_leave.sql in the Supabase SQL Editor."
          : isBg
            ? "Грешка при зареждане."
            : "Failed to load leave.",
      );
      setPeriods([]);
    } else {
      setPeriods((data ?? []) as LeavePeriod[]);
    }
    setLoading(false);
  }, [selected, isBg, year]);

  useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  /** Days already booked, so the calendar can grey them out. */
  const bookedDays = useMemo(() => {
    const days: Date[] = [];
    for (const p of periods) {
      // Seeded opening balances carry a day count but not real dates, so
      // marking their placeholder range would wrongly show those days as
      // taken. They still count towards the totals and appear in История.
      if (isOpeningBalance(p)) continue;
      const cursor = parseDateKey(p.start_date);
      const end = parseDateKey(p.end_date);
      while (cursor <= end) {
        days.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return days;
  }, [periods]);

  const holidayDays = useMemo(
    () =>
      [year - 1, year, year + 1].flatMap((y) =>
        bgPublicHolidays(y).map((h) => parseDateKey(h.date)),
      ),
    [year],
  );

  const pendingDays = useMemo(() => {
    if (!range?.from) return 0;
    return countWorkingDays(range.from, range.to ?? range.from);
  }, [range]);

  /**
   * Days used in the selected year. A period spanning New Year is split, so
   * each year is charged only for the working days that fall inside it.
   */
  const totals = useMemo(() => {
    const t = { paid: 0, unpaid: 0, sick: 0, all: 0 };
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    for (const p of periods) {
      const start = parseDateKey(p.start_date);
      const end = parseDateKey(p.end_date);
      if (end < yearStart || start > yearEnd) continue;

      const from = start < yearStart ? yearStart : start;
      const to = end > yearEnd ? yearEnd : end;
      const days =
        from.getTime() === start.getTime() && to.getTime() === end.getTime()
          ? p.working_days // whole period inside the year: trust the DB value
          : countWorkingDays(from, to);

      t[p.leave_type] += days;
      t.all += days;
    }
    return t;
  }, [periods, year]);

  /** Periods that overlap the selected year, newest first. */
  const periodsInYear = useMemo(() => {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    return periods.filter((p) => {
      const s = parseDateKey(p.start_date);
      const e = parseDateKey(p.end_date);
      return e >= start && s <= end;
    });
  }, [periods, year]);

  const allowance = entitlement ?? DEFAULT_LEAVE_DAYS;
  const remainingDays = Math.max(0, allowance - totals.paid);

  const [pdfGenerating, setPdfGenerating] = useState(false);

  /** Downloads the selected worker's leave history for the year in view. */
  const generatePDF = async () => {
    if (!selected) return;
    setPdfGenerating(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { registerPDFFonts } = await import("@/lib/pdf-fonts");
      const { LeavePDF, setFontRegistered } = await import(
        "@/components/pdf/LeavePDF"
      );
      setFontRegistered(await registerPDFFonts());

      const blob = await pdf(
        <LeavePDF
          workerName={selected.name}
          workerRole={
            selected.type === "mechanic" ? "Механик" : "Приемна"
          }
          year={year}
          rows={periodsInYear.map((p) => ({
            start_date: p.start_date,
            end_date: p.end_date,
            working_days: p.working_days,
            leave_type: p.leave_type,
            note: p.note,
            is_opening_balance: isOpeningBalance(p),
          }))}
          allowance={allowance}
          usedPaid={totals.paid}
          usedUnpaid={totals.unpaid}
          usedSick={totals.sick}
          generatedBy={profile?.full_name ?? null}
        />,
      ).toBlob();

      const slug = selected.name
        .toLowerCase()
        .replace(/[^a-zа-я0-9]+/gi, "-")
        .replace(/^-|-$/g, "");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `otpuski-${slug}-${year}.pdf`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("[leave] PDF failed:", err);
      setError(
        isBg ? "Грешка при генериране на PDF." : "Failed to generate the PDF.",
      );
    } finally {
      setPdfGenerating(false);
    }
  };

  /** Rejects a range that overlaps leave already recorded for this worker. */
  const overlaps = (from: Date, to: Date) =>
    periods.some((p) => {
      // Opening balances hold placeholder dates, so they must not block a
      // real period being entered over the same days.
      if (isOpeningBalance(p)) return false;
      const s = parseDateKey(p.start_date);
      const e = parseDateKey(p.end_date);
      return from <= e && to >= s;
    });

  const save = async () => {
    if (!selected || !range?.from) return;
    const from = range.from;
    const to = range.to ?? range.from;

    if (overlaps(from, to)) {
      setError(
        isBg
          ? "Периодът се застъпва с вече въведен отпуск."
          : "This range overlaps leave already recorded.",
      );
      return;
    }
    if (countWorkingDays(from, to) === 0) {
      setError(
        isBg
          ? "Периодът не съдържа работни дни."
          : "This range contains no working days.",
      );
      return;
    }

    setSaving(true);
    setError("");
    const leaveRow = {
      worker_id: selected.id,
      worker_type: selected.type,
      worker_name: selected.name,
      start_date: dateKey(from),
      end_date: dateKey(to),
      leave_type: leaveType,
      note: note.trim() || null,
      created_by_name: profile?.full_name ?? null,
    };
    const { error: err } = await supabase
      .from("leave_periods")
      .insert(leaveRow as never);
    setSaving(false);

    if (!err) {
      logChange({
        table: "leave_periods",
        action: "create",
        actor: logActor(),
        row: leaveRow,
      });
    }

    if (err) {
      console.error("[leave] save failed:", err);
      setError(isBg ? "Грешка при запис." : "Save failed.");
      return;
    }
    setRange(undefined);
    setNote("");
    loadPeriods();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error: err } = await supabase
      .from("leave_periods")
      .delete()
      .eq("id", deleteTarget.id);
    if (err) {
      console.error("[leave] delete failed:", err);
      setError(isBg ? "Грешка при изтриване." : "Delete failed.");
    } else {
      logChange({
        table: "leave_periods",
        action: "delete",
        actor: logActor(),
        row: deleteTarget as unknown as Record<string, unknown>,
      });
    }
    setDeleteTarget(null);
    loadPeriods();
  };

  const fmt = (iso: string) =>
    parseDateKey(iso).toLocaleDateString(isBg ? "bg-BG" : "en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      {/* Employee picker */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        {workers.map((w) => (
          <button
            key={`${w.type}-${w.id}`}
            onClick={() => {
              setSelected(w);
              setRange(undefined);
              setError("");
            }}
            className={cn(
              "flex min-w-0 flex-col items-start rounded-lg border px-3 py-2 text-left text-sm transition-colors sm:flex-row sm:items-center sm:gap-2",
              selected?.id === w.id && selected?.type === w.type
                ? "border-mb-blue bg-mb-blue text-white"
                : "border-mb-border bg-mb-anthracite text-mb-silver hover:text-white",
            )}
          >
            <span className="w-full truncate font-medium">{w.name}</span>
            <span className="text-xs opacity-70 sm:ml-0">
              {w.type === "mechanic"
                ? isBg ? "механик" : "mechanic"
                : isBg ? "приемна" : "reception"}
            </span>
          </button>
        ))}
        {workers.length === 0 && (
          <p className="text-mb-silver text-sm">
            {isBg ? "Няма въведени служители." : "No employees found."}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {selected && (
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          {/* Calendar + new period */}
          <div className="rounded-xl border border-mb-border bg-mb-anthracite p-3 sm:p-4 xl:w-auto xl:shrink-0">
            <h3 className="mb-3 text-sm font-medium text-white">
              {isBg
                ? "Маркирайте период от календара"
                : "Mark a period on the calendar"}
            </h3>

            {/* The shadcn calendar themes itself from --accent/--primary, which
                resolve to the LIGHT palette here (the admin panel uses its own
                mb-* dark theme and never sets .dark). Every colour is therefore
                pinned explicitly below. */}
            <div className="flex justify-center overflow-x-auto py-1">
              <Calendar
                mode="range"
                selected={range}
                onSelect={(r) => {
                  setRange(r);
                  setError("");
                }}
                numberOfMonths={isNarrow ? 1 : 2}
                showOutsideDays
                locale={isBg ? bgLocale : enGB}
                weekStartsOn={1}
                month={month}
                onMonthChange={setMonth}
                modifiers={{ booked: bookedDays, holiday: holidayDays }}
                modifiersClassNames={{
                  booked:
                    "[&>button]:!bg-mb-blue/25 [&>button]:!text-mb-blue [&>button]:line-through [&>button]:rounded-md",
                  holiday: "[&>button]:!text-red-400 [&>button]:font-semibold",
                }}
                // Range colours live on the DayButton via data-* attributes and
                // also resolve to the light palette, so they are pinned here.
                className={cn(
                  "bg-transparent p-0 [--cell-size:2.6rem] sm:[--cell-size:2.35rem]",
                  "[&_[data-selected-single=true]]:!bg-mb-blue [&_[data-selected-single=true]]:!text-white",
                  "[&_[data-range-start=true]]:!bg-mb-blue [&_[data-range-start=true]]:!text-white",
                  "[&_[data-range-end=true]]:!bg-mb-blue [&_[data-range-end=true]]:!text-white",
                  "[&_[data-range-middle=true]]:!bg-mb-blue/30 [&_[data-range-middle=true]]:!text-white",
                  "[&_button:hover]:bg-mb-border [&_button]:text-white [&_button]:transition-colors",
                )}
                classNames={{
                  months: "flex flex-col gap-6 sm:flex-row sm:gap-8",
                  month: "flex flex-col gap-3",
                  // The nav is absolutely positioned across the whole root, so
                  // its height must match the caption row exactly for the
                  // arrows to sit level with the month names. Both are h-9.
                  month_caption:
                    "flex h-9 items-center justify-center px-10 text-white",
                  caption_label: "text-sm font-semibold capitalize text-white",
                  root: "relative w-fit px-1",
                  nav: "absolute inset-x-1 top-0 z-10 flex h-9 items-center justify-between",
                  button_previous:
                    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-mb-border bg-mb-black p-0 text-mb-silver transition-colors hover:bg-mb-blue hover:text-white",
                  button_next:
                    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-mb-border bg-mb-black p-0 text-mb-silver transition-colors hover:bg-mb-blue hover:text-white",
                  weekday:
                    "flex-1 text-[0.7rem] font-medium uppercase tracking-wide text-mb-silver/70",
                  day: "group/day relative aspect-square h-full w-full p-0 text-center",
                  today:
                    "[&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-mb-blue [&>button]:font-semibold [&>button]:!text-mb-blue",
                  outside: "[&>button]:!text-mb-silver/30",
                  disabled: "[&>button]:opacity-40",
                }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-mb-border pt-3 text-xs text-mb-silver sm:flex sm:flex-wrap sm:items-center sm:gap-4">
              <span className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-mb-blue/25 text-[0.65rem] font-semibold text-mb-blue line-through">
                  15
                </span>
                {isBg ? "Вече взет отпуск" : "Already booked"}
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md text-[0.65rem] font-semibold text-red-400">
                  15
                </span>
                {isBg ? "Официален празник" : "Public holiday"}
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md text-[0.65rem] font-semibold text-mb-blue ring-1 ring-inset ring-mb-blue">
                  15
                </span>
                {isBg ? "Днес" : "Today"}
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-mb-blue text-[0.65rem] font-semibold text-white">
                  15
                </span>
                {isBg ? "Избран период" : "Selected"}
              </span>
            </div>

            <div className="mt-4 space-y-3 border-t border-mb-border pt-4">
              {/* Selection readout — highlighted once a range is picked. */}
              <div
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors",
                  range?.from
                    ? "border-mb-blue/40 bg-mb-blue/10"
                    : "border-mb-border bg-mb-black",
                )}
              >
                <div className="min-w-0">
                  <p className="text-[0.7rem] uppercase tracking-wide text-mb-silver">
                    {isBg ? "Избран период" : "Selected range"}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium text-white">
                    {range?.from
                      ? `${fmt(dateKey(range.from))} — ${fmt(dateKey(range.to ?? range.from))}`
                      : isBg
                        ? "Няма избран период"
                        : "Nothing selected"}
                  </p>
                </div>
                <div className="ml-4 shrink-0 text-right">
                  <p className="text-[0.7rem] uppercase tracking-wide text-mb-silver">
                    {isBg ? "Работни дни" : "Working days"}
                  </p>
                  <p className="text-2xl font-bold leading-tight text-mb-blue">
                    {pendingDays}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-200">
                  {isBg ? "Вид отпуск" : "Leave type"}
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["paid", "unpaid", "sick"] as LeaveType[]).map((lt) => (
                    <button
                      key={lt}
                      type="button"
                      onClick={() => setLeaveType(lt)}
                      className={cn(
                        "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                        leaveType === lt
                          ? "border-mb-blue bg-mb-blue text-white"
                          : "border-mb-border bg-mb-black text-mb-silver hover:text-white",
                      )}
                    >
                      {isBg ? LEAVE_LABEL[lt].bg : LEAVE_LABEL[lt].en}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-gray-200">
                  {isBg ? "Бележка" : "Note"}
                </Label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-gray-100 text-gray-900 border-mb-border"
                />
              </div>

              {/* Warn, but do not block: leave beyond the allowance is a real
                  situation the office may still need to record. */}
              {leaveType === "paid" &&
                pendingDays > 0 &&
                pendingDays > remainingDays && (
                  <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                    {isBg
                      ? `Внимание: остават ${remainingDays} дни, а избраният период е ${pendingDays}.`
                      : `Note: ${remainingDays} days remain but this period is ${pendingDays}.`}
                  </p>
                )}

              <div className="flex gap-2">
                <Button
                  onClick={save}
                  disabled={!range?.from || saving || pendingDays === 0}
                  className="flex-1 bg-mb-blue hover:bg-mb-blue/90"
                >
                  {saving
                    ? isBg ? "Запис..." : "Saving..."
                    : isBg ? "Запази отпуска" : "Save leave"}
                </Button>
                {range?.from && (
                  <Button
                    variant="outline"
                    onClick={() => setRange(undefined)}
                    className="border-mb-border bg-mb-black text-white hover:bg-mb-border hover:text-white"
                  >
                    {isBg ? "Изчисти" : "Clear"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* History */}
          <div className="space-y-4 xl:min-w-0 xl:flex-1 2xl:max-w-3xl">
            <div className="rounded-xl border border-mb-border bg-mb-anthracite p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">
                  {isBg ? "Обобщение" : "Summary"} {year}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setMonth((m) => new Date(m.getFullYear() - 1, m.getMonth(), 1))
                    }
                    className="px-2 text-mb-silver hover:text-white"
                  >
                    ‹
                  </button>
                  <span className="text-sm text-white">{year}</span>
                  <button
                    onClick={() =>
                      setMonth((m) => new Date(m.getFullYear() + 1, m.getMonth(), 1))
                    }
                    className="px-2 text-mb-silver hover:text-white"
                  >
                    ›
                  </button>
                </div>
              </div>
              {/* Paid leave is the one with an allowance; the others are
                  tracked but do not draw down the yearly entitlement. */}
              <div className="mb-2 rounded-lg border border-mb-blue/40 bg-mb-blue/10 px-3 py-2.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wide text-mb-blue">
                    {isBg ? "Платен отпуск" : "Paid leave"}
                  </span>
                  <span className="text-xs text-mb-silver">
                    {isBg ? "от" : "of"} {allowance}{" "}
                    {isBg ? "дни" : "days"}
                  </span>
                </div>
                <div className="mt-2 flex items-end gap-6">
                  <div>
                    <p className="text-2xl font-bold leading-none text-white">
                      {totals.paid}
                    </p>
                    <p className="mt-1 text-xs text-mb-silver">
                      {isBg ? "използвани" : "used"}
                    </p>
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-2xl font-bold leading-none",
                        remainingDays > 0 ? "text-green-400" : "text-red-400",
                      )}
                    >
                      {remainingDays}
                    </p>
                    <p className="mt-1 text-xs text-mb-silver">
                      {isBg ? "оставащи" : "remaining"}
                    </p>
                  </div>
                </div>
                {/* Progress bar makes the balance readable at a glance. */}
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-mb-black">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      remainingDays > 0 ? "bg-mb-blue" : "bg-red-400",
                    )}
                    style={{
                      width: `${Math.min(100, allowance > 0 ? (totals.paid / allowance) * 100 : 0)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(["unpaid", "sick"] as LeaveType[]).map((lt) => (
                  <div key={lt} className="rounded-lg bg-mb-black px-3 py-2">
                    <p className="text-xs text-mb-silver">
                      {isBg ? LEAVE_LABEL[lt].bg : LEAVE_LABEL[lt].en}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {totals[lt]}
                    </p>
                  </div>
                ))}
                <div className="rounded-lg bg-mb-black px-3 py-2">
                  <p className="text-xs text-mb-silver">
                    {isBg ? "Общо дни" : "Total days"}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {totals.all}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-mb-border bg-mb-anthracite overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-mb-border px-4 py-3">
                <h3 className="text-sm font-medium text-white">
                  {isBg ? "История" : "History"}
                </h3>
                <Button
                  onClick={generatePDF}
                  disabled={pdfGenerating || periodsInYear.length === 0}
                  variant="outline"
                  size="sm"
                  className="border-mb-border bg-mb-black text-white hover:bg-mb-border hover:text-white"
                >
                  {pdfGenerating
                    ? isBg ? "Генериране..." : "Generating..."
                    : isBg ? "Разпечатай PDF" : "Print PDF"}
                </Button>
              </div>
              {loading ? (
                <p className="p-4 text-sm text-mb-silver">
                  {isBg ? "Зареждане..." : "Loading..."}
                </p>
              ) : periodsInYear.length === 0 ? (
                <p className="p-4 text-sm text-mb-silver">
                  {isBg
                    ? `Няма въведени отпуски за ${year} г.`
                    : `No leave recorded for ${year}.`}
                </p>
              ) : (
                <div className="max-h-[420px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-mb-anthracite">
                      <tr className="border-b border-mb-border text-left text-xs uppercase tracking-wide text-mb-silver">
                        <th className="py-2 px-4 font-medium">
                          {isBg ? "Период" : "Period"}
                        </th>
                        <th className="py-2 px-3 font-medium">
                          {isBg ? "Вид" : "Type"}
                        </th>
                        <th className="py-2 px-3 font-medium text-right">
                          {isBg ? "Дни" : "Days"}
                        </th>
                        <th className="py-2 px-3 w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-mb-border/40">
                      {periodsInYear.map((p) => (
                        <tr
                          key={p.id}
                          className="group hover:bg-white/5 transition-colors"
                        >
                          <td className="py-2 px-4">
                            {/* An opening balance has no real dates, so show
                                what it is rather than a placeholder range. */}
                            <div className="text-white whitespace-nowrap">
                              {isOpeningBalance(p)
                                ? isBg
                                  ? "Начален баланс"
                                  : "Opening balance"
                                : `${fmt(p.start_date)} - ${fmt(p.end_date)}`}
                            </div>
                            {isOpeningBalance(p) ? (
                              <div className="text-xs text-mb-silver">
                                {isBg
                                  ? "Използвани преди въвеждането на системата"
                                  : "Used before this system was introduced"}
                              </div>
                            ) : (
                              p.note && (
                                <div className="text-xs text-mb-silver">
                                  {p.note}
                                </div>
                              )
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={cn(
                                "inline-block rounded-md border px-2 py-0.5 text-xs whitespace-nowrap",
                                LEAVE_STYLE[p.leave_type],
                              )}
                            >
                              {isBg
                                ? LEAVE_LABEL[p.leave_type].bg
                                : LEAVE_LABEL[p.leave_type].en}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-white">
                            {p.working_days}
                          </td>
                          <td className="py-2 px-3">
                            <button
                              onClick={() => setDeleteTarget(p)}
                              className="p-1 text-red-400 transition-colors hover:text-red-300"
                              title={isBg ? "Изтрий" : "Delete"}
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">
              {isBg ? "Изтриване на отпуск" : "Delete leave"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-mb-silver">
            {deleteTarget
              ? `${fmt(deleteTarget.start_date)} - ${fmt(deleteTarget.end_date)} (${deleteTarget.working_days} ${isBg ? "дни" : "days"})`
              : ""}
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
