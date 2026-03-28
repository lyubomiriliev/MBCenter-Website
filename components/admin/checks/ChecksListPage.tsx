"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";
import { pdf } from "@react-pdf/renderer";
import { CheckPDF } from "@/components/pdf/CheckPDF";
import type { CheckFormData } from "@/components/pdf/CheckPDF";

interface Inspection {
  id: string;
  check_number: string;
  inspection_date: string;
  mechanic: string | null;
  client_name: string | null;
  car_model: string | null;
  license_plate: string | null;
  vin: string | null;
  tires: CheckFormData["tires"];
  corrosion: CheckFormData["corrosion"];
  fluids: CheckFormData["fluids"];
  mileage: CheckFormData["mileage"];
  brakes: CheckFormData["brakes"];
  suspension: CheckFormData["suspension"];
  summary: string | null;
  created_at: string;
}

function ActionsDropdown({
  onDownload,
  onDelete,
  onClone,
  downloading,
  deleting,
  cloning,
}: {
  onDownload: () => void;
  onDelete: () => void;
  onClone: () => void;
  downloading: boolean;
  deleting: boolean;
  cloning: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const openDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const dropdown = open ? (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
      className="w-44 bg-mb-anthracite border border-mb-border rounded-md shadow-xl py-1"
    >
      <button
        onClick={() => {
          setOpen(false);
          onDownload();
        }}
        disabled={downloading}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-mb-black transition-colors disabled:opacity-50"
      >
        {downloading ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
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
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
        Изтегли PDF
      </button>

      <button
        onClick={() => {
          setOpen(false);
          onClone();
        }}
        disabled={cloning}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-mb-black transition-colors disabled:opacity-50"
      >
        {cloning ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
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
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
        Клонирай
      </button>

      <button
        onClick={() => {
          setOpen(false);
          onDelete();
        }}
        disabled={deleting}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        Изтрий
      </button>
    </div>
  ) : null;

  return (
    <>
      <Button
        ref={btnRef}
        variant="ghost"
        size="sm"
        onClick={openDropdown}
        className="h-8 px-2.5 rounded-md border border-mb-border text-mb-silver hover:text-white hover:bg-mb-black/50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </Button>
      {typeof document !== "undefined" && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </>
  );
}

export function ChecksListPage({ basePath }: { basePath: "mb-admin" | "mb-admin-mechanics" }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const routePrefix = `/${locale}/${basePath}`;

  const PAGE_SIZE = 25;
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchInspections = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      let query = supabase
        .from("inspections")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
        .abortSignal(signal as AbortSignal);

      if (search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(
          `client_name.ilike.${term},car_model.ilike.${term},license_plate.ilike.${term},vin.ilike.${term},check_number.ilike.${term}`,
        );
      }

      const { data, error, count } = await query;
      if (error) {
        if (error.message?.includes("aborted")) return;
        throw error;
      }
      setInspections((data as Inspection[]) ?? []);
      setTotalCount(count ?? 0);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Failed to fetch inspections:", err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    fetchInspections(controller.signal);
    return () => controller.abort();
  }, [fetchInspections]);

  const handleDownload = async (inspection: Inspection) => {
    setDownloadingId(inspection.id);
    try {
      const { registerPDFFonts } = await import("@/lib/pdf-fonts");
      const { setFontRegistered } = await import("@/components/pdf/CheckPDF");
      const fontsReady = await registerPDFFonts();
      setFontRegistered(fontsReady);

      const formData: CheckFormData = {
        inspectionDate: inspection.inspection_date,
        mechanic: inspection.mechanic ?? "",
        clientName: inspection.client_name ?? "",
        carModel: inspection.car_model ?? "",
        licensePlate: inspection.license_plate ?? "",
        vin: inspection.vin ?? "",
        tires: inspection.tires,
        corrosion: inspection.corrosion,
        fluids: inspection.fluids,
        mileage: inspection.mileage,
        brakes: inspection.brakes,
        suspension: inspection.suspension,
        summary: inspection.summary ? inspection.summary.split("\n") : [],
      };

      const blob = await Promise.race([
        pdf(<CheckPDF data={formData} />).toBlob(),
        new Promise<Blob>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 30000),
        ),
      ]);

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${inspection.check_number}.pdf`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Грешка при генериране на PDF. Проверете конзолата.");
    } finally {
      setDownloadingId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    try {
      const { error } = await supabase
        .from("inspections")
        .delete()
        .eq("id", pendingDeleteId);
      if (error) throw error;
      setInspections((prev) => prev.filter((i) => i.id !== pendingDeleteId));
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClone = async (inspection: Inspection) => {
    setCloningId(inspection.id);
    try {
      const { id: _id, check_number: _cn, created_at: _ca, ...rest } = inspection;
      const { error } = await supabase
        .from("inspections")
        .insert({ ...rest, check_number: "" } as never);
      if (error) throw error;
      await fetchInspections();
    } catch (err) {
      console.error("Clone failed:", err);
    } finally {
      setCloningId(null);
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AdminHeader
        title={t("checks.title")}
        subtitle={t("checks.subtitle")}
        actions={
          <Button
            onClick={() => router.push(`${routePrefix}/create-check`)}
            className="bg-mb-blue hover:bg-mb-blue/90 text-white"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t("checks.createCheck")}
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto bg-black p-4 sm:p-6">
        <div className="mb-4 max-w-sm">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Търсене по клиент, автомобил, регистрация, VIN, №..."
            className="bg-white border-mb-border text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div className="bg-mb-anthracite border border-mb-border rounded-xl overflow-x-auto">
          <div className="grid grid-cols-[170px_160px_160px_130px_110px_1fr_44px] gap-0 bg-mb-black border-b border-mb-border px-4 py-3 text-xs font-bold text-mb-silver uppercase tracking-wide">
            <span>№ Проверка</span>
            <span>Клиент</span>
            <span>Автомобил</span>
            <span>VIN</span>
            <span>Регистрация</span>
            <span>Дата</span>
            <span />
          </div>

          {loading ? (
            <div className="px-4 py-12 text-center text-mb-silver">Зареждане...</div>
          ) : inspections.length === 0 ? (
            <div className="px-4 py-12 text-center space-y-4">
              <svg
                className="w-12 h-12 text-mb-silver/30 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <p className="text-mb-silver">Няма намерени проверки</p>
              <Button
                onClick={() => router.push(`${routePrefix}/create-check`)}
                className="bg-mb-blue hover:bg-mb-blue/90 text-white"
              >
                {t("checks.createCheck")}
              </Button>
            </div>
          ) : (
            inspections.map((inspection, i) => (
              <div
                key={inspection.id}
                className={`grid grid-cols-[170px_160px_160px_130px_110px_1fr_44px] gap-0 items-center px-4 py-3 border-b border-mb-border last:border-b-0 transition-colors ${i % 2 === 1 ? "bg-mb-black/20" : ""}`}
              >
                <span
                  onClick={() =>
                    router.push(`${routePrefix}/checks/edit?id=${inspection.id}`)
                  }
                  className="text-mb-blue font-mono text-sm font-medium whitespace-nowrap pr-3 cursor-pointer hover:underline"
                >
                  {inspection.check_number}
                </span>
                <span className="text-white text-sm truncate pr-3">
                  {inspection.client_name || "—"}
                </span>
                <span className="text-mb-silver text-sm truncate pr-3">
                  {inspection.car_model || "—"}
                </span>
                <span className="text-mb-silver text-sm truncate pr-3 font-mono uppercase">
                  {inspection.vin || "—"}
                </span>
                <span className="text-mb-silver text-sm truncate pr-3">
                  {inspection.license_plate || "—"}
                </span>
                <span className="text-mb-silver text-sm whitespace-nowrap">
                  {formatDate(inspection.inspection_date)}
                </span>
                <div className="flex justify-end">
                  <ActionsDropdown
                    onDownload={() => handleDownload(inspection)}
                    onDelete={() => openDeleteDialog(inspection.id)}
                    onClone={() => handleClone(inspection)}
                    downloading={downloadingId === inspection.id}
                    deleting={deletingId === inspection.id}
                    cloning={cloningId === inspection.id}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-mb-silver/50">
            {totalCount > 0
              ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, totalCount)} от ${totalCount} проверки`
              : "0 проверки"}
          </p>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="border-mb-border text-mb-silver"
              >
                Предишна
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="border-mb-border text-mb-silver"
              >
                Следваща
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setPendingDeleteId(null);
        }}
      >
        <DialogContent className="bg-mb-anthracite border-mb-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{t("checks.deleteConfirm.title")}</DialogTitle>
            <DialogDescription className="text-mb-silver">
              {t("checks.deleteConfirm.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPendingDeleteId(null);
              }}
              className="border-mb-border"
            >
              {t("checks.deleteConfirm.cancel")}
            </Button>
            <Button
              onClick={() => void confirmDelete()}
              disabled={deletingId !== null}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deletingId !== null
                ? t("checks.deleteConfirm.deleting")
                : t("checks.deleteConfirm.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
