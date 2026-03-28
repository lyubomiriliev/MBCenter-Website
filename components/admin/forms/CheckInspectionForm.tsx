"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckPDF,
  type CheckFormData,
  type CheckItem,
  type TireData,
} from "@/components/pdf/CheckPDF";
import { supabase } from "@/lib/supabase/client";

const STORAGE_KEY = "mbcenter_check_draft";

interface InspectionRow {
  check_number: string | null;
  inspection_date: string;
  mechanic: string | null;
  client_name: string | null;
  car_model: string | null;
  license_plate: string | null;
  vin: string | null;
  tires: CheckFormData["tires"] | null;
  corrosion: CheckFormData["corrosion"] | null;
  fluids: CheckFormData["fluids"] | null;
  mileage: CheckFormData["mileage"] | null;
  glass: CheckFormData["glass"] | null;
  summary: string | null;
}

interface CheckInspectionFormProps {
  inspectionId?: string;
}

/* ------------------------------------------------------------------ */
/*  Default data                                                       */
/* ------------------------------------------------------------------ */

const defaultTire = (): TireData => ({
  brand: "",
  dot: "",
  tread: "",
  condition: "",
  note: "",
});

const defaultFormData = (): CheckFormData => ({
  inspectionDate: new Date().toISOString().slice(0, 10),
  mechanic: "",
  clientName: "",
  carModel: "",
  licensePlate: "",
  vin: "",
  // Tires
  tires: {
    frontLeft: defaultTire(),
    frontRight: defaultTire(),
    rearLeft: defaultTire(),
    rearRight: defaultTire(),
  },
  // Corrosion
  corrosion: [
    { label: "Шаси и под автомобила", value: "", note: "" },
    { label: "Прагове и Вежди (Калници)", value: "", note: "" },
    { label: "Изпускателна система (Гърнета)", value: "", note: "" },
  ],
  // Fluids
  fluids: [
    { label: "Моторно масло (Ниво и вид)", value: "", note: "" },
    { label: "Антифриз (Охладителна течност)", value: "", note: "" },
    { label: "Спирачна течност", value: "", note: "" },
    { label: "Видими течове по двигателя/кутията", value: "", note: "" },
  ],
  // Mileage
  mileage: {
    odometer: "",
    assessment: "",
    note: "",
  },
  // Glass
  glass: [
    { label: "Челно стъкло (Предно)", value: "", note: "" },
    { label: "Странични и задно стъкла", value: "", note: "" },
    { label: "Външни огледала (Механизъм/Прибиране)", value: "", note: "" },
  ],
  // Summary
  summary: "",
});

/* ------------------------------------------------------------------ */
/*  Radio option definitions per section                               */
/* ------------------------------------------------------------------ */

const corrosionOptions = [
  ["none", "Няма / Заводски вид"],
  ["surface", "Повърхностна ръжда"],
  ["deep", "Дълбока корозия / Изгнило"],
];

const fluidOptions: Record<string, string[][]> = {
  "Моторно масло (Ниво и вид)": [
    ["ok", "В норма / Бистро"],
    ["low", "Под минимума"],
    ["dirty", "Черно / Задължителна смяна"],
  ],
  "Антифриз (Охладителна течност)": [
    ["ok", "В норма"],
    ["low", "Ниско ниво / Мътен"],
    ["oil", "Масло в антифриза!"],
  ],
  "Спирачна течност": [
    ["ok", "Съдържание на влага ОК"],
    ["dirty", "За смяна (>3% влага)"],
  ],
  "Видими течове по двигателя/кутията": [
    ["none", "Напълно сух"],
    ["sweat", "Леко омасляване"],
    ["active", "Активен теч"],
  ],
};

const glassOptions: Record<string, string[][]> = {
  "Челно стъкло (Предно)": [
    ["ok", "Здраво / Оригинално"],
    ["chips", "Шупли / Драскотини"],
    ["broken", "Спукано (За смяна)"],
  ],
  "Странични и задно стъкла": [
    ["ok", "Здрави"],
    ["scratched", "Надраскани"],
    ["broken", "Счупени"],
  ],
  "Външни огледала (Механизъм/Прибиране)": [
    ["ok", "Работят коректно"],
    ["damaged", "Счупен корпус/стъкло"],
    ["broken", "Не работи прибиране/подгрев"],
  ],
};

