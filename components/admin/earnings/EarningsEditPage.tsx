"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { parseTimeToHours, formatHours } from "@/lib/utils";
import { pdf } from "@react-pdf/renderer";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EarningsEntry, EarningsMonthlySummary } from "@/types/database";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const MONTH_NAMES_BG = [
  "януари",
  "февруари",
  "март",
  "април",
  "май",
  "юни",
  "юли",
  "август",
  "септември",
  "октомври",
  "ноември",
  "декември",
];
const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EarningsEditPage({
  workerId,
  workerType,
  month,
  year,
}: {
  workerId: string;
  workerType: "mechanic" | "receptionist";
  month: number;
  year: number;
}) {
  const locale = useLocale() as "bg" | "en";
  const isBg = locale === "bg";
  const router = useRouter();

  const [workerName, setWorkerName] = useState("");
  const [entries, setEntries] = useState<EarningsEntry[]>([]);

  // Monthly summary fields
  const [mechanicCard, setMechanicCard] = useState("");
  const [mechanicFines, setMechanicFines] = useState("");
  const [mechanicBonus, setMechanicBonus] = useState("");
  const [receptionistFixed, setReceptionistFixed] = useState("");
  const [receptionistCard, setReceptionistCard] = useState("");
  const [receptionistCash, setReceptionistCash] = useState("");
  const [receptionistFines, setReceptionistFines] = useState("");

  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Record<string, string>>({});

  // Load Worker Name
  useEffect(() => {
    const table = workerType === "mechanic" ? "mechanics" : "receptionists";
    supabase
      .from(table)
      .select("name")
      .eq("id", workerId)
      .single()
      .then(({ data }) => {
        if (data) setWorkerName((data as any).name);
      });
  }, [workerId, workerType]);

  // Load Entries & Summary
  const loadData = useCallback(async () => {
    // Entries
    const { data } = await supabase
      .from("earnings_entries")
      .select("*")
      .eq("worker_id", workerId)
      .eq("worker_type", workerType)
      .eq("month", month)
      .eq("year", year)
      .order("entry_date", { ascending: true });
    setEntries((data || []) as EarningsEntry[]);

    // Monthly summary
    const { data: summary } = await supabase
      .from("earnings_monthly_summary")
      .select("*")
      .eq("worker_id", workerId)
      .eq("worker_type", workerType)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();

    const sumData = summary as any;
    if (sumData) {
      if (workerType === "mechanic") {
        setMechanicCard(sumData.card_amount?.toString() || "");
        setMechanicFines(sumData.fines_amount?.toString() || "");
        setMechanicBonus(sumData.bonus_amount?.toString() || "");
      } else {
        setReceptionistFixed(sumData.fixed_salary?.toString() || "");
        setReceptionistCard(sumData.card_amount?.toString() || "");
        setReceptionistCash(sumData.cash_amount?.toString() || "");
        setReceptionistFines(sumData.fines_amount?.toString() || "");
      }
    } else {
      if (workerType === "mechanic") {
        setMechanicCard("");
        setMechanicFines("");
        setMechanicBonus("");
      } else {
        setReceptionistFixed("");
        setReceptionistCard("");
        setReceptionistCash("");
        setReceptionistFines("");
      }
    }
  }, [workerId, workerType, month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save monthly summary (upsert)
  const saveMonthlySummary = useCallback(
    async (fields: Partial<EarningsMonthlySummary>) => {
      const { data: existing } = await supabase
        .from("earnings_monthly_summary")
        .select("id")
        .eq("worker_id", workerId)
        .eq("worker_type", workerType)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("earnings_monthly_summary")
          .update({ ...fields, updated_at: new Date().toISOString() } as never)
          .eq("id", (existing as any).id);
      } else {
        await supabase.from("earnings_monthly_summary").insert({
          worker_id: workerId,
          worker_type: workerType,
          month,
          year,
          ...fields,
        } as never);
      }
    },
    [workerId, workerType, month, year],
  );

  const deleteEntry = async (id: string) => {
    await supabase.from("earnings_entries").delete().eq("id", id);
    loadData();
  };

  const startEdit = (e: EarningsEntry) => {
    setEditingId(e.id);
    if (workerType === "mechanic") {
      setEditFields({
        vehicle: e.vehicle || "",
        repair_name: e.repair_name || "",
        repair_time: (() => {
          const h = e.repair_time ?? 0;
          const hours = Math.floor(h);
          const mins = Math.round((h - hours) * 60);
          return `${hours}:${String(mins).padStart(2, "0")}`;
        })(),
        hourly_rate: String(e.hourly_rate ?? ""),
        entry_date: e.entry_date,
      });
    } else {
      setEditFields({
        vehicle: e.vehicle || "",
        repair_name: e.repair_name || "",
        repair_total: String(e.repair_total ?? ""),
        turnover_pct: String(e.turnover_pct ?? ""),
        entry_date: e.entry_date,
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFields({});
  };

  const saveEdit = async (id: string) => {
    if (workerType === "mechanic") {
      const repairTime = parseTimeToHours(editFields.repair_time);
      const hourlyRate = parseFloat(editFields.hourly_rate) || 0;
      const total = repairTime * hourlyRate;
      await supabase
        .from("earnings_entries")
        .update({
          vehicle: editFields.vehicle || null,
          repair_name: editFields.repair_name || null,
          repair_time: repairTime,
          hourly_rate: hourlyRate,
          total,
          entry_date: editFields.entry_date,
        } as never)
        .eq("id", id);
    } else {
      const repairTotal = parseFloat(editFields.repair_total) || 0;
      const turnoverPct = parseFloat(editFields.turnover_pct) || 0;
      const earnings = repairTotal * (turnoverPct / 100);
      await supabase
        .from("earnings_entries")
        .update({
          vehicle: editFields.vehicle || null,
          repair_name: editFields.repair_name || null,
          repair_total: repairTotal,
          turnover_pct: turnoverPct,
          earnings,
          entry_date: editFields.entry_date,
        } as never)
        .eq("id", id);
    }
    setEditingId(null);
    setEditFields({});
    loadData();
  };

  // Computations
  const mechanicTotalHours = entries.reduce(
    (s, e) => s + (e.repair_time || 0),
    0,
  );
  const mechanicTotal = entries.reduce((s, e) => s + (e.total || 0), 0);
  const mechanicNet = mechanicTotal * 0.5;
  const cardVal = parseFloat(mechanicCard) || 0;
  const finesVal = parseFloat(mechanicFines) || 0;
  const bonusVal = parseFloat(mechanicBonus) || 0;
  const mechanicCash = mechanicNet - cardVal - finesVal + bonusVal;

  const receptionistTotal = entries.reduce((s, e) => s + (e.earnings || 0), 0);
  const recFixedVal = parseFloat(receptionistFixed) || 0;
  const recCardVal = parseFloat(receptionistCard) || 0;
  const recCashVal = parseFloat(receptionistCash) || 0;
  const recFinesVal = parseFloat(receptionistFines) || 0;
  const recTotalSalary = receptionistTotal + recFixedVal;
  const recRemaining = recTotalSalary - recCardVal - recFinesVal - recCashVal;

  const monthLabel = isBg
    ? MONTH_NAMES_BG[month - 1]
    : MONTH_NAMES_EN[month - 1];

  const generatePDF = async () => {
    if (entries.length === 0) return;
    setPdfGenerating(true);
    try {
      const { registerPDFFonts } = await import("@/lib/pdf-fonts");
      const {
        MechanicEarningsPDF,
        ReceptionistEarningsPDF,
        setFontRegistered,
      } = await import("@/components/pdf/EarningsPDF");
      const fontsReady = await registerPDFFonts();
      setFontRegistered(fontsReady);

      let component;
      let filename = "";

      if (workerType === "mechanic") {
        const pdfEntries = entries.map((e) => ({
          vehicle: e.vehicle || "",
          repairName: e.repair_name || "",
          repairTime: e.repair_time || 0,
          hourlyRate: e.hourly_rate || 0,
          total: e.total || 0,
          date: e.entry_date,
        }));
        component = (
          <MechanicEarningsPDF
            workerName={workerName}
            month={monthLabel}
            year={year.toString()}
            entries={pdfEntries}
            card={cardVal}
            fines={finesVal}
            bonus={bonusVal}
          />
        );
        filename = `${workerName.trim().replace(/\s+/g, "-")}-${monthLabel}-${year}.pdf`;
      } else {
        const pdfEntries = entries.map((e) => ({
          vehicle: e.vehicle || "",
          repairName: e.repair_name || "",
          repairTotal: e.repair_total || 0,
          turnoverPct: e.turnover_pct || 0,
          earnings: e.earnings || 0,
          date: e.entry_date,
        }));
        component = (
          <ReceptionistEarningsPDF
            workerName={workerName}
            month={monthLabel}
            year={year.toString()}
            entries={pdfEntries}
            fixedSalary={recFixedVal}
            card={recCardVal}
            cash={recCashVal}
            fines={recFinesVal}
          />
        );
        filename = `${workerName.trim().replace(/\s+/g, "-")}-${monthLabel}-${year}.pdf`;
      }

      const blob = await pdf(component).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="space-y-6 p-10 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-mb-silver hover:text-white hover:bg-mb-black"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {isBg ? "Назад" : "Back"}
          </Button>
          <h1 className="text-2xl font-bold text-white">
            {isBg ? "Редакция на заработка" : "Edit Earnings"}
          </h1>
        </div>
      </div>

      <Card className="bg-mb-anthracite border-mb-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>
              {workerName}{" "}
              <span className="text-mb-silver font-normal">
                -{" "}
                {workerType === "mechanic"
                  ? isBg
                    ? "Механик"
                    : "Mechanic"
                  : isBg
                    ? "Приемчик"
                    : "Receptionist"}
              </span>
            </span>
            <span className="text-mb-blue capitalize">
              {monthLabel} {year}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {entries.length === 0 ? (
            <p className="text-mb-silver text-sm text-center py-4">
              {isBg ? "Няма записани заработки" : "No earnings recorded"}
            </p>
          ) : (
            <>
              {/* Entries Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-fixed">
                  <colgroup>
                    <col style={{ width: "160px" }} />
                    <col className="w-auto" />
                    <col style={{ width: "80px" }} />
                    <col style={{ width: "75px" }} />
                    <col style={{ width: "90px" }} />
                    <col style={{ width: "100px" }} />
                    <col style={{ width: "32px" }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-mb-border text-mb-silver text-xs uppercase">
                      <th className="text-left py-3 pr-2">
                        {isBg ? "Автомобил" : "Vehicle"}
                      </th>
                      <th className="text-left py-3 pr-2">
                        {isBg ? "Ремонт" : "Repair"}
                      </th>
                      {workerType === "mechanic" ? (
                        <>
                          <th className="text-right py-2 pr-2">
                            {isBg ? "Часове" : "Hours"}
                          </th>
                          <th className="text-right py-2 pr-2">
                            {isBg ? "Ставка" : "Rate"}
                          </th>
                          <th className="text-right py-2 pr-2">
                            {isBg ? "Сума" : "Total"}
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="text-right py-2 pr-2">
                            {isBg ? "Сума ремонт" : "Repair Total"}
                          </th>
                          <th className="text-right py-2 pr-2">%</th>
                          <th className="text-right py-2 pr-2">
                            {isBg ? "Заработка" : "Earnings"}
                          </th>
                        </>
                      )}
                      <th className="text-right py-2 pr-2">
                        {isBg ? "Дата" : "Date"}
                      </th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => {
                      const isEditing = editingId === e.id;
                      if (isEditing) {
                        return (
                          <tr
                            key={e.id}
                            className="border-b border-mb-border/40 bg-mb-black/40"
                          >
                            <td className="py-1 pr-1">
                              <input
                                value={editFields.vehicle}
                                onChange={(ev) =>
                                  setEditFields((f) => ({
                                    ...f,
                                    vehicle: ev.target.value,
                                  }))
                                }
                                className="w-full bg-mb-black border border-mb-border rounded px-2 py-1 text-sm text-white"
                              />
                            </td>
                            <td className="py-1 pr-1">
                              <input
                                value={editFields.repair_name}
                                onChange={(ev) =>
                                  setEditFields((f) => ({
                                    ...f,
                                    repair_name: ev.target.value,
                                  }))
                                }
                                className="w-full bg-mb-black border border-mb-border rounded px-2 py-1 text-sm text-white"
                              />
                            </td>
                            {workerType === "mechanic" ? (
                              <>
                                <td className="py-1 pr-1">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="1:30 or 1.5"
                                    value={editFields.repair_time}
                                    onChange={(ev) =>
                                      setEditFields((f) => ({
                                        ...f,
                                        repair_time: ev.target.value,
                                      }))
                                    }
                                    className="w-full bg-mb-black border border-mb-border rounded px-2 py-1 text-sm text-white text-right"
                                  />
                                </td>
                                <td className="py-1 pr-1">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={editFields.hourly_rate}
                                    onChange={(ev) =>
                                      setEditFields((f) => ({
                                        ...f,
                                        hourly_rate: ev.target.value,
                                      }))
                                    }
                                    className="w-full bg-mb-black border border-mb-border rounded px-2 py-1 text-sm text-white text-right"
                                  />
                                </td>
                                <td className="py-1 px-3 text-right text-sm whitespace-nowrap text-mb-silver">
                                  {(
                                    parseTimeToHours(editFields.repair_time) *
                                    (parseFloat(editFields.hourly_rate) || 0)
                                  ).toFixed(2)}{" "}
                                  €
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-1 pr-1">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editFields.repair_total}
                                    onChange={(ev) =>
                                      setEditFields((f) => ({
                                        ...f,
                                        repair_total: ev.target.value,
                                      }))
                                    }
                                    className="w-full bg-mb-black border border-mb-border rounded px-2 py-1 text-sm text-white text-right"
                                  />
                                </td>
                                <td className="py-1 pr-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={editFields.turnover_pct}
                                    onChange={(ev) =>
                                      setEditFields((f) => ({
                                        ...f,
                                        turnover_pct: ev.target.value,
                                      }))
                                    }
                                    className="w-full bg-mb-black border border-mb-border rounded px-2 py-1 text-sm text-white text-right"
                                  />
                                </td>
                                <td className="py-1 pr-1 text-right text-sm whitespace-nowrap text-mb-silver">
                                  {(
                                    (parseFloat(editFields.repair_total) || 0) *
                                    ((parseFloat(editFields.turnover_pct) ||
                                      0) /
                                      100)
                                  ).toFixed(2)}{" "}
                                  €
                                </td>
                              </>
                            )}
                            <td className="py-1 pr-1">
                              <input
                                type="date"
                                value={editFields.entry_date}
                                onChange={(ev) =>
                                  setEditFields((f) => ({
                                    ...f,
                                    entry_date: ev.target.value,
                                  }))
                                }
                                className="bg-mb-black border border-mb-border rounded px-2 py-1 text-sm text-white [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:sepia [&::-webkit-calendar-picker-indicator]:hue-rotate-[190deg] [&::-webkit-calendar-picker-indicator]:saturate-[10]"
                              />
                            </td>
                            <td className="py-1">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => saveEdit(e.id)}
                                  className="text-green-400 hover:text-green-300 p-0.5"
                                  title={isBg ? "Запази" : "Save"}
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="text-mb-silver hover:text-white p-0.5"
                                  title={isBg ? "Откажи" : "Cancel"}
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr
                          key={e.id}
                          className="border-b border-mb-border/40 group"
                        >
                          <td className="py-1.5 pr-2 text-white truncate max-w-0">
                            {e.vehicle || "-"}
                          </td>
                          <td className="py-1.5 pr-2 text-mb-silver truncate max-w-0">
                            {e.repair_name || "-"}
                          </td>
                          {workerType === "mechanic" ? (
                            <>
                              <td className="py-1.5 pr-2 text-right text-mb-silver whitespace-nowrap">
                                {formatHours(e.repair_time || 0)}
                              </td>
                              <td className="py-1.5 pr-2 text-right text-mb-silver whitespace-nowrap">
                                {e.hourly_rate} €
                              </td>
                              <td className="py-1.5 pr-2 text-right text-white font-medium whitespace-nowrap">
                                {(e.total || 0).toFixed(2)} €
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-1.5 pr-2 text-right text-mb-silver whitespace-nowrap">
                                {(e.repair_total || 0).toFixed(2)} €
                              </td>
                              <td className="py-1.5 pr-2 text-right text-mb-silver whitespace-nowrap">
                                {e.turnover_pct}%
                              </td>
                              <td className="py-1.5 pr-2 text-right text-white font-medium whitespace-nowrap">
                                {(e.earnings || 0).toFixed(2)} €
                              </td>
                            </>
                          )}
                          <td className="py-1.5 pr-2 text-right text-mb-silver whitespace-nowrap">
                            {formatDate(e.entry_date)}
                          </td>
                          <td className="py-1.5">
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button
                                onClick={() => startEdit(e)}
                                className="text-mb-blue hover:text-blue-300 p-0.5"
                                title={isBg ? "Редактирай" : "Edit"}
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteEntry(e.id)}
                                className="text-red-400 hover:text-red-300 p-0.5"
                                title={isBg ? "Изтрий" : "Delete"}
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Deductions & Summary */}
              {workerType === "mechanic" ? (
                <>
                  <div className="border-t border-mb-border pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
                      <div className="rounded-lg border border-mb-border bg-mb-black/40 px-4 py-3 flex flex-col items-center gap-1">
                        <span className="text-mb-silver text-xs uppercase tracking-wide">
                          {isBg ? "Общо часове" : "Total Hours"}
                        </span>
                        <span className="text-mb-blue text-lg font-bold">
                          {formatHours(mechanicTotalHours)}
                        </span>
                      </div>
                      <div className="rounded-lg border border-mb-border bg-mb-black/40 px-4 py-3 flex flex-col items-center gap-1">
                        <span className="text-mb-silver text-xs uppercase tracking-wide">
                          {isBg ? "Общо заработено" : "Total Earnings"}
                        </span>
                        <span className="text-white text-lg font-bold">
                          {mechanicTotal.toFixed(2)} €
                        </span>
                      </div>
                      <div className="rounded-lg border border-green-500/40 bg-green-500/5 px-4 py-3 flex flex-col items-center gap-1">
                        <span className="text-mb-silver text-xs uppercase tracking-wide">
                          {isBg ? "Нето 50%" : "Net 50%"}
                        </span>
                        <span className="text-green-400 text-xl font-bold">
                          {mechanicNet.toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-mb-border pt-3 space-y-3">
                    <p className="text-xs text-mb-silver uppercase tracking-wide">
                      {isBg ? "Месечни удръжки" : "Monthly Deductions"}
                    </p>
                    <div className="grid grid-cols-3 gap-3 max-w-xl">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {isBg ? "Карта (€)" : "Card (€)"}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={mechanicCard}
                          onChange={(e) => {
                            setMechanicCard(e.target.value);
                            saveMonthlySummary({
                              card_amount: parseFloat(e.target.value) || 0,
                            });
                          }}
                          className="bg-gray-100 text-gray-900 border-mb-border text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {isBg ? "Глоби (€)" : "Fines (€)"}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={mechanicFines}
                          onChange={(e) => {
                            setMechanicFines(e.target.value);
                            saveMonthlySummary({
                              fines_amount: parseFloat(e.target.value) || 0,
                            });
                          }}
                          className="bg-gray-100 text-gray-900 border-mb-border text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {isBg ? "Бонус (€)" : "Bonus (€)"}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={mechanicBonus}
                          onChange={(e) => {
                            setMechanicBonus(e.target.value);
                            saveMonthlySummary({
                              bonus_amount: parseFloat(e.target.value) || 0,
                            });
                          }}
                          className="bg-gray-100 text-gray-900 border-mb-border text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 max-w-xl">
                      <span className="text-mb-silver text-sm">
                        {isBg ? "В БРОЙ" : "Cash"}
                      </span>
                      <span className="text-white text-xl font-bold">
                        {mechanicCash.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-t border-mb-border pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-mb-silver">
                        {isBg ? "Заработка общо (%)" : "Total Earnings (%)"}
                      </span>
                      <span className="text-mb-silver">
                        {receptionistTotal.toFixed(2)} €
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-mb-border pt-3 space-y-3">
                    <p className="text-xs text-mb-silver uppercase tracking-wide">
                      {isBg ? "Месечно обобщение" : "Monthly Summary"}
                    </p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {isBg ? "Твърдо (€)" : "Fixed Salary (€)"}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={receptionistFixed}
                          onChange={(e) => {
                            setReceptionistFixed(e.target.value);
                            saveMonthlySummary({
                              fixed_salary: parseFloat(e.target.value) || 0,
                            });
                          }}
                          className="bg-gray-100 text-gray-900 border-mb-border text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {isBg ? "Карта (€)" : "Card (€)"}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={receptionistCard}
                          onChange={(e) => {
                            setReceptionistCard(e.target.value);
                            saveMonthlySummary({
                              card_amount: parseFloat(e.target.value) || 0,
                            });
                          }}
                          className="bg-gray-100 text-gray-900 border-mb-border text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {isBg ? "В Брой (€)" : "Cash (€)"}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={receptionistCash}
                          onChange={(e) => {
                            setReceptionistCash(e.target.value);
                            saveMonthlySummary({
                              cash_amount: parseFloat(e.target.value) || 0,
                            });
                          }}
                          className="bg-gray-100 text-gray-900 border-mb-border text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {isBg ? "Глоби (€)" : "Fines (€)"}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={receptionistFines}
                          onChange={(e) => {
                            setReceptionistFines(e.target.value);
                            saveMonthlySummary({
                              fines_amount: parseFloat(e.target.value) || 0,
                            });
                          }}
                          className="bg-gray-100 text-gray-900 border-mb-border text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-mb-silver text-sm">
                        {isBg ? "Обща заплата" : "Total Salary"}
                      </span>
                      <span className="text-green-400 text-lg font-bold">
                        {recTotalSalary.toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-white text-sm font-semibold">
                        {isBg ? "Остатък" : "Remaining"}
                      </span>
                      <span className="text-white text-xl font-bold">
                        {recRemaining.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Generate PDF Button */}
              <div className="pt-4 border-t border-mb-border">
                <Button
                  type="button"
                  size="sm"
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                  disabled={pdfGenerating}
                  onClick={generatePDF}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {pdfGenerating
                    ? isBg
                      ? "Създаване"
                      : "Generating…"
                    : isBg
                      ? "Изтегли PDF"
                      : "Download PDF"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
