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
import type {
  Mechanic,
  Receptionist,
  EarningsEntry,
  EarningsMonthlySummary,
} from "@/types/database";

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

export function EarningsPage() {
  const locale = useLocale() as "bg" | "en";
  const isBg = locale === "bg";
  const router = useRouter();

  // Current month/year state
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Workers
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [selectedMechanic, setSelectedMechanic] = useState("");
  const [selectedReceptionist, setSelectedReceptionist] = useState("");

  // Entries
  const [mechanicEntries, setMechanicEntries] = useState<EarningsEntry[]>([]);
  const [receptionistEntries, setReceptionistEntries] = useState<
    EarningsEntry[]
  >([]);

  // Global defaults
  const [defaultMechRate, setDefaultMechRate] = useState("");
  const [defaultRecPct, setDefaultRecPct] = useState("");

  // Manual entry form
  const [mechManualVehicle, setMechManualVehicle] = useState("");
  const [mechManualRepair, setMechManualRepair] = useState("");
  const [mechManualTime, setMechManualTime] = useState("");
  const [mechManualRate, setMechManualRate] = useState("");
  const [mechManualDate, setMechManualDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [recManualVehicle, setRecManualVehicle] = useState("");
  const [recManualRepair, setRecManualRepair] = useState("");
  const [recManualTotal, setRecManualTotal] = useState("");
  const [recManualPct, setRecManualPct] = useState("");
  const [recManualDate, setRecManualDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  // Monthly summary fields for active worker
  const [mechanicCard, setMechanicCard] = useState("");
  const [mechanicFines, setMechanicFines] = useState("");
  const [receptionistFixed, setReceptionistFixed] = useState("");
  const [receptionistCard, setReceptionistCard] = useState("");
  const [receptionistCash, setReceptionistCash] = useState("");
  const [receptionistFines, setReceptionistFines] = useState("");
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // All-workers earnings log
  const [earningsLog, setEarningsLog] = useState<
    { id: string; name: string; type: string; totalEarned: number }[]
  >([]);

  // Load app settings
  useEffect(() => {
    supabase
      .from("app_settings")
      .select("*")
      .then(({ data }) => {
        const resp = data as any[];
        if (resp) {
          const mech = resp.find((s) => s.key === "mechanic_rate")?.value;
          const rec = resp.find((s) => s.key === "receptionist_pct")?.value;
          if (mech !== undefined) setDefaultMechRate(String(mech));
          if (rec !== undefined) setDefaultRecPct(String(rec));
        }
      });
  }, []);

  // Load workers on mount
  useEffect(() => {
    supabase
      .from("mechanics")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setMechanics(data as Mechanic[]);
      });

    supabase
      .from("receptionists")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setReceptionists(data as Receptionist[]);
      });
  }, []);

  // Load earnings log (all workers, current month/year)
  const loadEarningsLog = useCallback(async () => {
    const { data } = await supabase
      .from("earnings_entries")
      .select("worker_id, worker_name, worker_type, total, earnings")
      .eq("month", selectedMonth)
      .eq("year", selectedYear);

    if (!data) {
      setEarningsLog([]);
      return;
    }

    const map = new Map<
      string,
      { id: string; name: string; type: string; totalEarned: number }
    >();
    for (const row of data as any[]) {
      const key = `${row.worker_type}:${row.worker_name}`;
      const existing = map.get(key) || {
        id: row.worker_id,
        name: row.worker_name,
        type: row.worker_type,
        totalEarned: 0,
      };
      existing.totalEarned +=
        row.worker_type === "mechanic" ? row.total || 0 : row.earnings || 0;
      map.set(key, existing);
    }
    setEarningsLog(Array.from(map.values()));
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadEarningsLog();
  }, [loadEarningsLog]);

  // Reload when month/year changes
  useEffect(() => {
    // We already fetch global log on change.
  }, [selectedMonth, selectedYear]);

  // Load specific worker monthly deductions for the active worker
  const loadWorkerEntries = useCallback(
    async (workerId: string, type: "mechanic" | "receptionist") => {
      if (!workerId) {
        // Clear local entries and deductions when no worker is selected
        if (type === "mechanic") {
          setMechanicEntries([]);
          setMechanicCard("");
          setMechanicFines("");
        } else {
          setReceptionistEntries([]);
          setReceptionistFixed("");
          setReceptionistCard("");
          setReceptionistCash("");
          setReceptionistFines("");
        }
        return;
      }

      // Wait for user to have run the SQL to avoid crashes.
      // Loading only unexported earnings from the DB into the table here.
      const { data } = await supabase
        .from("earnings_entries")
        .select("*")
        .eq("worker_id", workerId)
        .eq("worker_type", type)
        .eq("month", selectedMonth)
        .eq("year", selectedYear)
        .eq("is_exported", false)
        .order("entry_date", { ascending: false });

      if (data) {
        if (type === "mechanic") setMechanicEntries(data as EarningsEntry[]);
        else setReceptionistEntries(data as EarningsEntry[]);
      }

      // Load summary
      const { data: summary } = await supabase
        .from("earnings_monthly_summary")
        .select("*")
        .eq("worker_id", workerId)
        .eq("worker_type", type)
        .eq("month", selectedMonth)
        .eq("year", selectedYear)
        .maybeSingle();

      const sumData = summary as any;
      if (type === "mechanic") {
        if (sumData) {
          setMechanicCard(sumData.card_amount?.toString() || "");
          setMechanicFines(sumData.fines_amount?.toString() || "");
        } else {
          setMechanicCard("");
          setMechanicFines("");
        }
      } else {
        if (sumData) {
          setReceptionistFixed(sumData.fixed_salary?.toString() || "");
          setReceptionistCard(sumData.card_amount?.toString() || "");
          setReceptionistCash(sumData.cash_amount?.toString() || "");
          setReceptionistFines(sumData.fines_amount?.toString() || "");
        } else {
          setReceptionistFixed("");
          setReceptionistCard("");
          setReceptionistCash("");
          setReceptionistFines("");
        }
      }
    },
    [selectedMonth, selectedYear],
  );

  useEffect(() => {
    loadWorkerEntries(selectedMechanic, "mechanic");
  }, [selectedMechanic, selectedMonth, selectedYear, loadWorkerEntries]);

  useEffect(() => {
    loadWorkerEntries(selectedReceptionist, "receptionist");
  }, [selectedReceptionist, selectedMonth, selectedYear, loadWorkerEntries]);

  const deleteEntry = async (id: string, type: "mechanic" | "receptionist") => {
    await supabase.from("earnings_entries").delete().eq("id", id);
    loadEarningsLog();
    // remove from local session state immediately
    if (type === "mechanic") {
      setMechanicEntries((prev) => prev.filter((e) => e.id !== id));
    } else {
      setReceptionistEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // Add manual mechanic entry
  const addMechanicEntry = async () => {
    if (!selectedMechanic) return;
    const mechanic = mechanics.find((m) => m.id === selectedMechanic);
    const time = parseTimeToHours(mechManualTime);
    const rate = parseFloat(mechManualRate) || 0;
    const total = time * rate;
    const entryDate = mechManualDate || new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from("earnings_entries").insert({
      worker_id: selectedMechanic,
      worker_type: "mechanic",
      worker_name: mechanic?.name || "",
      vehicle: mechManualVehicle || null,
      repair_name: mechManualRepair || null,
      repair_time: time,
      hourly_rate: rate,
      total,
      entry_date: entryDate,
      month: selectedMonth,
      year: selectedYear,
      is_exported: false,
    } as never);

    if (!error) {
      setMechManualVehicle("");
      setMechManualRepair("");
      setMechManualTime("");
      // we keep the default rate for convenience for the next entry
      loadEarningsLog();
      loadWorkerEntries(selectedMechanic, "mechanic");
    }
  };

  // Add manual receptionist entry
  const addReceptionistEntry = async () => {
    if (!selectedReceptionist) return;
    const rec = receptionists.find((r) => r.id === selectedReceptionist);
    const repairTotal = parseFloat(recManualTotal) || 0;
    const pct = parseFloat(recManualPct) || 0;
    const earnings = repairTotal * (pct / 100);
    const entryDate = recManualDate || new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from("earnings_entries").insert({
      worker_id: selectedReceptionist,
      worker_type: "receptionist",
      worker_name: rec?.name || "",
      vehicle: recManualVehicle || null,
      repair_name: recManualRepair || null,
      repair_total: repairTotal,
      turnover_pct: pct,
      earnings,
      entry_date: entryDate,
      month: selectedMonth,
      year: selectedYear,
      is_exported: false,
    } as never);

    if (!error) {
      setRecManualVehicle("");
      setRecManualRepair("");
      setRecManualTotal("");
      // we keep pct
      loadEarningsLog();
      loadWorkerEntries(selectedReceptionist, "receptionist");
    }
  };

  // Save monthly summary (upsert)
  const saveMonthlySummary = useCallback(
    async (
      workerId: string,
      workerType: string,
      fields: Partial<EarningsMonthlySummary>,
    ) => {
      const { data: existing } = await supabase
        .from("earnings_monthly_summary")
        .select("id")
        .eq("worker_id", workerId)
        .eq("worker_type", workerType)
        .eq("month", selectedMonth)
        .eq("year", selectedYear)
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
          month: selectedMonth,
          year: selectedYear,
          ...fields,
        } as never);
      }
    },
    [selectedMonth, selectedYear],
  );

  const generatePDF = async (type: "mechanic" | "receptionist") => {
    const entriesToUse =
      type === "mechanic" ? mechanicEntries : receptionistEntries;
    if (entriesToUse.length === 0) return;

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
      const workerIdToUse =
        type === "mechanic" ? selectedMechanic : selectedReceptionist;
      const workerName =
        type === "mechanic"
          ? mechanics.find((m) => m.id === workerIdToUse)?.name || ""
          : receptionists.find((r) => r.id === workerIdToUse)?.name || "";

      if (type === "mechanic") {
        const pdfEntries = entriesToUse.map((e) => ({
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
            year={selectedYear.toString()}
            entries={pdfEntries}
            card={parseFloat(mechanicCard) || 0}
            fines={parseFloat(mechanicFines) || 0}
          />
        );
        filename = `${workerName.trim().replace(/\s+/g, "-")}-${monthLabel}-${selectedYear}.pdf`;
      } else {
        const pdfEntries = entriesToUse.map((e) => ({
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
            year={selectedYear.toString()}
            entries={pdfEntries}
            fixedSalary={parseFloat(receptionistFixed) || 0}
            card={parseFloat(receptionistCard) || 0}
            cash={parseFloat(receptionistCash) || 0}
            fines={parseFloat(receptionistFines) || 0}
          />
        );
        filename = `${workerName.trim().replace(/\s+/g, "-")}-${monthLabel}-${selectedYear}.pdf`;
      }

      const blob = await pdf(component).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Mark as exported in DB
      const entryIds = entriesToUse.map((e) => e.id);
      await supabase
        .from("earnings_entries")
        .update({ is_exported: true } as never)
        .in("id", entryIds);

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        // Reset selection per user request so they can start fresh
        if (type === "mechanic") {
          setSelectedMechanic("");
          setMechanicEntries([]);
        } else {
          setSelectedReceptionist("");
          setReceptionistEntries([]);
        }
      }, 100);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setPdfGenerating(false);
    }
  };

  // Month navigation
  const prevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else setSelectedMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else setSelectedMonth((m) => m + 1);
  };

  const monthLabel = isBg
    ? MONTH_NAMES_BG[selectedMonth - 1]
    : MONTH_NAMES_EN[selectedMonth - 1];

  // Computations
  const mechanicTotalHours = mechanicEntries.reduce(
    (s, e) => s + (e.repair_time || 0),
    0,
  );
  const mechanicTotal = mechanicEntries.reduce((s, e) => s + (e.total || 0), 0);
  const mechanicNet = mechanicTotal * 0.5;
  const mechCardVal = parseFloat(mechanicCard) || 0;
  const mechFinesVal = parseFloat(mechanicFines) || 0;
  const mechanicCash = mechanicNet - mechCardVal - mechFinesVal;

  const receptionistTotal = receptionistEntries.reduce(
    (s, e) => s + (e.earnings || 0),
    0,
  );
  const recFixedVal = parseFloat(receptionistFixed) || 0;
  const recCardVal = parseFloat(receptionistCard) || 0;
  const recCashVal = parseFloat(receptionistCash) || 0;
  const recFinesVal = parseFloat(receptionistFines) || 0;
  const recTotalSalary = receptionistTotal + recFixedVal;
  const recRemaining = recTotalSalary - recCardVal - recFinesVal - recCashVal;

  return (
    <div className="space-y-6 p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isBg ? "Заработки" : "Earnings"}
          </h1>
        </div>
        {/* Month/Year Picker */}
        <div className="flex items-center gap-2 bg-mb-anthracite border border-mb-border rounded-xl px-3 py-2">
          <button
            onClick={prevMonth}
            className="text-mb-silver hover:text-white p-1 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-white font-medium text-sm min-w-[140px] text-center capitalize">
            {monthLabel} {selectedYear}
          </span>
          <button
            onClick={nextMonth}
            className="text-mb-silver hover:text-white p-1 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Earnings Log - All Workers Summary */}
      {earningsLog.length > 0 && (
        <Card className="bg-gradient-to-r from-mb-anthracite to-mb-black border-mb-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <svg
                className="w-4 h-4 text-mb-blue"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {isBg ? "Обобщение на заработките" : "Earnings Summary"}
              <span className="text-mb-silver font-normal text-xs">
                - {monthLabel} {selectedYear}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {earningsLog.map((w, i) => (
                <button
                  key={i}
                  onClick={() =>
                    router.push(
                      `/${locale}/mb-admin/earnings/edit?id=${w.id}&type=${w.type}&month=${selectedMonth}&year=${selectedYear}`,
                    )
                  }
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-mb-black/60 border border-mb-border/50 hover:bg-mb-blue/10 hover:border-mb-blue/40 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${w.type === "mechanic" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}
                    >
                      {w.type === "mechanic"
                        ? isBg
                          ? "МЕХАНИК"
                          : "MECHANIC"
                        : isBg
                          ? "ПРИЕМЧИК"
                          : "RECEPTIONIST"}
                    </span>
                    <span className="text-sm text-white group-hover:text-mb-blue transition-colors">
                      {w.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-green-400">
                      {w.totalEarned.toFixed(2)} €
                    </span>
                    <svg
                      className="w-4 h-4 text-mb-silver/40 group-hover:text-mb-blue transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ═══════════════════════════════════════════════ */}
        {/* Mechanic Earnings Panel                         */}
        {/* ═══════════════════════════════════════════════ */}
        <Card className="bg-mb-anthracite border-mb-border">
          <CardHeader>
            <CardTitle className="text-base">
              {isBg ? "Заработка механик" : "Mechanic Earnings"}
            </CardTitle>
            <select
              value={selectedMechanic}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedMechanic(val);
                if (val) {
                  setMechManualVehicle("");
                  setMechManualRepair("");
                  setMechManualTime("");
                  setMechManualRate(defaultMechRate);
                }
              }}
              className="w-full rounded-md border border-mb-border bg-gray-100 text-gray-900 px-3 py-2 text-sm mt-2"
            >
              <option value="">
                {isBg ? "- Избери механик -" : "- Select Mechanic -"}
              </option>
              {mechanics
                .filter(
                  (m) => !m.name.includes("50:50") && !m.name.includes("50/50"),
                )
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedMechanic && (
              <>
                {/* Manual entry form */}
                <div className="border border-mb-border/50 rounded-lg p-3 space-y-2 bg-mb-black/30">
                  <p className="text-xs text-mb-silver uppercase tracking-wide mb-2">
                    {isBg ? "Добави запис" : "Add Entry"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={isBg ? "Автомобил" : "Vehicle"}
                      value={mechManualVehicle}
                      onChange={(e) => setMechManualVehicle(e.target.value)}
                      className="bg-mb-black text-white border-mb-border text-sm"
                    />
                    <Input
                      placeholder={isBg ? "Ремонт" : "Repair"}
                      value={mechManualRepair}
                      onChange={(e) => setMechManualRepair(e.target.value)}
                      className="bg-mb-black text-white border-mb-border text-sm"
                    />
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder={
                        isBg ? "Часове (1:30 или 1.5)" : "Hours (1:30 or 1.5)"
                      }
                      value={mechManualTime}
                      onChange={(e) => setMechManualTime(e.target.value)}
                      className="bg-mb-black text-white border-mb-border text-sm"
                    />
                    <Input
                      type="number"
                      placeholder={isBg ? "Ставка €/час" : "Rate €/h"}
                      value={mechManualRate}
                      onChange={(e) => setMechManualRate(e.target.value)}
                      className="bg-mb-black text-white border-mb-border text-sm"
                    />
                    <Input
                      type="date"
                      value={mechManualDate}
                      onChange={(e) => setMechManualDate(e.target.value)}
                      className="bg-mb-black text-white border-mb-border text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addMechanicEntry}
                      className="bg-mb-blue hover:bg-mb-blue/80 text-white text-sm"
                    >
                      {isBg ? "Добави" : "Add"}
                    </Button>
                  </div>
                </div>

                {/* Mechanic Entries List */}
                {mechanicEntries.length > 0 && (
                  <div className="mt-4 border border-mb-border rounded-lg bg-mb-black/50 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-mb-border text-mb-silver text-xs uppercase">
                          <th className="text-left py-2 px-3">
                            {isBg ? "Автомобил / Ремонт" : "Vehicle / Repair"}
                          </th>
                          <th className="text-right py-2 pr-2">
                            {isBg ? "Часове / Ставка" : "Hours / Rate"}
                          </th>
                          <th className="text-right py-2 pr-2">
                            {isBg ? "Сума" : "Total"}
                          </th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-mb-border/40">
                        {mechanicEntries.map((e) => (
                          <tr
                            key={e.id}
                            className="group hover:bg-white/5 transition-colors"
                          >
                            <td className="py-2 px-3">
                              <div className="text-white">
                                {e.vehicle || "-"}
                              </div>
                              <div className="text-mb-silver text-xs">
                                {e.repair_name || "-"}
                              </div>
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <div className="text-mb-silver">
                                {formatHours(e.repair_time || 0)}
                              </div>
                              <div className="text-mb-silver text-xs">
                                {e.hourly_rate} €
                              </div>
                            </td>
                            <td className="py-2 pr-2 text-right text-white font-medium">
                              {(e.total || 0).toFixed(2)} €
                            </td>
                            <td className="py-2">
                              <button
                                onClick={() => deleteEntry(e.id, "mechanic")}
                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-0.5"
                                title={isBg ? "Изтрий" : "Delete"}
                              >
                                <svg
                                  className="w-4 h-4"
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mechanic Deductions & Summary embedded in the same block */}
                    <div className="p-4 bg-mb-black">
                      <div className="border-t border-mb-border pt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-mb-silver">
                            {isBg ? "Общо часове" : "Total Earned Hours"}
                          </span>
                          <span className="text-mb-blue font-semibold">
                            {formatHours(mechanicTotalHours)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-mb-silver">
                            {isBg ? "Общо заработено" : "Total Earnings"}
                          </span>
                          <span className="text-white font-semibold">
                            {mechanicTotal.toFixed(2)} €
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-mb-silver">
                            {isBg ? "Нето 50%" : "Net 50%"}
                          </span>
                          <span className="text-green-400 font-semibold">
                            {mechanicNet.toFixed(2)} €
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-mb-border mt-3 pt-3 space-y-3">
                        <p className="text-xs text-mb-silver uppercase tracking-wide">
                          {isBg ? "Месечни удръжки" : "Monthly Deductions"}
                        </p>
                        <div className="grid grid-cols-2 gap-3 max-w-xl">
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
                                saveMonthlySummary(
                                  selectedMechanic,
                                  "mechanic",
                                  {
                                    card_amount:
                                      parseFloat(e.target.value) || 0,
                                  },
                                );
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
                                saveMonthlySummary(
                                  selectedMechanic,
                                  "mechanic",
                                  {
                                    fines_amount:
                                      parseFloat(e.target.value) || 0,
                                  },
                                );
                              }}
                              className="bg-gray-100 text-gray-900 border-mb-border text-sm"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between text-sm pt-1 max-w-xl">
                          <span className="text-mb-silver">
                            {isBg ? "В БРОЙ" : "Cash"}
                          </span>
                          <span className="text-white font-bold">
                            {mechanicCash.toFixed(2)} €
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 mt-2 border-t border-mb-border">
                        <Button
                          type="button"
                          size="sm"
                          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                          disabled={pdfGenerating}
                          onClick={() => generatePDF("mechanic")}
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
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════════ */}
        {/* Receptionist Earnings Panel                     */}
        {/* ═══════════════════════════════════════════════ */}
        <Card className="bg-mb-anthracite border-mb-border">
          <CardHeader>
            <CardTitle className="text-base">
              {isBg ? "Заработка приемчик" : "Receptionist Earnings"}
            </CardTitle>
            <select
              value={selectedReceptionist}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedReceptionist(val);
                if (val) {
                  setRecManualVehicle("");
                  setRecManualRepair("");
                  setRecManualTotal("");
                  setRecManualPct(defaultRecPct);
                }
              }}
              className="w-full rounded-md border border-mb-border bg-gray-100 text-gray-900 px-3 py-2 text-sm mt-2"
            >
              <option value="">
                {isBg ? "- Избери приемчик -" : "- Select Receptionist -"}
              </option>
              {receptionists.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedReceptionist && (
              <>
                {/* Manual entry form */}
                <div className="border border-mb-border/50 rounded-lg p-3 space-y-2 bg-mb-black/30">
                  <p className="text-xs text-mb-silver uppercase tracking-wide mb-2">
                    {isBg ? "Добави запис" : "Add Entry"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={isBg ? "Автомобил" : "Vehicle"}
                      value={recManualVehicle}
                      onChange={(e) => setRecManualVehicle(e.target.value)}
                      className="bg-mb-black text-white border-mb-border text-sm"
                    />
                    <Input
                      placeholder={isBg ? "Ремонт" : "Repair"}
                      value={recManualRepair}
                      onChange={(e) => setRecManualRepair(e.target.value)}
                      className="bg-mb-black text-white border-mb-border text-sm"
                    />
                    <Input
                      type="number"
                      placeholder={
                        isBg ? "Сума ремонт (€)" : "Repair Total (€)"
                      }
                      value={recManualTotal}
                      onChange={(e) => setRecManualTotal(e.target.value)}
                      className="bg-mb-black text-white border-mb-border text-sm"
                    />
                    <Input
                      type="number"
                      placeholder={isBg ? "% от оборот" : "% Turnover"}
                      value={recManualPct}
                      onChange={(e) => setRecManualPct(e.target.value)}
                      className="bg-mb-black text-white border-mb-border text-sm"
                    />
                    <Input
                      type="date"
                      value={recManualDate}
                      onChange={(e) => setRecManualDate(e.target.value)}
                      className="bg-mb-black text-white border-mb-border text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addReceptionistEntry}
                      className="bg-mb-blue hover:bg-mb-blue/80 text-white text-sm"
                    >
                      {isBg ? "Добави" : "Add"}
                    </Button>
                  </div>
                </div>

                {/* Receptionist Entries List */}
                {receptionistEntries.length > 0 && (
                  <div className="mt-4 border border-mb-border rounded-lg bg-mb-black/50 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-mb-border text-mb-silver text-xs uppercase">
                          <th className="text-left py-2 px-3">
                            {isBg ? "Автомобил / Ремонт" : "Vehicle / Repair"}
                          </th>
                          <th className="text-right py-2 pr-2">
                            {isBg ? "Оборот / %" : "Turnover / %"}
                          </th>
                          <th className="text-right py-2 pr-2">
                            {isBg ? "Сума" : "Total"}
                          </th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-mb-border/40">
                        {receptionistEntries.map((e) => (
                          <tr
                            key={e.id}
                            className="group hover:bg-white/5 transition-colors"
                          >
                            <td className="py-2 px-3">
                              <div className="text-white">
                                {e.vehicle || "-"}
                              </div>
                              <div className="text-mb-silver text-xs">
                                {e.repair_name || "-"}
                              </div>
                            </td>
                            <td className="py-2 pr-2 text-right">
                              <div className="text-mb-silver">
                                {(e.repair_total || 0).toFixed(2)} €
                              </div>
                              <div className="text-mb-silver text-xs">
                                {e.turnover_pct}%
                              </div>
                            </td>
                            <td className="py-2 pr-2 text-right text-white font-medium">
                              {(e.earnings || 0).toFixed(2)} €
                            </td>
                            <td className="py-2">
                              <button
                                onClick={() =>
                                  deleteEntry(e.id, "receptionist")
                                }
                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-0.5"
                                title={isBg ? "Изтрий" : "Delete"}
                              >
                                <svg
                                  className="w-4 h-4"
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Receptionist Deductions & Summary embedded in the same block */}
                    <div className="p-4 bg-mb-black">
                      <div className="border-t border-mb-border pt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-mb-silver">
                            {isBg ? "Заработка общо (%)" : "Total Earnings (%)"}
                          </span>
                          <span className="text-mb-silver font-semibold">
                            {receptionistTotal.toFixed(2)} €
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-mb-border mt-3 pt-3 space-y-3">
                        <p className="text-xs text-mb-silver uppercase tracking-wide">
                          {isBg ? "Месечно обобщение" : "Monthly Summary"}
                        </p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">
                              {isBg
                                ? "Фиксирана заплата (€)"
                                : "Fixed Salary (€)"}
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={receptionistFixed}
                              onChange={(e) => {
                                setReceptionistFixed(e.target.value);
                                saveMonthlySummary(
                                  selectedReceptionist,
                                  "receptionist",
                                  {
                                    fixed_salary:
                                      parseFloat(e.target.value) || 0,
                                  },
                                );
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
                                saveMonthlySummary(
                                  selectedReceptionist,
                                  "receptionist",
                                  {
                                    card_amount:
                                      parseFloat(e.target.value) || 0,
                                  },
                                );
                              }}
                              className="bg-gray-100 text-gray-900 border-mb-border text-sm"
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">
                              {isBg ? "Кеш (€)" : "Cash (€)"}
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={receptionistCash}
                              onChange={(e) => {
                                setReceptionistCash(e.target.value);
                                saveMonthlySummary(
                                  selectedReceptionist,
                                  "receptionist",
                                  {
                                    cash_amount:
                                      parseFloat(e.target.value) || 0,
                                  },
                                );
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
                                saveMonthlySummary(
                                  selectedReceptionist,
                                  "receptionist",
                                  {
                                    fines_amount:
                                      parseFloat(e.target.value) || 0,
                                  },
                                );
                              }}
                              className="bg-gray-100 text-gray-900 border-mb-border text-sm"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between text-sm font-semibold pt-1">
                          <span className="text-mb-silver">
                            {isBg ? "Обща заплата" : "Total Salary"}
                          </span>
                          <span className="text-green-400">
                            {recTotalSalary.toFixed(2)} €
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-bold pt-1">
                          <span className="text-white">
                            {isBg ? "Остатък" : "Remaining"}
                          </span>
                          <span className="text-white">
                            {recRemaining.toFixed(2)} €
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 mt-2 border-t border-mb-border">
                        <Button
                          type="button"
                          size="sm"
                          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                          disabled={pdfGenerating}
                          onClick={() => generatePDF("receptionist")}
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
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
