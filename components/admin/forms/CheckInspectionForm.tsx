"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Toast } from "@/components/ui/toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckPDF, type CheckFormData } from "@/components/pdf/CheckPDF";
import { MERCEDES_MODELS, searchModels } from "@/lib/data/mercedes-models";
import { supabase } from "@/lib/supabase/client";

const STORAGE_KEY = "mbcenter_check_draft_v2";

interface InspectionRow {
  check_number: string | null;
  inspection_date: string;
  mechanic: string | null;
  client_name: string | null;
  client_phone: string | null;
  car_model: string | null;
  car_model_detail: string | null;
  license_plate: string | null;
  vin: string | null;
  tires: CheckFormData["tires"] | null;
  corrosion: CheckFormData["corrosion"] | null;
  fluids: CheckFormData["fluids"] | null;
  mileage: CheckFormData["mileage"] | null;
  brakes: CheckFormData["brakes"] | null;
  suspension: CheckFormData["suspension"] | null;
  summary: string | null;
}

interface CheckInspectionFormProps {
  inspectionId?: string;
}

/* ------------------------------------------------------------------ */
/*  Default data                                                       */
/* ------------------------------------------------------------------ */

const defaultFormData = (): CheckFormData => ({
  inspectionDate: new Date().toISOString().slice(0, 10),
  mechanic: "",
  clientName: "",
  clientPhone: "",
  carModel: "",
  carModelDetail: "",
  licensePlate: "",
  vin: "",
  mileage: {
    odometer: "",
    assessment: "",
    note: "",
    mileageUnit: "km" as const,
  },
  tires: { tread_condition: "", mixed_tires: false },
  brakes: { front_pads: "", front_discs: "", rear_pads: "", rear_discs: "" },
  suspension: {
    front_suspension: "",
    front_suspension_note: "",
    rear_suspension: "",
    rear_suspension_note: "",
    shocks_springs: "",
    steering: "",
    steering_note: "",
  },
  corrosion: { chassis: "", sills: "", exhaust: "" },
  fluids: {
    engine_oil: "",
    coolant: "",
    brake_fluid: "",
    leaks: "",
    leaks_note: "",
  },
  summary: [],
});

/* ------------------------------------------------------------------ */
/*  Form Component                                                     */
/* ------------------------------------------------------------------ */

