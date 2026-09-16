"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DateRangeField } from "@/components/admin/DateRangeField";
import { cn } from "@/lib/utils";
import { localDateKey } from "@/lib/turnover";
import type { DailyTurnover } from "@/types/database";

type Preset = "today" | "week" | "month";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Profit is owner-level information. Passed in from the page so this dialog
   * uses the same gate as everything else and never decides for itself.
   */
  canSeeProfit: boolean;
  generatedBy: string | null;
}

/** Start of the ISO week (Monday) for a date. */
function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = (copy.getDay() + 6) % 7; // Monday = 0
  copy.setDate(copy.getDate() - day);
  return copy;
}

export function TurnoverReportsDialog({
  open,
  onOpenChange,
  canSeeProfit,
  generatedBy,
}: Props) {
  const locale = useLocale();
  const isBg = locale === "bg";

  const today = localDateKey(new Date());
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [rows, setRows] = useState<DailyTurnover[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);

  const load = useCallback(async () => {
    if (!from || !to) return;
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase
      .from("daily_turnover")
      .select("*")
      .gte("entry_date", from)
      .lte("entry_date", to)
      .order("entry_date", { ascending: true })
      .order("created_at", { ascending: true });

    setLoading(false);
    if (err) {
      console.error("[turnover-reports] load failed:", err);
      setError(
        isBg ? "Грешка при зареждане." : "Failed to load the report.",
      );
      setRows([]);
      return;
    }
    setRows((data ?? []) as DailyTurnover[]);
  }, [from, to, isBg]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  /** The from/to a preset stands for, so the active one can be highlighted. */
  const presetRange = useCallback((preset: Preset) => {
    const now = new Date();
    if (preset === "today") {
      return { from: localDateKey(now), to: localDateKey(now) };
    }
    if (preset === "week") {
      return { from: localDateKey(startOfWeek(now)), to: localDateKey(now) };
    }
    return {
      from: localDateKey(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: localDateKey(now),
    };
  }, []);

  /** Presets so the common periods are one click away. */
  const applyPreset = (preset: Preset) => {
    const range = presetRange(preset);
    setFrom(range.from);
    setTo(range.to);
  };

  /** Which preset the current range matches, if any. */
  const activePreset = useMemo(() => {
    for (const preset of ["today", "week", "month"] as Preset[]) {
      const r = presetRange(preset);
      if (r.from === from && r.to === to) return preset;
    }
    return null;
  }, [from, to, presetRange]);

  const totals = useMemo(() => {
    const t = {
      all: 0,
      cash: 0,
      card: 0,
      bank: 0,
      advance: 0,
      cost: 0,
      // Profit belongs to the closing rows only; an advance is money in on a
      // job that is not finished yet, so it adds no profit on its own. The
      // advance applied to a closing row is added back so the profit is
      // computed on the job's full value.
      revenueForProfit: 0,
      advanceForProfit: 0,
      profit: 0,
      count: rows.length,
    };
    for (const r of rows) {
      const amount = Number(r.amount) || 0;
      t.all += amount;
      t.cash += Number(r.amount_cash) || 0;
      t.card += Number(r.amount_card) || 0;
      t.bank += Number(r.amount_bank) || 0;
      if (r.is_advance) {
        t.advance += amount;
      } else {
        t.cost += Number(r.parts_cost) || 0;
        t.revenueForProfit += amount;
        t.advanceForProfit += Number(r.advance_applied) || 0;
      }
    }
    t.profit = t.revenueForProfit + t.advanceForProfit - t.cost;
    return t;
  }, [rows]);

  const money = (n: number) => `${n.toFixed(2)} €`;

  const exportPDF = async () => {
    setPdfBusy(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { registerPDFFonts } = await import("@/lib/pdf-fonts");
      const { TurnoverPDF, setFontRegistered } = await import(
        "@/components/pdf/TurnoverPDF"
      );
      setFontRegistered(await registerPDFFonts());

      const blob = await pdf(
        <TurnoverPDF
          periodLabel={`${from} – ${to}`}
          view="month"
          rows={rows.map((r) => ({
            entry_date: r.entry_date,
            vehicle: r.vehicle,
            license_plate: r.license_plate,
            repair_name: r.repair_name,
            client_name: r.client_name,
            amount: Number(r.amount) || 0,
            amount_cash: Number(r.amount_cash) || 0,
            amount_card: Number(r.amount_card) || 0,
            amount_bank: Number(r.amount_bank) || 0,
            parts_cost: Number(r.parts_cost) || 0,
            is_advance: r.is_advance,
            advance_applied: Number(r.advance_applied) || 0,
            source: r.source,
            service_card_number: r.service_card_number,
          }))}
          includeProfit={canSeeProfit}
          generatedBy={generatedBy}
        />,
      ).toBlob();

      // Download with a meaningful name, like the other PDFs in the app,
      // rather than opening a blob: URL in a new tab.
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `spravka-oborot-${from}-${to}.pdf`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("[turnover-reports] pdf failed:", err);
      setError(isBg ? "Грешка при PDF." : "PDF export failed.");
    } finally {
      setPdfBusy(false);
    }
  };

  const invalidRange = Boolean(from && to && from > to);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-mb-anthracite border-mb-border sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {isBg ? "Справки" : "Reports"}
          </DialogTitle>
          <p className="text-sm text-mb-silver">
            {isBg
              ? "Оборот за избран период."
              : "Turnover for the selected period."}
          </p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* ---- Period picker ---- */}
          <div className="rounded-xl border border-mb-border bg-mb-black/40 p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["today", isBg ? "Днес" : "Today"],
                  ["week", isBg ? "Тази седмица" : "This week"],
                  ["month", isBg ? "Този месец" : "This month"],
                ] as const
              ).map(([key, label]) => {
                const active = activePreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPreset(key)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "border-mb-blue bg-mb-blue/15 text-mb-blue"
                        : "border-mb-border bg-transparent text-mb-silver hover:border-mb-silver/50 hover:text-white",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Compact: the fields only need to fit a date, not the dialog. */}
            <div className="flex flex-wrap gap-3">
              <DateRangeField
                className="w-44"
                label={isBg ? "Дата от" : "Date from"}
                value={from}
                onChange={setFrom}
                placeholder={isBg ? "Изберете дата" : "Select date"}
                max={to || undefined}
              />
              <DateRangeField
                className="w-44"
                label={isBg ? "Дата до" : "Date to"}
                value={to}
                onChange={setTo}
                placeholder={isBg ? "Изберете дата" : "Select date"}
                min={from || undefined}
              />
            </div>
          </div>

          {invalidRange && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
              {isBg
                ? '"Дата от" е след "Дата до".'
                : '"Date from" is after "Date to".'}
            </p>
          )}
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Results, dimmed while a new period loads, with the app's
              spinner centred over them - steadier than a line of text
              appearing and disappearing under the dialog. */}
          <div className="relative">
            <div
              className={cn(
                "space-y-5 transition-opacity",
                loading && "opacity-40 pointer-events-none",
              )}
            >
            {/* ---- Headline figures ---- */}
            <div
              className={cn(
                "grid gap-3",
                canSeeProfit ? "sm:grid-cols-3" : "sm:grid-cols-2",
              )}
            >
              <div className="rounded-xl border border-mb-border bg-mb-black/40 p-4">
                <p className="text-xs uppercase tracking-wide text-mb-silver">
                  {isBg ? "Оборот" : "Turnover"}
                </p>
                <p className="mt-1 text-2xl font-semibold text-white tabular-nums">
                  {money(totals.all)}
                </p>
              </div>
              <div className="rounded-xl border border-mb-border bg-mb-black/40 p-4">
                <p className="text-xs uppercase tracking-wide text-mb-silver">
                  {isBg ? "Брой записи" : "Records"}
                </p>
                <p className="mt-1 text-2xl font-semibold text-white tabular-nums">
                  {totals.count}
                </p>
              </div>
              {/* Profit and parts cost are admin-only. */}
              {canSeeProfit && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-green-400/80">
                    {isBg ? "Печалба" : "Profit"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-green-400 tabular-nums">
                    {money(totals.profit)}
                  </p>
                </div>
              )}
            </div>

            {/* ---- Breakdown by payment method ---- */}
            <div className="rounded-xl border border-mb-border bg-mb-black/40 overflow-hidden">
              <div className="border-b border-mb-border px-4 py-2.5">
                <p className="text-xs uppercase tracking-wide text-mb-silver">
                  {isBg ? "По начин на плащане" : "By payment method"}
                </p>
              </div>
              <div className="divide-y divide-mb-border/50">
                {(
                  [
                    [isBg ? "Брой" : "Cash", totals.cash, "bg-green-400"],
                    [isBg ? "Карта" : "Card", totals.card, "bg-blue-400"],
                    [isBg ? "Банка" : "Bank", totals.bank, "bg-purple-400"],
                    [isBg ? "Аванси" : "Advances", totals.advance, "bg-amber-400"],
                  ] as [string, number, string][]
                ).map(([label, value, dot]) => {
                  // Share of turnover, so the split is readable at a glance.
                  const pct = totals.all > 0 ? (value / totals.all) * 100 : 0;
                  return (
                    <div key={label} className="px-4 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-sm text-mb-silver">
                          <span className={cn("h-2 w-2 rounded-full", dot)} />
                          {label}
                        </span>
                        <span className="flex items-baseline gap-2">
                          <span className="text-xs text-mb-silver tabular-nums">
                            {pct.toFixed(0)}%
                          </span>
                          <span className="text-sm font-medium text-white tabular-nums">
                            {money(value)}
                          </span>
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className={cn("h-full rounded-full", dot)}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {canSeeProfit && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-mb-silver">
                      {isBg ? "Себестойност (части)" : "Parts cost"}
                    </span>
                    <span className="text-sm font-medium text-white tabular-nums">
                      {money(totals.cost)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            </div>

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="h-8 w-8 animate-spin text-mb-blue"
                  viewBox="0 0 24 24"
                  role="status"
                  aria-label={isBg ? "Зареждане" : "Loading"}
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            )}
          </div>

          {!loading && rows.length === 0 && !error && (
            <p className="rounded-lg border border-mb-border bg-mb-black/40 px-4 py-6 text-center text-sm text-mb-silver">
              {isBg
                ? "Няма записи за този период."
                : "No records for this period."}
            </p>
          )}
        </div>

        {/* No close button: the X in the header already closes the dialog. */}
        <DialogFooter>
          <Button
            onClick={exportPDF}
            disabled={pdfBusy || loading || rows.length === 0}
            className="bg-mb-blue text-white hover:bg-mb-blue/90"
          >
            {pdfBusy
              ? isBg
                ? "Генериране…"
                : "Generating…"
              : isBg
                ? "Печат / PDF"
                : "Print / PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