const tireConditionOptions = [
  ["ok", "ОК"],
  ["uneven", "Неравномерно"],
  ["bad", "За смяна"],
];

const mileageOptions = [
  ["match", "Съответства (Реален)"],
  ["suspect", "Има съмнения"],
  ["manipulated", "Манипулиран!"],
];

/* ------------------------------------------------------------------ */
/*  Placeholders per section                                           */
/* ------------------------------------------------------------------ */
const corrosionPlaceholders: Record<string, string> = {
  "Шаси и под автомобила": "Опиши къде...",
  "Прагове и Вежди (Калници)": "Забележки...",
  "Изпускателна система (Гърнета)": "Забележки...",
};
const fluidPlaceholders: Record<string, string> = {
  "Моторно масло (Ниво и вид)": "Наличие на стружки/гориво?",
  "Антифриз (Охладителна течност)": "Измерени градуси на замръзване...",
  "Спирачна течност": "Забележки...",
  "Видими течове по двигателя/кутията": "Опиши: гарнитура, семеринг и т.н.",
};
const glassPlaceholders: Record<string, string> = {
  "Челно стъкло (Предно)": "Година на стъклото / Забележки...",
  "Странични и задно стъкла": "Забележки...",
  "Външни огледала (Механизъм/Прибиране)": "Забележки...",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CheckInspectionForm({
  inspectionId,
}: CheckInspectionFormProps = {}) {
  const t = useTranslations("admin.checks");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const isEditMode = !!inspectionId;
  const [form, setForm] = useState<CheckFormData>(() => {
    if (isEditMode || typeof window === "undefined") return defaultFormData();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CheckFormData) : defaultFormData();
    } catch {
      return defaultFormData();
    }
  });
  const [generating, setGenerating] = useState(false);
  const [checkNumber, setCheckNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [loadingInspection, setLoadingInspection] = useState(isEditMode);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [pendingNavUrl, setPendingNavUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const initialFormRef = useRef<string>("");
  // Track which tire fields have been manually edited by the user (not auto-filled)
  const tireManuallyEdited = useRef<Record<string, Set<string>>>({
    frontRight: new Set(),
    rearLeft: new Set(),
    rearRight: new Set(),
  });

  /* Load existing inspection in edit mode */
  const loadInspection = useCallback(async (id: string) => {
    setLoadingInspection(true);
    try {
      const { data, error } = await supabase
        .from("inspections")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      const row = data as unknown as InspectionRow;
      if (row) {
        setCheckNumber(row.check_number?.trim() || "");
        setForm({
          inspectionDate:
            row.inspection_date || new Date().toISOString().slice(0, 10),
          mechanic: row.mechanic || "",
          clientName: row.client_name || "",
          carModel: row.car_model || "",
          licensePlate: row.license_plate || "",
          vin: row.vin || "",
          tires: row.tires || defaultFormData().tires,
          corrosion: row.corrosion || defaultFormData().corrosion,
          fluids: row.fluids || defaultFormData().fluids,
          mileage: row.mileage || defaultFormData().mileage,
          glass: row.glass || defaultFormData().glass,
          summary: row.summary || "",
        });
      }
    } catch (err) {
      console.error("Failed to load inspection:", err);
    } finally {
      setLoadingInspection(false);
    }
  }, []);

  useEffect(() => {
    if (inspectionId) loadInspection(inspectionId);
  }, [inspectionId, loadInspection]);

  /* Persist to localStorage on every change (only for new inspections) */
  useEffect(() => {
    if (isEditMode) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {}
  }, [form, isEditMode]);

  /* Track unsaved changes in edit mode */
  useEffect(() => {
    if (!isEditMode || loadingInspection) return;
    if (!initialFormRef.current) {
      initialFormRef.current = JSON.stringify(form);
      return;
    }
    setHasUnsavedChanges(JSON.stringify(form) !== initialFormRef.current);
  }, [form, isEditMode, loadingInspection]);

  /* beforeunload — warn on tab close/refresh */
  useEffect(() => {
    if (!isEditMode) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isEditMode, hasUnsavedChanges]);

  /* Intercept in-app link clicks when there are unsaved changes */
  useEffect(() => {
    if (!isEditMode) return;
    const handleClick = (e: MouseEvent) => {
      if (!hasUnsavedChanges) return;
      const anchor = (e.target as HTMLElement).closest(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#" || href.startsWith("javascript")) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingNavUrl(href);
      setNavModalOpen(true);
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isEditMode, hasUnsavedChanges]);

  /* Field updaters */
  const setField = <K extends keyof CheckFormData>(
    key: K,
    val: CheckFormData[K],
  ) => setForm((p) => ({ ...p, [key]: val }));

  const updateCheckItem = (
    section: "corrosion" | "fluids" | "glass",
    idx: number,
    field: keyof CheckItem,
    val: string,
  ) =>
    setForm((p) => {
      const arr = [...p[section]];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...p, [section]: arr };
    });

  const updateTire = (
    pos: keyof CheckFormData["tires"],
    field: keyof TireData,
    val: string,
  ) => {
    // Mark non-frontLeft fields as manually edited when user types in them
    if (
      pos !== "frontLeft" &&
      (field === "brand" || field === "dot" || field === "tread")
    ) {
      tireManuallyEdited.current[pos]?.add(field);
    }

    setForm((p) => {
      const updated = {
        ...p.tires,
        [pos]: { ...p.tires[pos], [field]: val },
      };
      // Auto-fill brand, dot, tread from frontLeft to non-manually-edited tires
      if (
        pos === "frontLeft" &&
        (field === "brand" || field === "dot" || field === "tread")
      ) {
        const others: (keyof CheckFormData["tires"])[] = [
          "frontRight",
          "rearLeft",
          "rearRight",
        ];
        for (const other of others) {
          if (!tireManuallyEdited.current[other]?.has(field)) {
            updated[other] = { ...updated[other], [field]: val };
          }
        }
      }
      return { ...p, tires: updated };
    });
  };

  /* Derive checks list path from current pathname */
  const basePath = pathname.includes("/mb-admin-mechanics")
    ? pathname.split("/mb-admin-mechanics")[0] + "/mb-admin-mechanics"
    : pathname.split("/mb-admin")[0] + "/mb-admin";
  const checksPath = basePath + "/checks";

  /* Save inspection (edit mode) */
  const handleSave = async (navUrl?: string) => {
    if (!inspectionId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("inspections")
        .update({
          inspection_date: form.inspectionDate,
          mechanic: form.mechanic || null,
          client_name: form.clientName || null,
          car_model: form.carModel || null,
          license_plate: form.licensePlate || null,
          vin: form.vin || null,
          tires: form.tires,
          corrosion: form.corrosion,
          fluids: form.fluids,
          mileage: form.mileage,
          glass: form.glass,
          summary: form.summary || null,
        } as never)
        .eq("id", inspectionId);
      if (error) throw error;
      initialFormRef.current = JSON.stringify(form);
      setHasUnsavedChanges(false);
      setToast({ type: "success", message: "Проверката е запазена успешно!" });
      if (navUrl) {
        setPendingNavUrl(null);
        setNavModalOpen(false);
        router.push(navUrl);
      }
    } catch (err) {
      console.error("Save failed:", err);
      setToast({ type: "error", message: "Грешка при запазване!" });
    } finally {
      setSaving(false);
    }
  };

  /* Delete inspection */
  const handleDelete = async () => {
    if (!inspectionId) return;
    if (!confirm("Сигурни ли сте, че искате да изтриете тази проверка?"))
      return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("inspections")
        .delete()
        .eq("id", inspectionId);
      if (error) throw error;
      setToast({ type: "success", message: "Проверката е изтрита." });
      setTimeout(() => router.push(checksPath), 500);
    } catch (err) {
      console.error("Delete failed:", err);
      setToast({ type: "error", message: "Грешка при изтриване!" });
      setDeleting(false);
    }
  };

  /* Clone inspection */
  const handleClone = async () => {
    setCloning(true);
    try {
      const { data, error } = await supabase
        .from("inspections")
        .insert({
          check_number: "",
          inspection_date: form.inspectionDate,
          mechanic: form.mechanic || null,
          client_name: form.clientName || null,
          car_model: form.carModel || null,
          license_plate: form.licensePlate || null,
          vin: form.vin || null,
          tires: form.tires,
          corrosion: form.corrosion,
          fluids: form.fluids,
          mileage: form.mileage,
          glass: form.glass,
          summary: form.summary || null,
        } as never)
        .select()
        .single();
      if (error) throw error;
      const newId = (data as { id: string } | null)?.id;
      if (newId) {
        setToast({
          type: "success",
          message: "Проверката е клонирана успешно!",
        });
        setHasUnsavedChanges(false);
        router.push(`${basePath}/checks/edit?id=${newId}`);
      }
    } catch (err) {
      console.error("Clone failed:", err);
      setToast({ type: "error", message: "Грешка при клониране!" });
    } finally {
      setCloning(false);
    }
  };

  /* PDF generation → download → clear draft → redirect */
  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      let filenameBase = "";
      if (isEditMode && inspectionId) {
        filenameBase = checkNumber;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("inspections")
          .insert({
            check_number: "",
            inspection_date: form.inspectionDate,
            mechanic: form.mechanic || null,
            client_name: form.clientName || null,
            car_model: form.carModel || null,
            license_plate: form.licensePlate || null,
            vin: form.vin || null,
            tires: form.tires,
            corrosion: form.corrosion,
            fluids: form.fluids,
            mileage: form.mileage,
            glass: form.glass,
            summary: form.summary || null,
          } as never)
          .select("check_number")
          .single();
        if (insertError) throw insertError;
        filenameBase =
          (
            inserted as { check_number: string | null } | null
          )?.check_number?.trim() || "";
      }

      const { registerPDFFonts } = await import("@/lib/pdf-fonts");
      const { setFontRegistered } = await import("@/components/pdf/CheckPDF");
      const fontsReady = await registerPDFFonts();
      setFontRegistered(fontsReady);

      const blob = await Promise.race([
        pdf(<CheckPDF data={form} />).toBlob(),
        new Promise<Blob>((_, reject) =>
          setTimeout(() => reject(new Error("PDF generation timeout")), 30000),
        ),
      ]);

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filenameBase
        ? `${filenameBase}.pdf`
        : `Проверка_${form.clientName || "без_име"}_${form.inspectionDate}.pdf`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      if (isEditMode && inspectionId) {
        const { error } = await supabase
          .from("inspections")
          .update({
            inspection_date: form.inspectionDate,
            mechanic: form.mechanic || null,
            client_name: form.clientName || null,
            car_model: form.carModel || null,
            license_plate: form.licensePlate || null,
            vin: form.vin || null,
            tires: form.tires,
            corrosion: form.corrosion,
            fluids: form.fluids,
            mileage: form.mileage,
            glass: form.glass,
            summary: form.summary || null,
          } as never)
          .eq("id", inspectionId);
        if (error) console.error("Failed to update inspection:", error);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        router.push(checksPath);
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  /* Shared classes */
  const sectionHeader =
    "bg-mb-anthracite text-white px-4 py-2.5 rounded-lg text-base font-bold mt-8 mb-4";
  const radioLabel =
    "flex items-center gap-2 cursor-pointer text-sm text-gray-300 hover:text-white transition-colors";

  if (loadingInspection) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <svg
            className="animate-spin h-8 w-8 text-mb-blue mx-auto"
            viewBox="0 0 24 24"
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
          <p className="text-mb-silver">Зареждане на проверка...</p>
        </div>
      </div>
    );
  }

  const editActionsAside = isEditMode ? (
    <aside
      className="
        fixed bottom-4 left-[20px] right-[20px] z-50 flex flex-col gap-2
        rounded-xl border border-mb-border bg-mb-anthracite/95 p-2.5 shadow-xl backdrop-blur-sm
        lg:bottom-6 lg:left-auto lg:right-6 lg:w-max lg:max-w-none lg:flex-row lg:flex-wrap
        lg:items-center lg:justify-end lg:gap-3 lg:p-3
      "
    >
      <div className="flex w-full min-w-0 flex-row gap-2 lg:contents">
        <Button
          onClick={() => handleSave()}
          disabled={saving}
          className="min-w-0 flex-1 justify-center bg-emerald-600 px-2 hover:bg-emerald-700 sm:px-3 lg:w-auto lg:flex-none lg:shrink-0 lg:px-4"
        >
          {saving ? (
            <svg className="mr-2 h-4 w-4 shrink-0 animate-spin" viewBox="0 0 24 24">
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
            <svg
              className="mr-2 h-4 w-4 shrink-0"
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
          )}
          Запази
        </Button>
        <Button
          onClick={handleClone}
          disabled={cloning}
          className="min-w-0 flex-1 justify-center bg-mb-blue px-2 hover:bg-mb-blue/90 sm:px-3 lg:w-auto lg:flex-none lg:shrink-0 lg:px-4"
        >
          {cloning ? (
            <svg className="mr-2 h-4 w-4 shrink-0 animate-spin" viewBox="0 0 24 24">
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
            <svg
              className="mr-2 h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
          )}
          Клонирай
        </Button>
      </div>
      <Button
        onClick={handleDelete}
        disabled={deleting}
        className="w-full justify-center bg-red-600 px-3 hover:bg-red-700 sm:px-4 lg:w-auto lg:shrink-0"
      >
        {deleting ? (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
          <svg
            className="mr-2 h-4 w-4"
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
        )}
        Изтрий
      </Button>
    </aside>
  ) : null;

  return (
    <div
      className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 ${isEditMode ? "pb-52 lg:pb-28" : ""}`}
    >
      <div
        className={
          isEditMode
            ? "mx-auto w-full max-w-5xl"
            : "mx-auto max-w-5xl space-y-6"
        }
      >
        <div className={isEditMode ? "space-y-6" : "contents"}>
          {/* ─── Header info grid ─── */}
          <div className="bg-mb-black border border-mb-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-mb-blue"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {t("formTitle")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-mb-silver text-xs mb-1.5 block">
                  {t("inspectionDate")}
                </Label>
                <Input
                  type="date"
                  value={form.inspectionDate}
                  onChange={(e) => setField("inspectionDate", e.target.value)}
                  className="bg-mb-anthracite border-mb-border text-white [color-scheme:dark]"
                />
              </div>
              <div>
                <Label className="text-mb-silver text-xs mb-1.5 block">
                  {t("mechanic")}
                </Label>
                <Input
                  value={form.mechanic}
                  onChange={(e) => setField("mechanic", e.target.value)}
                  className="bg-mb-anthracite border-mb-border text-white"
                  placeholder=""
                />
              </div>
              <div>
                <Label className="text-mb-silver text-xs mb-1.5 block">
                  {t("clientName")}
                </Label>
                <Input
                  value={form.clientName}
                  onChange={(e) => setField("clientName", e.target.value)}
                  className="bg-mb-anthracite border-mb-border text-white"
                  placeholder=""
                />
              </div>
              <div>
                <Label className="text-mb-silver text-xs mb-1.5 block">
                  {t("carModel")}
                </Label>
                <Input
                  value={form.carModel}
                  onChange={(e) => setField("carModel", e.target.value)}
                  className="bg-mb-anthracite border-mb-border text-white"
                  placeholder="Mercedes"
                />
              </div>
              <div>
                <Label className="text-mb-silver text-xs mb-1.5 block">
                  {t("licensePlate")}
                </Label>
                <Input
                  value={form.licensePlate}
                  onChange={(e) => setField("licensePlate", e.target.value)}
                  className="bg-mb-anthracite border-mb-border text-white"
                  placeholder="СВ1234АА"
                />
              </div>
              <div>
                <Label className="text-mb-silver text-xs mb-1.5 block">
                  {t("vin")}
                </Label>
                <Input
                  value={form.vin}
                  onChange={(e) => setField("vin", e.target.value)}
                  className="bg-mb-anthracite border-mb-border text-white"
                  placeholder="WDD"
                />
              </div>
            </div>
          </div>

          {/* ─── 1. Tires ─── */}
          <div>
            <h3 className={sectionHeader}>1. {t("sections.tires")}</h3>
            <div className="bg-mb-black border border-mb-border rounded-xl overflow-hidden">
              {/* Tire header — hidden on mobile, shown on md+ */}
              <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_2fr_2fr] gap-0 bg-mb-anthracite border-b border-mb-border px-4 py-2.5 text-xs font-bold text-mb-silver uppercase tracking-wide">
                <span>Позиция</span>
                <span>Марка / Сезон</span>
                <span>ДОТ (Година)</span>
                <span>Грайфер (мм)</span>
                <span>Състояние / Износване</span>
              </div>
              {(
                [
                  ["frontLeft", "Предна Лява"],
                  ["frontRight", "Предна Дясна"],
                  ["rearLeft", "Задна Лява"],
                  ["rearRight", "Задна Дясна"],
                ] as [keyof CheckFormData["tires"], string][]
              ).map(([pos, posLabel]) => (
                <div
                  key={pos}
                  className="border-b border-mb-border last:border-b-0 px-4 py-3"
                >
                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_2fr_2fr] gap-2 items-center">
                    <span className="text-sm font-medium text-white">
                      {posLabel}
                    </span>
                    <Input
                      value={form.tires[pos].brand}
                      onChange={(e) => updateTire(pos, "brand", e.target.value)}
                      className="bg-mb-anthracite border-mb-border text-white text-xs h-8 mr-2"
                      placeholder="Michelin Л"
                    />
                    <Input
                      value={form.tires[pos].dot}
                      onChange={(e) => updateTire(pos, "dot", e.target.value)}
                      className="bg-mb-anthracite border-mb-border text-white text-xs h-8 mr-2"
                      placeholder="XXXX"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={form.tires[pos].tread}
                      onChange={(e) => updateTire(pos, "tread", e.target.value)}
                      className="bg-mb-anthracite border-mb-border text-white text-xs h-8 mr-2"
                      placeholder="мм"
                    />
                    <div className="flex flex-wrap gap-3 ml-5">
                      {tireConditionOptions.map(([val, label]) => (
                        <label key={val} className={radioLabel}>
                          <input
                            type="radio"
                            name={`tire_${pos}`}
                            value={val}
                            checked={form.tires[pos].condition === val}
                            onChange={() => updateTire(pos, "condition", val)}
                            className="accent-mb-blue w-3.5 h-3.5"
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="flex flex-col gap-3 md:hidden">
                    <span className="text-sm font-semibold text-white bg-mb-anthracite -mx-4 px-4 py-1.5 -mt-3">
                      {posLabel}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-mb-silver mb-1 block">
                          Марка / Сезон
                        </span>
                        <Input
                          value={form.tires[pos].brand}
                          onChange={(e) =>
                            updateTire(pos, "brand", e.target.value)
                          }
                          className="bg-mb-anthracite border-mb-border text-white text-xs h-8"
                          placeholder="Michelin Лятна"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-mb-silver mb-1 block">
                          ДОТ (Година)
                        </span>
                        <Input
                          value={form.tires[pos].dot}
                          onChange={(e) =>
                            updateTire(pos, "dot", e.target.value)
                          }
                          className="bg-mb-anthracite border-mb-border text-white text-xs h-8"
                          placeholder="4222"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-mb-silver mb-1 block">
                        Грайфер (мм)
                      </span>
                      <Input
                        type="number"
                        step="0.1"
                        value={form.tires[pos].tread}
                        onChange={(e) =>
                          updateTire(pos, "tread", e.target.value)
                        }
                        className="bg-mb-anthracite border-mb-border text-white text-xs h-8 w-full"
                        placeholder="мм"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-mb-silver mb-1 block">
                        Състояние / Износване
                      </span>
                      <div className="flex flex-col gap-2">
                        {tireConditionOptions.map(([val, label]) => (
                          <label key={val} className={radioLabel}>
                            <input
                              type="radio"
                              name={`tire_${pos}`}
                              value={val}
                              checked={form.tires[pos].condition === val}
                              onChange={() => updateTire(pos, "condition", val)}
                              className="accent-mb-blue w-3.5 h-3.5"
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── 2. Corrosion ─── */}
          <div>
            <h3 className={sectionHeader}>2. {t("sections.corrosion")}</h3>
            <div className="bg-mb-black border border-mb-border rounded-xl divide-y divide-mb-border">
              {form.corrosion.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[2fr_3fr_2fr] items-center gap-4 px-4 py-3.5"
                >
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {corrosionOptions.map(([val, label]) => (
                      <label key={val} className={radioLabel}>
                        <input
                          type="radio"
                          name={`corrosion_${i}`}
                          value={val}
                          checked={item.value === val}
                          onChange={() =>
                            updateCheckItem("corrosion", i, "value", val)
                          }
                          className={`w-3.5 h-3.5 ${val === "deep" ? "accent-red-500" : "accent-mb-blue"}`}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  <Input
                    value={item.note}
                    onChange={(e) =>
                      updateCheckItem("corrosion", i, "note", e.target.value)
                    }
                    className="bg-mb-anthracite border-mb-border text-white text-xs h-8"
                    placeholder={
                      corrosionPlaceholders[item.label] || "Забележки"
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ─── 3. Fluids ─── */}
          <div>
            <h3 className={sectionHeader}>3. {t("sections.fluids")}</h3>
            <div className="bg-mb-black border border-mb-border rounded-xl divide-y divide-mb-border">
              {form.fluids.map((item, i) => {
                const opts = fluidOptions[item.label] || [];
                return (
                  <div
                    key={i}
                    className="grid grid-cols-[2fr_3fr_2fr] items-center gap-4 px-4 py-3.5"
                  >
                    <span className="text-sm font-medium text-white">
                      {item.label}
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {opts.map(([val, label]) => (
                        <label key={val} className={radioLabel}>
                          <input
                            type="radio"
                            name={`fluid_${i}`}
                            value={val}
                            checked={item.value === val}
                            onChange={() =>
                              updateCheckItem("fluids", i, "value", val)
                            }
                            className={`w-3.5 h-3.5 ${val === "oil" || val === "active" ? "accent-red-500" : "accent-mb-blue"}`}
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                    <Input
                      value={item.note}
                      onChange={(e) =>
                        updateCheckItem("fluids", i, "note", e.target.value)
                      }
                      className="bg-mb-anthracite border-mb-border text-white text-xs h-8"
                      placeholder={
                        fluidPlaceholders[item.label] || "Забележки..."
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── 4. Mileage ─── */}
          <div>
            <h3 className={sectionHeader}>4. {t("sections.mileage")}</h3>
            <div className="bg-mb-black border border-mb-border rounded-xl divide-y divide-mb-border">
              <div className="grid grid-cols-[2fr_3fr_2fr] items-center gap-4 px-4 py-3.5">
                <span className="text-sm font-medium text-white">
                  Показание на километраж
                </span>
                <Input
                  type="number"
                  value={form.mileage.odometer}
                  onChange={(e) =>
                    setField("mileage", {
                      ...form.mileage,
                      odometer: e.target.value,
                    })
                  }
                  className="bg-mb-anthracite border-mb-border text-white text-sm h-9"
                  placeholder="Въведи километри по табло..."
                />
                <div />
              </div>
              <div className="grid grid-cols-[2fr_3fr_2fr] items-center gap-4 px-4 py-3.5">
                <div>
                  <span className="text-sm font-medium text-white block">
                    Оценка на реален пробег
                  </span>
                  <span className="text-xs text-mb-silver">
                    (След компютърна диагностика и визуален оглед)
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {mileageOptions.map(([val, label]) => (
                    <label key={val} className={radioLabel}>
                      <input
                        type="radio"
                        name="mileage_assessment"
                        value={val}
                        checked={form.mileage.assessment === val}
                        onChange={() =>
                          setField("mileage", {
                            ...form.mileage,
                            assessment: val,
                          })
                        }
                        className={`w-3.5 h-3.5 ${val === "manipulated" ? "accent-red-500" : "accent-mb-blue"}`}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                <Input
                  value={form.mileage.note}
                  onChange={(e) =>
                    setField("mileage", {
                      ...form.mileage,
                      note: e.target.value,
                    })
                  }
                  className="bg-mb-anthracite border-mb-border text-white text-xs h-8"
                  placeholder="Запаметени км в модули / коментар..."
                />
              </div>
            </div>
          </div>

          {/* ─── 5. Glass ─── */}
          <div>
            <h3 className={sectionHeader}>5. {t("sections.glass")}</h3>
            <div className="bg-mb-black border border-mb-border rounded-xl divide-y divide-mb-border">
              {form.glass.map((item, i) => {
                const opts = glassOptions[item.label] || [];
                return (
                  <div
                    key={i}
                    className="grid grid-cols-[2fr_3fr_2fr] items-center gap-4 px-4 py-3.5"
                  >
                    <span className="text-sm font-medium text-white">
                      {item.label}
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {opts.map(([val, label]) => (
                        <label key={val} className={radioLabel}>
                          <input
                            type="radio"
                            name={`glass_${i}`}
                            value={val}
                            checked={item.value === val}
                            onChange={() =>
                              updateCheckItem("glass", i, "value", val)
                            }
                            className="accent-mb-blue w-3.5 h-3.5"
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                    <Input
                      value={item.note}
                      onChange={(e) =>
                        updateCheckItem("glass", i, "note", e.target.value)
                      }
                      className="bg-mb-anthracite border-mb-border text-white text-xs h-8"
                      placeholder={
                        glassPlaceholders[item.label] || "Забележки..."
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Summary ─── */}
          <div>
            <h3 className={sectionHeader}>{t("sections.summary")}</h3>
            <div className="bg-mb-black border border-mb-border rounded-xl p-4">
              <Textarea
                value={form.summary}
                onChange={(e) => setField("summary", e.target.value)}
                rows={6}
                className="bg-mb-anthracite border-mb-border text-white resize-y"
                placeholder="Опишете други открити проблеми, грешки от диагностиката и спешни препоръки..."
              />
            </div>
          </div>

          {/* ─── Generate PDF button ─── */}
          <Button
            onClick={handleGeneratePDF}
            disabled={generating}
            className="w-full py-6 text-lg font-bold bg-mb-blue hover:bg-mb-blue/90 text-white rounded-xl"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t("generating")}
              </span>
            ) : (
              <span className="flex items-center gap-2">
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {t("generatePdf")}
              </span>
            )}
          </Button>
        </div>
      </div>
      {editActionsAside}

      {/* Toast notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Unsaved changes navigation guard modal */}
      <Dialog
        open={navModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPendingNavUrl(null);
            setNavModalOpen(false);
          }
        }}
      >
        <DialogContent className="bg-mb-anthracite border-mb-border">
          <DialogHeader>
            <DialogTitle className="text-white">
              {locale === "bg" ? "Незапазени промени" : "Unsaved changes"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-300 text-sm py-2">
            {locale === "bg"
              ? "Имате незапазени промени. Искате ли да ги запазите преди да напуснете?"
              : "You have unsaved changes. Do you want to save them before leaving?"}
          </p>
          <DialogFooter className="flex gap-2 flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setHasUnsavedChanges(false);
                const url = pendingNavUrl!;
                setPendingNavUrl(null);
                setNavModalOpen(false);
                router.push(url);
              }}
              className="border-mb-border text-mb-anthracite hover:text-mb-silver hover:bg-mb-black/40"
            >
              {locale === "bg" ? "Откажи промените" : "Discard changes"}
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => handleSave(pendingNavUrl!)}
              className="bg-mb-blue hover:bg-mb-blue/90"
            >
              {saving
                ? locale === "bg"
                  ? "Запазване..."
                  : "Saving..."
                : locale === "bg"
                  ? "Запази и напусни"
                  : "Save and leave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