export function CheckInspectionForm({
  inspectionId,
}: CheckInspectionFormProps = {}) {
  const t = useTranslations("admin.checks");
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
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const initialFormRef = useRef<string>("");

  const [mechanicsList, setMechanicsList] = useState<
    { id: string; name: string }[]
  >([]);

  // Model selector state
  const [carModelOpen, setCarModelOpen] = useState(false);
  const [carModelSearch, setCarModelSearch] = useState("");

  const filteredMercedesModels = useMemo(() => {
    if (!carModelSearch) return MERCEDES_MODELS.slice(0, 50);
    return searchModels(carModelSearch);
  }, [carModelSearch]);

  const groupedMercedesModels = useMemo(() => {
    const groups: Record<string, typeof MERCEDES_MODELS> = {};
    filteredMercedesModels.forEach((model) => {
      if (!groups[model.class]) groups[model.class] = [];
      groups[model.class].push(model);
    });
    return groups;
  }, [filteredMercedesModels]);

  // Navigation guard state
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [pendingNavUrl, setPendingNavUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("mechanics")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (data)
          setMechanicsList((data as any[]).filter((m) => m.name !== "50:50"));
      });
  }, []);

  /* Load existing inspection in edit mode */
  useEffect(() => {
    if (!inspectionId) return;
    const loadInspection = async () => {
      setLoadingInspection(true);
      try {
        const { data, error } = await supabase
          .from("inspections")
          .select("*")
          .eq("id", inspectionId)
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
            clientPhone: row.client_phone || "",
            carModel: row.car_model || "",
            carModelDetail: row.car_model_detail || "",
            licensePlate: row.license_plate || "",
            vin: row.vin || "",
            tires: row.tires || defaultFormData().tires,
            brakes: row.brakes || defaultFormData().brakes,
            suspension: row.suspension || defaultFormData().suspension,
            corrosion: row.corrosion || defaultFormData().corrosion,
            fluids: row.fluids || defaultFormData().fluids,
            mileage: row.mileage || defaultFormData().mileage,
            summary: row.summary ? row.summary.split("\n") : [],
          });
        }
      } catch (err) {
        console.error("Failed to load inspection:", err);
      } finally {
        setLoadingInspection(false);
      }
    };
    loadInspection();
  }, [inspectionId]);

  /* Persist to localStorage */
  useEffect(() => {
    if (isEditMode) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {}
  }, [form, isEditMode]);

  useEffect(() => {
    if (!isEditMode || loadingInspection) return;
    if (!initialFormRef.current) {
      initialFormRef.current = JSON.stringify(form);
      return;
    }
    setHasUnsavedChanges(JSON.stringify(form) !== initialFormRef.current);
  }, [form, isEditMode, loadingInspection]);

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

  // Intercept in-app link clicks when there are unsaved changes
  useEffect(() => {
    const handleCaptureClick = (e: MouseEvent) => {
      if (!isEditMode || !hasUnsavedChanges) return;

      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;
      if (href.startsWith("http") && !href.includes(window.location.host)) {
        return; // External URL
      }

      if (href === window.location.pathname + window.location.search) {
        return; // Current URL
      }

      e.preventDefault();
      e.stopPropagation();
      setPendingNavUrl(href);
      setNavModalOpen(true);
    };

    document.addEventListener("click", handleCaptureClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleCaptureClick, {
        capture: true,
      });
    };
  }, [isEditMode, hasUnsavedChanges]);

  /* Field updaters */
  const setField = <K extends keyof CheckFormData>(
    key: K,
    val: CheckFormData[K],
  ) => setForm((p) => ({ ...p, [key]: val }));

  const updateSubField = <K extends keyof CheckFormData>(
    section: K,
    field: string,
    val: any,
  ) => {
    setForm((p) => ({
      ...p,
      [section]: { ...(p[section] as any), [field]: val },
    }));
  };

  const basePath = pathname.includes("/mb-admin-mechanics")
    ? pathname.split("/mb-admin-mechanics")[0] + "/mb-admin-mechanics"
    : pathname.split("/mb-admin")[0] + "/mb-admin";
  const checksPath = basePath + "/checks";

  /* Save inspection */
  const handleSave = async (navUrl?: string) => {
    if (!inspectionId) return;
    setSaving(true);
    try {
      const { error } = await (supabase.from("inspections") as any)
        .update({
          inspection_date: form.inspectionDate,
          mechanic: form.mechanic || null,
          client_name: form.clientName || null,
          client_phone: form.clientPhone || null,
          car_model: form.carModel || null,
          car_model_detail: form.carModelDetail || null,
          license_plate: form.licensePlate || null,
          vin: form.vin || null,
          tires: form.tires,
          brakes: form.brakes,
          suspension: form.suspension,
          corrosion: form.corrosion,
          fluids: form.fluids,
          mileage: form.mileage,
          summary: form.summary.length > 0 ? form.summary.join("\n") : null,
        })
        .eq("id", inspectionId);
      if (error) throw error;
      initialFormRef.current = JSON.stringify(form);
      setHasUnsavedChanges(false);
      setToast({ type: "success", message: "Проверката е запазена успешно!" });

      if (navUrl) {
        setNavModalOpen(false);
        setPendingNavUrl(null);
        router.push(navUrl);
      }
    } catch (err) {
      setToast({ type: "error", message: "Грешка при запазване!" });
    } finally {
      // Small timeout to prevent momentary flashes if router.push blocks UI
      setTimeout(() => setSaving(false), 300);
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
      setToast({ type: "error", message: "Грешка при изтриване!" });
      setDeleting(false);
    }
  };

  /* Clone inspection */
  const handleClone = async () => {
    setCloning(true);
    try {
      const { data, error } = await (supabase.from("inspections") as any)
        .insert({
          check_number: "",
          inspection_date: form.inspectionDate,
          mechanic: form.mechanic || null,
          client_name: form.clientName || null,
          client_phone: form.clientPhone || null,
          car_model: form.carModel || null,
          car_model_detail: form.carModelDetail || null,
          license_plate: form.licensePlate || null,
          vin: form.vin || null,
          tires: form.tires,
          brakes: form.brakes,
          suspension: form.suspension,
          corrosion: form.corrosion,
          fluids: form.fluids,
          mileage: form.mileage,
          summary: form.summary.length > 0 ? form.summary.join("\n") : null,
        })
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
      setToast({ type: "error", message: "Грешка при клониране!" });
    } finally {
      setCloning(false);
    }
  };

  /* Create new inspection (no PDF download) */
  const handleCreate = async () => {
    setGenerating(true);
    try {
      const { error: insertError } = await (
        supabase.from("inspections") as any
      ).insert({
        check_number: "",
        inspection_date: form.inspectionDate,
        mechanic: form.mechanic || null,
        client_name: form.clientName || null,
        client_phone: form.clientPhone || null,
        car_model: form.carModel || null,
        car_model_detail: form.carModelDetail || null,
        license_plate: form.licensePlate || null,
        vin: form.vin || null,
        tires: form.tires,
        brakes: form.brakes,
        suspension: form.suspension,
        corrosion: form.corrosion,
        fluids: form.fluids,
        mileage: form.mileage,
        summary: form.summary.length > 0 ? form.summary.join("\n") : null,
      });
      if (insertError) throw insertError;
      localStorage.removeItem(STORAGE_KEY);
      router.push(checksPath);
    } catch (err) {
      console.error("Create inspection failed:", err);
      setToast({ type: "error", message: "Грешка при запазване! Данните не са изгубени." });
    } finally {
      setGenerating(false);
    }
  };

  /* PDF generation */
  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      let filenameBase = checkNumber;
      if (!isEditMode || !inspectionId) {
        const { data: inserted, error: insertError } = await (
          supabase.from("inspections") as any
        )
          .insert({
            check_number: "",
            inspection_date: form.inspectionDate,
            mechanic: form.mechanic || null,
            client_name: form.clientName || null,
            client_phone: form.clientPhone || null,
            car_model: form.carModel || null,
            car_model_detail: form.carModelDetail || null,
            license_plate: form.licensePlate || null,
            vin: form.vin || null,
            tires: form.tires,
            brakes: form.brakes,
            suspension: form.suspension,
            corrosion: form.corrosion,
            fluids: form.fluids,
            mileage: form.mileage,
            summary: form.summary.length > 0 ? form.summary.join("\n") : null,
          })
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

      const blob = await pdf(
        <CheckPDF data={form} checkNumber={filenameBase || undefined} />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filenameBase
        ? `protocol-${filenameBase}.pdf`
        : `protocol-${form.inspectionDate}.pdf`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      if (isEditMode && inspectionId) {
        await handleSave();
      } else {
        localStorage.removeItem(STORAGE_KEY);
        router.push(checksPath);
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      setToast({ type: "error", message: "Грешка при генериране! Данните не са изгубени." });
    } finally {
      setGenerating(false);
    }
  };

  /* Shared UI components */
  const sectionHeader =
    "bg-mb-anthracite text-white px-4 py-2.5 rounded-lg text-base font-bold mt-8 mb-4";
  const rowClass =
    "flex flex-col md:flex-row md:items-center py-4 border-b border-mb-border gap-4";
  const labelClass = "md:w-[260px] text-sm font-semibold text-white shrink-0";
  const radioGroupClass = "flex flex-wrap items-center gap-x-6 gap-y-3 flex-1";

  const recommendations = form.summary || [];

  const updateRecommendation = (idx: number, val: string) => {
    const newRecs = [...recommendations];
    newRecs[idx] = val;
    setField("summary", newRecs);
  };

  const addRecommendation = () => {
    if (recommendations.length < 50) {
      setField("summary", [...recommendations, ""]);
    }
  };

  const removeRecommendation = (idx: number) => {
    const newRecs = recommendations.filter((_, i) => i !== idx);
    setField("summary", newRecs);
  };

  const RadioOption = ({
    section,
    field,
    value,
    label,
  }: {
    section: keyof CheckFormData;
    field: string;
    value: string;
    label: string;
  }) => (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 hover:text-white transition-colors">
      <input
        type="radio"
        checked={(form[section] as any)[field] === value}
        onChange={() => updateSubField(section, field as any, value)}
        className="w-4 h-4 text-mb-blue bg-mb-black border-mb-border focus:ring-mb-blue rounded-full"
      />
      {label}
    </label>
  );

  if (loadingInspection) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 text-white">
        Зареждане на проверка...
      </div>
    );
  }

  return (
    <div
      className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 ${isEditMode ? "pb-52 lg:pb-28" : ""}`}
    >
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header info */}
        <div className="bg-mb-black border border-mb-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-5">
            ПРОТОКОЛ ЗА ТЕХНИЧЕСКО СЪСТОЯНИЕ
            {checkNumber ? (
              <span className="ml-3 text-mb-blue">№{checkNumber}</span>
            ) : null}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-mb-silver text-xs mb-1.5 block">
                ДАТА:
              </Label>
              <Input
                type="date"
                value={form.inspectionDate}
                onChange={(e) => setField("inspectionDate", e.target.value)}
                className="h-10 bg-mb-anthracite border-mb-border text-white [color-scheme:dark]"
              />
            </div>
            <div>
              <Label className="text-mb-silver text-xs mb-1.5 block">
                ИМЕ НА КЛИЕНТ:
              </Label>
              <Input
                value={form.clientName}
                onChange={(e) => setField("clientName", e.target.value)}
                className="h-10 bg-mb-anthracite border-mb-border text-white"
              />
            </div>
            <div>
              <Label className="text-mb-silver text-xs mb-1.5 block">
                ТЕЛЕФОН:
              </Label>
              <Input
                type="tel"
                value={form.clientPhone}
                onChange={(e) => setField("clientPhone", e.target.value)}
                className="h-10 bg-mb-anthracite border-mb-border text-white"
              />
            </div>
            {/* Модел — Mercedes popover */}
            <div>
              <Label className="text-mb-silver text-xs mb-1.5 block">
                МОДЕЛ:
              </Label>
              <Popover open={carModelOpen} onOpenChange={setCarModelOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-10 rounded-md border border-mb-border bg-mb-anthracite px-3 py-2 text-sm text-left flex items-center justify-between text-white focus:outline-none focus:ring-1 focus:ring-mb-blue"
                  >
                    <span
                      className={
                        form.carModel ? "text-white" : "text-mb-silver/50"
                      }
                    >
                      {form.carModel || "Изберете модел Mercedes..."}
                    </span>
                    <svg
                      className="h-4 w-4 shrink-0 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                      />
                    </svg>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[360px] p-0 bg-mb-anthracite border-mb-border"
                  align="start"
                >
                  <Command className="bg-mb-anthracite text-white [&_[cmdk-input-wrapper]]:border-mb-border">
                    <CommandInput
                      placeholder="Търсене на модели..."
                      value={carModelSearch}
                      onValueChange={setCarModelSearch}
                      className="border-mb-border bg-mb-black text-white placeholder:text-mb-silver/50"
                    />
                    <CommandList className="max-h-[280px]">
                      <CommandEmpty className="text-mb-silver">
                        Няма намерени модели
                      </CommandEmpty>
                      {Object.entries(groupedMercedesModels).map(
                        ([className, models]) => (
                          <CommandGroup
                            key={className}
                            heading={className}
                            className="[&_[cmdk-group-heading]]:text-mb-silver"
                          >
                            {models.map((model) => (
                              <CommandItem
                                key={model.id}
                                value={model.name}
                                onSelect={() => {
                                  setField("carModel", model.name);
                                  setCarModelOpen(false);
                                  setCarModelSearch("");
                                }}
                                className="cursor-pointer text-white data-[selected=true]:bg-mb-black data-[selected=true]:text-white"
                              >
                                <span>{model.name}</span>
                                <span className="ml-auto text-xs text-mb-silver">
                                  {model.years[0]}-
                                  {model.years[model.years.length - 1]}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ),
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {/* Точен модел — free text */}
            <div>
              <Label className="text-mb-silver text-xs mb-1.5 block">
                ТОЧЕН МОДЕЛ:
              </Label>
              <Input
                value={form.carModelDetail}
                onChange={(e) => setField("carModelDetail", e.target.value)}
                placeholder="напр. CLA 220d 4MATIC"
                className="h-10 bg-mb-anthracite border-mb-border text-white placeholder:text-mb-silver/50"
              />
            </div>
            <div>
              <Label className="text-mb-silver text-xs mb-1.5 block">
                РЕГИСТРАЦИОНЕН НОМЕР:
              </Label>
              <Input
                value={form.licensePlate}
                onChange={(e) => setField("licensePlate", e.target.value.toUpperCase())}
                className="h-10 bg-mb-anthracite border-mb-border text-white uppercase"
              />
            </div>
            <div>
              <Label className="text-mb-silver text-xs mb-1.5 block">
                VIN (РАМА):
              </Label>
              <Input
                value={form.vin}
                onChange={(e) => setField("vin", e.target.value.toUpperCase())}
                className="h-10 bg-mb-anthracite border-mb-border text-white uppercase"
              />
            </div>
            <div>
              <Label className="text-mb-silver text-xs mb-1.5 block">
                МЕХАНИК:
              </Label>
              <Select
                value={form.mechanic}
                onValueChange={(val) => setField("mechanic", val)}
              >
                <SelectTrigger className="bg-mb-anthracite border-mb-border text-white h-10">
                  <SelectValue placeholder="Изберете механик..." />
                </SelectTrigger>
                <SelectContent className="bg-mb-anthracite border-mb-border">
                  {mechanicsList.map((m) => (
                    <SelectItem
                      key={m.id}
                      value={m.name}
                      className="text-white hover:bg-mb-black cursor-pointer"
                    >
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-mb-black border border-mb-border rounded-xl p-6">
          {/* 1. ПРОБЕГ */}
          <h3 className={sectionHeader}>1. ПРОБЕГ НА АВТОМОБИЛА</h3>
          <div className={rowClass}>
            <div className={labelClass}>Показание на километраж:</div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="напр. 150000"
                className="w-48 bg-mb-anthracite border-mb-border text-white"
                value={form.mileage.odometer}
                onChange={(e) =>
                  updateSubField("mileage", "odometer", e.target.value)
                }
              />
              <div className="flex rounded-md overflow-hidden border border-mb-border text-sm">
                <button
                  type="button"
                  onClick={() => updateSubField("mileage", "mileageUnit", "km")}
                  className={`px-3 py-1.5 font-medium transition-colors ${(form.mileage.mileageUnit ?? "km") === "km" ? "bg-mb-blue text-white" : "bg-mb-anthracite text-gray-400 hover:text-white"}`}
                >
                  км
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSubField("mileage", "mileageUnit", "miles")
                  }
                  className={`px-3 py-1.5 font-medium transition-colors ${form.mileage.mileageUnit === "miles" ? "bg-mb-blue text-white" : "bg-mb-anthracite text-gray-400 hover:text-white"}`}
                >
                  мили
                </button>
              </div>
            </div>
          </div>
          <div className={rowClass}>
            <div className={labelClass}>Оценка на реален пробег:</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="mileage"
                field="assessment"
                value="match"
                label="Съответства"
              />
              <RadioOption
                section="mileage"
                field="assessment"
                value="manipulated"
                label="Има съмнения / Манипулиран"
              />
              <Input
                className="w-full md:max-w-xs bg-mb-anthracite border-mb-border text-white"
                placeholder="Бележка..."
                value={form.mileage.note}
                onChange={(e) =>
                  updateSubField("mileage", "note", e.target.value)
                }
              />
            </div>
          </div>

          {/* 2. ГУМИ */}
          <h3 className={sectionHeader}>2. СЪСТОЯНИЕ НА ГУМИТЕ</h3>
          <div className={rowClass}>
            <div className={labelClass}>Общо състояние грайфер:</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="tires"
                field="tread_condition"
                value="good"
                label="Добро"
              />
              <RadioOption
                section="tires"
                field="tread_condition"
                value="worn"
                label="Захабени"
              />
              <RadioOption
                section="tires"
                field="tread_condition"
                value="replace"
                label="За смяна"
              />
            </div>
          </div>
          <div className={rowClass}>
            <div className={labelClass}>Различни гуми:</div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={form.tires.mixed_tires}
                onChange={(e) =>
                  updateSubField("tires", "mixed_tires", e.target.checked)
                }
                className="w-4 h-4 text-mb-blue bg-mb-black border-mb-border focus:ring-mb-blue rounded"
              />
              Наличие на различни гуми (марка/шарка)
            </label>
          </div>

          {/* 3. СПИРАЧНА СИСТЕМА */}
          <h3 className={sectionHeader}>3. СПИРАЧНА СИСТЕМА</h3>
          <div className={rowClass}>
            <div className={labelClass}>Предни накладки:</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="brakes"
                field="front_pads"
                value="good"
                label="Добри"
              />
              <RadioOption
                section="brakes"
                field="front_pads"
                value="worn"
                label="Износени"
              />
              <RadioOption
                section="brakes"
                field="front_pads"
                value="replace"
                label="За смяна"
              />
            </div>
          </div>
          <div className={rowClass}>
            <div className={labelClass}>Предни дискове:</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="brakes"
                field="front_discs"
                value="good"
                label="Добри"
              />
              <RadioOption
                section="brakes"
                field="front_discs"
                value="lipped"
                label="Имат ръб / Криви"
              />
              <RadioOption
                section="brakes"
                field="front_discs"
                value="below_min"
                label="Под минимум"
              />
            </div>
          </div>
          <div className={rowClass}>
            <div className={labelClass}>Задни накладки:</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="brakes"
                field="rear_pads"
                value="good"
                label="Добри"
              />
              <RadioOption
                section="brakes"
                field="rear_pads"
                value="worn"
                label="Износени"
              />
              <RadioOption
                section="brakes"
                field="rear_pads"
                value="replace"
                label="За смяна"
              />
            </div>
          </div>
          <div className={rowClass}>
            <div className={labelClass}>Задни дискове:</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="brakes"
                field="rear_discs"
                value="good"
                label="Добри"
              />
              <RadioOption
                section="brakes"
                field="rear_discs"
                value="lipped"
                label="Имат ръб / Криви"
              />
              <RadioOption
                section="brakes"
                field="rear_discs"
                value="below_min"
                label="Под минимум"
              />
            </div>
          </div>

          {/* 4. ОКАЧВАНЕ */}
          <h3 className={sectionHeader}>4. ОКАЧВАНЕ И ХОДОВА ЧАСТ</h3>
          <div className={rowClass}>
            <div className={labelClass}>
              Предно окачване (Носачи/Тампони/Шарнири):
            </div>
            <div className={radioGroupClass}>
              <RadioOption
                section="suspension"
                field="front_suspension"
                value="good"
                label="Здраво"
              />
              <RadioOption
                section="suspension"
                field="front_suspension"
                value="play"
                label="Има луфт / Напукани"
              />
              <RadioOption
                section="suspension"
                field="front_suspension"
                value="repair"
                label="За ремонт"
              />
              <Input
                className="w-full md:max-w-xs bg-mb-anthracite border-mb-border text-white"
                placeholder="Бележка..."
                value={form.suspension.front_suspension_note}
                onChange={(e) =>
                  updateSubField(
                    "suspension",
                    "front_suspension_note",
                    e.target.value,
                  )
                }
              />
            </div>
          </div>
          <div className={rowClass}>
            <div className={labelClass}>Задно окачване (Носачи/Тампони):</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="suspension"
                field="rear_suspension"
                value="good"
                label="Здраво"
              />
              <RadioOption
                section="suspension"
                field="rear_suspension"
                value="play"
                label="Има луфт / Напукани"
              />
              <RadioOption
                section="suspension"
                field="rear_suspension"
                value="repair"
                label="За ремонт"
              />
              <Input
                className="w-full md:max-w-xs bg-mb-anthracite border-mb-border text-white"
                placeholder="Бележка..."
                value={form.suspension.rear_suspension_note}
                onChange={(e) =>
                  updateSubField(
                    "suspension",
                    "rear_suspension_note",
                    e.target.value,
                  )
                }
              />
            </div>
          </div>
          <div className={rowClass}>
            <div className={labelClass}>Амортисьори и пружини:</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="suspension"
                field="shocks_springs"
                value="good"
                label="Изправни"
              />
              <RadioOption
                section="suspension"
                field="shocks_springs"
                value="leaking"
                label="Омаслени"
              />
              <RadioOption
                section="suspension"
                field="shocks_springs"
                value="broken"
                label="Счупена пружина"
              />
            </div>
          </div>
          <div className={rowClass}>
            <div className={labelClass}>Кормилна система:</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="suspension"
                field="steering"
                value="good"
                label="Изправна"
              />
              <RadioOption
                section="suspension"
                field="steering"
                value="leak_play"
                label="Теч / Луфт"
              />
              <Input
                className="w-full md:max-w-xs bg-mb-anthracite border-mb-border text-white"
                placeholder="Бележка..."
                value={form.suspension.steering_note}
                onChange={(e) =>
                  updateSubField("suspension", "steering_note", e.target.value)
                }
              />
            </div>
          </div>

          {/* 5. КОРОЗИЯ */}
          <h3 className={sectionHeader}>5. КОРОЗИЯ И КУПЕ (РЪЖДА)</h3>
          <div className={rowClass}>
            <div className={labelClass}>Шаси и под автомобила:</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="corrosion"
                field="chassis"
                value="none"
                label="Няма"
              />
              <RadioOption
                section="corrosion"
                field="chassis"
                value="surface"
                label="Повърхностна"
              />
              <RadioOption
                section="corrosion"
                field="chassis"
                value="deep"
                label="Дълбока / Изгнило"
              />
            </div>
          </div>
          <div className={rowClass}>
            <div className={labelClass}>Прагове и вежди:</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="corrosion"
                field="sills"
                value="good"
                label="Здрави"
              />
              <RadioOption
                section="corrosion"
                field="sills"
                value="starting"
                label="Започваща ръжда"
              />
              <RadioOption
                section="corrosion"
                field="sills"
                value="rusted"
                label="Изгнили"
              />
            </div>
          </div>
          <div className={rowClass}>
            <div className={labelClass}>Изпускателна система (Гърнета):</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="corrosion"
                field="exhaust"
                value="good"
                label="Здрава"
              />
              <RadioOption
                section="corrosion"
                field="exhaust"
                value="rusted"
                label="Ръждясала"
              />
              <RadioOption
                section="corrosion"
                field="exhaust"
                value="holes"
                label="Пробита / Заварки"
              />
            </div>
          </div>

          {/* 6. ТЕЧНОСТИ */}
          <h3 className={sectionHeader}>6. ТЕЧНОСТИ И ТЕЧОВЕ</h3>
          <div className={rowClass}>
            <div className={labelClass}>Моторно масло:</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="fluids"
                field="engine_oil"
                value="ok"
                label="В норма"
              />
              <RadioOption
                section="fluids"
                field="engine_oil"
                value="low"
                label="Ниско ниво"
              />
              <RadioOption
                section="fluids"
                field="engine_oil"
                value="replace"
                label="За смяна"
              />
            </div>
          </div>
          <div className={rowClass}>
            <div className={labelClass}>Антифриз (Охладителна течност):</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="fluids"
                field="coolant"
                value="ok"
                label="В норма"
              />
              <RadioOption
                section="fluids"
                field="coolant"
                value="low"
                label="Ниско ниво"
              />
              <RadioOption
                section="fluids"
                field="coolant"
                value="replace"
                label="За смяна / Мътен"
              />
            </div>
          </div>
          <div className={rowClass}>
            <div className={labelClass}>Спирачна течност:</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="fluids"
                field="brake_fluid"
                value="ok"
                label="В норма"
              />
              <RadioOption
                section="fluids"
                field="brake_fluid"
                value="replace"
                label="За смяна (>3% влага)"
              />
            </div>
          </div>
          <div className={rowClass}>
            <div className={labelClass}>Видими течове двигател / кутия:</div>
            <div className={radioGroupClass}>
              <RadioOption
                section="fluids"
                field="leaks"
                value="none"
                label="Няма (Сух)"
              />
              <RadioOption
                section="fluids"
                field="leaks"
                value="sweat"
                label="Леко омасляване"
              />
              <RadioOption
                section="fluids"
                field="leaks"
                value="active"
                label="Активен теч"
              />
              <Input
                className="w-full md:max-w-xs bg-mb-anthracite border-mb-border text-white"
                placeholder="Бележка..."
                value={form.fluids.leaks_note}
                onChange={(e) =>
                  updateSubField("fluids", "leaks_note", e.target.value)
                }
              />
            </div>
          </div>

          {/* ПРЕПОРЪКИ */}
          <div className="flex items-center justify-between mt-8 mb-4 bg-mb-anthracite px-4 py-2.5 rounded-lg">
            <h3 className="text-white text-base font-bold">
              ПРЕПОРЪКИ ОТ МЕХАНИКА
            </h3>
            {recommendations.length < 50 && (
              <Button
                onClick={addRecommendation}
                variant="outline"
                size="sm"
                className="h-8 border-mb-border text-xs text-white bg-mb-black hover:bg-mb-blue hover:border-mb-blue transition-colors"
              >
                + Добави препоръка
              </Button>
            )}
          </div>

          {recommendations.length === 0 ? (
            <div className="text-mb-silver text-sm italic px-4 py-4 border border-dashed border-mb-border rounded-lg text-center">
              Няма добавени препоръки (Тази секция ще бъде скрита в PDF-а)
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-mb-silver font-bold text-sm min-w-[20px]">
                    {idx + 1}.
                  </span>
                  <Input
                    value={rec}
                    onChange={(e) => updateRecommendation(idx, e.target.value)}
                    placeholder={`Препоръка ${idx + 1}...`}
                    className="flex-1 bg-mb-anthracite border-mb-border text-white"
                  />
                  <Button
                    onClick={() => removeRecommendation(idx)}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-red-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button
            onClick={isEditMode ? handleGeneratePDF : handleCreate}
            disabled={generating}
            className="flex-1 bg-mb-blue hover:bg-mb-blue/90 h-12 text-base font-bold text-white shadow-xl shadow-mb-blue/20"
          >
            {generating
              ? "Създаване..."
              : isEditMode
                ? "Изтегли PDF и Запази"
                : "Създай Проверка"}
          </Button>
          {!isEditMode && (
            <Button
              onClick={() => setForm(defaultFormData())}
              variant="outline"
              className="h-12 border-mb-border text-mb-silver hover:text-white hover:bg-mb-anthracite"
            >
              Изчисти
            </Button>
          )}
        </div>

        {isEditMode && (
          <aside className="fixed bottom-4 left-[20px] right-[20px] z-50 flex flex-col gap-2 rounded-xl border border-mb-border bg-mb-anthracite/95 p-2.5 shadow-xl backdrop-blur-sm lg:bottom-6 lg:left-auto lg:right-6 lg:w-max lg:max-w-none lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:gap-3 lg:p-3">
            <div className="flex w-full min-w-0 flex-row gap-2 lg:contents">
              <Button
                onClick={() => handleSave()}
                disabled={saving || !hasUnsavedChanges}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Запази
              </Button>
              <Button
                onClick={handleClone}
                disabled={cloning}
                className="flex-1 bg-mb-blue hover:bg-mb-blue/90"
              >
                Клонирай
              </Button>
            </div>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full justify-center bg-red-600"
            >
              Изтрий
            </Button>
          </aside>
        )}
      </div>

      <Dialog open={navModalOpen} onOpenChange={setNavModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-mb-anthracite border border-mb-border rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Незапазени промени</DialogTitle>
          </DialogHeader>
          <p className="text-gray-300 text-sm py-2">
            Имате незапазени промени. Искате ли да ги запазите преди да
            напуснете?
          </p>
          <DialogFooter className="flex gap-2 flex-col sm:flex-row mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const url = pendingNavUrl!;
                setPendingNavUrl(null);
                setNavModalOpen(false);
                router.push(url);
              }}
              className="border-mb-border bg-mb-anthracite text-white hover:text-mb-silver hover:bg-mb-black"
            >
              Откажи промените
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => handleSave(pendingNavUrl!)}
              className="bg-mb-blue hover:bg-mb-blue/90 text-white"
            >
              {saving ? "Запазване..." : "Запази и напусни"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
