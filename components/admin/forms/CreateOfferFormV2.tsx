"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { pdf } from "@react-pdf/renderer";
import { ClientSelector } from "./ClientSelector";
import { CarSelector } from "./CarSelector";
import { PartsFieldArray } from "./PartsFieldArray";
import { ServiceActionsFieldArray } from "./ServiceActionsFieldArray";
import { CreatedBySelector } from "./CreatedBySelector";
import { FloatingSummary } from "./FloatingSummary";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { useNotification } from "@/hooks/useNotification";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  offerFormSchema,
  defaultOfferFormValues,
  type OfferFormData,
} from "@/lib/schemas/offer";
import { parseTimeToHours } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { OfferPDFv3 } from "@/components/pdf/OfferPDFv3";
import { ServiceCardPDFv3 } from "@/components/pdf/ServiceCardPDFv3";
import { useOffer, useUpdateOffer } from "@/hooks/useOffers";
import type {
  OfferWithRelations,
  Profile,
  InsertOffer,
  InsertOfferItem,
  InsertServiceAction,
  Offer,
  UpdateOffer,
} from "@/types/database";

interface CreateOfferFormV2Props {
  offerId?: string;
  isMechanicView?: boolean;
}

const AUTOSAVE_KEY = "mbcenter_offer_draft";
const AUTOSAVE_DEBOUNCE_MS = 3000;

export function CreateOfferFormV2({
  offerId,
  isMechanicView = false,
}: CreateOfferFormV2Props) {
  const t = useTranslations("admin.form");
  const locale = useLocale() as "bg" | "en";
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [offerPdfGenerating, setOfferPdfGenerating] = useState(false);
  const [serviceCardGenerating, setServiceCardGenerating] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [savedOffer, setSavedOffer] = useState<OfferWithRelations | null>(null);
  const [isLoadingOffer, setIsLoadingOffer] = useState(false);
  const [prepayments, setPrepayments] = useState<number[]>([]);
  const [prepaymentModalOpen, setPrepaymentModalOpen] = useState(false);
  const [prepaymentAmount, setPrepaymentAmount] = useState("");
  const [prepaymentError, setPrepaymentError] = useState("");
  const [performedBySelection, setPerformedBySelection] = useState("");
  const [performedBySaving, setPerformedBySaving] = useState(false);
  const [notesFromServiceInput, setNotesFromServiceInput] = useState("");
  const [notesFromServiceSaving, setNotesFromServiceSaving] = useState(false);

  const updateOfferMutation = useUpdateOffer();

  const { notifications, dismiss, showError, showSuccess } = useNotification();

  const isEditing = !!offerId;
  const {
    data: existingOffer,
    isLoading: offerLoading,
    refetch: refetchOffer,
  } = useOffer(offerId);

  const methods = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema) as any,
    defaultValues: defaultOfferFormValues,
  });

  const {
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
  } = methods;

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const localSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSaveRef = useRef<string | null>(null);
  const formLoadedRef = useRef(false);
  const changedAfterLastCardRef = useRef(true);
  const prepaymentsRef = useRef(prepayments);

  useEffect(() => {
    prepaymentsRef.current = prepayments;
  }, [prepayments]);

  useEffect(() => {
    if (savedOffer) setPerformedBySelection(savedOffer.performed_by ?? "");
  }, [savedOffer?.id, savedOffer?.performed_by]);

  useEffect(() => {
    if (savedOffer) setNotesFromServiceInput(savedOffer.notes ?? "");
  }, [savedOffer?.id, savedOffer?.notes]);

  // Load existing offer data into form when editing
  useEffect(() => {
    if (!existingOffer || !isEditing) return;
    setSavedOffer(existingOffer);
    // Only reset the form on initial load — never on subsequent refetches
    // (refetches happen after autosave; resetting would wipe in-progress typing)
    if (formLoadedRef.current) return;
    const savedPrepayments = (
      existingOffer as { prepayments_eur?: number[] | null }
    ).prepayments_eur;
    if (Array.isArray(savedPrepayments) && savedPrepayments.length > 0) {
      setPrepayments(savedPrepayments);
    }

    const yearFallback = existingOffer.created_at
      ? new Date(existingOffer.created_at).getFullYear()
      : new Date().getFullYear();

    const formData: Partial<OfferFormData> = {
      customerName: existingOffer.customer_name ?? "",
      customerPhone: existingOffer.customer_phone ?? "",
      clientEmail:
        existingOffer.customer_email ?? existingOffer.client?.email ?? "",
      clientId: existingOffer.client_id ?? undefined,

      carModel: existingOffer.car_model_text ?? "",
      carModelDetail: existingOffer.car_model_detail ?? "",
      repairName: existingOffer.repair_name ?? "",
      carYear:
        existingOffer.car_year ?? existingOffer.car?.year ?? yearFallback,
      vinText: existingOffer.vin_text ?? "",
      carLicensePlate:
        existingOffer.license_plate ?? existingOffer.car?.license_plate ?? "",
      carMileage: existingOffer.mileage ?? existingOffer.car?.mileage ?? 0,
      carMileageUnit: (existingOffer.mileage_unit as "km" | "miles") ?? "km",
      carId: existingOffer.car_id ?? undefined,

      createdByName: existingOffer.created_by_name ?? "",

      discountPercent: existingOffer.discount_percent ?? 0,
      discountPartsPercent: existingOffer.discount_parts_percent ?? 0,
      discountServicesPercent: existingOffer.discount_services_percent ?? 0,
      notes: existingOffer.notes ?? "",
      notesInternal: existingOffer.notes_internal ?? "",
      notesService: existingOffer.notes_service ?? "",

      parts: (existingOffer.items ?? [])
        .filter((item) => item.type === "part")
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item) => ({
          type: "part" as const,
          description: item.description,
          brand: item.brand ?? "",
          partNumber: item.part_number ?? "",
          unitPrice: item.unit_price,
          quantity: item.quantity,
        })),

      serviceActions: (existingOffer.service_actions ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((action) => ({
          actionName: action.action_name,
          timeRequired: action.time_required_text ?? "",
          pricePerHour: action.price_per_hour_eur_net,
          isFixedPrice: action.is_fixed_price ?? false,
          fixedPriceAmount: action.fixed_price_amount ?? undefined,
        })),
    };

    methods.reset({
      ...defaultOfferFormValues,
      ...formData,
    } as OfferFormData);
    const name = existingOffer.created_by_name ?? "";
    if (name) {
      setTimeout(() => {
        methods.setValue("createdByName", name, { shouldValidate: true });
      }, 0);
    }
    formLoadedRef.current = true;
    const loadedPrepayments = (
      existingOffer as { prepayments_eur?: number[] | null }
    ).prepayments_eur;
    const initialPrepayments = Array.isArray(loadedPrepayments)
      ? loadedPrepayments
      : [];
    lastAutoSaveRef.current = JSON.stringify({
      form: methods.getValues(),
      prepayments: initialPrepayments,
    });
  }, [existingOffer, isEditing, methods]);

  // Stable save function — reads values at save time via getValues(), no watch() subscription.
  // Using useCallback means this reference is stable and won't cause effect re-runs.
  const saveOffer = useCallback(async () => {
    if (!formLoadedRef.current || !offerId) return;
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(async () => {
      autoSaveTimeoutRef.current = null;
      const isValid = await trigger();
      if (!isValid) return;

      const data = getValues();
      const currentPrepayments = prepaymentsRef.current;
      const currentSnapshot = JSON.stringify({ form: data, prepayments: currentPrepayments });
      if (lastAutoSaveRef.current === currentSnapshot) return;

      try {
        let partsTotal = 0;
        data.parts.forEach((p) => {
          partsTotal += (p.unitPrice || 0) * (p.quantity || 1);
        });
        let serviceTotal = 0;
        data.serviceActions.forEach((action) => {
          if (action.isFixedPrice && action.fixedPriceAmount) {
            serviceTotal += action.fixedPriceAmount;
          } else {
            const hours = parseTimeToHours(action.timeRequired || "0");
            serviceTotal += hours * (action.pricePerHour || 0);
          }
        });
        const subtotal = partsTotal + serviceTotal;
        const discount = subtotal * ((data.discountPercent || 0) / 100);
        const netTotal = subtotal - discount;
        const vat = netTotal * 0.2;
        const grossTotal = netTotal + vat;

        const updateData: UpdateOffer = {
          customer_name: data.customerName,
          customer_phone: data.customerPhone || null,
          customer_email: data.clientEmail || null,
          car_model_text: data.carModel,
          car_model_detail: data.carModelDetail || null,
          repair_name: data.repairName || null,
          vin_text: data.vinText || null,
          license_plate: data.carLicensePlate || null,
          mileage: data.carMileage ?? null,
          mileage_unit: data.carMileageUnit || "km",
          car_year: data.carYear ?? null,
          created_by_name: data.createdByName,
          total_net: netTotal,
          total_vat: vat,
          total_gross: grossTotal,
          discount_percent: data.discountPercent || 0,
          discount_parts_percent: data.discountPartsPercent || 0,
          discount_services_percent: data.discountServicesPercent || 0,
          notes: data.notes || null,
          notes_internal: data.notesInternal || null,
          notes_service: data.notesService || null,
          prepayments_eur: currentPrepayments.length > 0 ? currentPrepayments : null,
        };

        const offerRes = await supabase
          .from("offers")
          .update(updateData as never)
          .eq("id", offerId)
          .select()
          .single();

        if (offerRes.error) throw new Error(offerRes.error.message);

        await Promise.all([
          supabase.from("offer_items").delete().eq("offer_id", offerId),
          supabase.from("service_actions").delete().eq("offer_id", offerId),
        ]);

        const partsInserts = data.parts.map((part, i) => ({
          offer_id: offerId,
          type: "part" as const,
          description: part.description,
          brand: part.brand || null,
          part_number: part.partNumber || null,
          unit_price: part.unitPrice,
          quantity: part.quantity,
          total: part.unitPrice * part.quantity,
          sort_order: i,
        }));
        const serviceInserts = data.serviceActions.map((action, i) => {
          const isFixed = action.isFixedPrice ?? false;
          const hours = isFixed
            ? 0
            : parseTimeToHours(action.timeRequired || "0");
          const total = isFixed
            ? action.fixedPriceAmount || 0
            : hours * action.pricePerHour;
          return {
            offer_id: offerId,
            action_name: action.actionName,
            time_required_text: action.timeRequired || null,
            price_per_hour_eur_net: action.pricePerHour,
            total_eur_net: total,
            is_fixed_price: isFixed,
            fixed_price_amount: isFixed ? action.fixedPriceAmount || null : null,
            sort_order: i,
          };
        });

        if (partsInserts.length > 0) {
          await supabase.from("offer_items").insert(partsInserts as never);
        }
        if (serviceInserts.length > 0) {
          await supabase.from("service_actions").insert(serviceInserts as never);
        }

        lastAutoSaveRef.current = currentSnapshot;
        changedAfterLastCardRef.current = true;
        // Invalidate queries — React Query will refetch in the background.
        // existingOffer updating will call setSavedOffer via the load useEffect.
        // Do NOT call refetchOffer() here — it was causing form resets during typing.
        queryClient.invalidateQueries({ queryKey: ["offers"] });
        queryClient.invalidateQueries({ queryKey: ["offer", offerId] });
        showSuccess(t("saved"));
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [offerId, trigger, getValues, queryClient, showSuccess, t]);

  // Subscribe to form changes for server autosave.
  // methods.watch(callback) fires the callback without causing a re-render —
  // unlike watch() which returns a value and forces a re-render on every keystroke.
  useEffect(() => {
    if (!isEditing) return;
    const subscription = methods.watch(saveOffer);
    return () => {
      subscription.unsubscribe();
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [isEditing, methods, saveOffer]);

  // Trigger autosave when prepayments change (not covered by form subscription)
  useEffect(() => {
    if (!isEditing) return;
    saveOffer();
  }, [prepayments, isEditing, saveOffer]);

  // Load from localStorage on mount (only for new offers)
  useEffect(() => {
    if (isEditing) return;

    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const savedTime = new Date(data.timestamp);
        const hoursSince =
          (Date.now() - savedTime.getTime()) / (1000 * 60 * 60);

        if (hoursSince < 24 && data.formData) {
          methods.reset(data.formData);
          if (data.prepayments) setPrepayments(data.prepayments);
          // Explicitly set createdByName if it exists
          if (data.formData.createdByName) {
            setTimeout(() => {
              methods.setValue("createdByName", data.formData.createdByName);
            }, 100);
          }
        } else {
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    } catch (err) {
      console.error("Error loading draft:", err);
      localStorage.removeItem(AUTOSAVE_KEY);
    }
  }, [isEditing, methods]);

  // Subscription-based localStorage autosave for new (unsaved) offers.
  // No individual watch() calls needed — no re-renders per keystroke.
  useEffect(() => {
    if (isEditing) return;
    const subscription = methods.watch(() => {
      if (localSaveTimeoutRef.current) clearTimeout(localSaveTimeoutRef.current);
      localSaveTimeoutRef.current = setTimeout(() => {
        const formData = methods.getValues();
        try {
          localStorage.setItem(
            AUTOSAVE_KEY,
            JSON.stringify({
              formData,
              prepayments: prepaymentsRef.current,
              timestamp: new Date().toISOString(),
            }),
          );
        } catch (err) {
          console.error("Error saving draft:", err);
        }
      }, 1000);
    });
    return () => {
      subscription.unsubscribe();
      if (localSaveTimeoutRef.current) clearTimeout(localSaveTimeoutRef.current);
    };
  }, [isEditing, methods]);

  const fetchOfferWithRelations = async (
    id: string,
  ): Promise<OfferWithRelations | null> => {
    const { data, error } = await supabase
      .from("offers")
      .select(
        `
          *,
          items:offer_items(*),
          service_actions(*)
        `,
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error refreshing offer with relations:", error);
      return null;
    }

    return data as OfferWithRelations;
  };

  const generateOfferPDF = async (offerData: OfferWithRelations) => {
    setOfferPdfGenerating(true);
    try {
      console.log("Generating PDF for offer:", offerData.offer_number);

      // Register fonts before generating PDF
      const { registerPDFFonts } = await import("@/lib/pdf-fonts");
      const { setFontRegistered } = await import("@/components/pdf/OfferPDFv3");
      const fontsReady = await registerPDFFonts();
      setFontRegistered(fontsReady);

      if (!fontsReady) {
        console.warn("Fonts not loaded, PDF will use Helvetica fallback");
      }

      const PDFComponent = (
        <OfferPDFv3
          offer={offerData}
          locale={locale}
          prepayments={prepayments}
        />
      );

      const blob = await Promise.race([
        pdf(PDFComponent).toBlob(),
        new Promise<Blob>((_, reject) =>
          setTimeout(() => reject(new Error("PDF generation timeout")), 30000),
        ),
      ]);

      console.log("PDF generated successfully, size:", blob.size);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `offer-${offerData.offer_number}.pdf`;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      // Clean up after a delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      if (offerData.id && offerData.id !== "temp") {
        await supabase
          .from("offers")
          .update({ status: "sent" } as never)
          .eq("id", offerData.id);
        const refreshedOffer = await fetchOfferWithRelations(offerData.id);
        if (refreshedOffer) setSavedOffer(refreshedOffer);
      }

      console.log("PDF download triggered");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showError(t("errors.pdfFailed"));
      throw error;
    } finally {
      setOfferPdfGenerating(false);
    }
  };

  const generateServiceCardPDF = async () => {
    const formValues = methods.getValues();
    if (
      !savedOffer &&
      formValues.parts.length === 0 &&
      formValues.serviceActions.length === 0
    ) {
      showError(t("errors.noItemsForServiceCard"));
      return;
    }

    setServiceCardGenerating(true);
    try {
      const offerData: OfferWithRelations = savedOffer || {
        id: "temp",
        offer_number: "",
        customer_name: formValues.customerName,
        customer_phone: formValues.customerPhone || null,
        customer_email: formValues.clientEmail || null,
        car_model_text: formValues.carModel,
        car_model_detail: formValues.carModelDetail || null,
        repair_name: formValues.repairName || null,
        vin_text: formValues.vinText || null,
        license_plate: formValues.carLicensePlate || null,
        mileage: formValues.carMileage ?? null,
        mileage_unit: formValues.carMileageUnit || "km",
        car_year: formValues.carYear ?? null,
        created_by_name: formValues.createdByName,
        status: "draft",
        total_net: 0,
        total_vat: 0,
        total_gross: 0,
        discount_percent: formValues.discountPercent || 0,
        discount_parts_percent: formValues.discountPartsPercent || 0,
        discount_services_percent: formValues.discountServicesPercent || 0,
        currency: "EUR",
        notes: formValues.notes || null,
        notes_internal: formValues.notesInternal || null,
        notes_service: formValues.notesService || null,
        service_card_number: null,
        service_card_generated_at: null,
        performed_by: null,
        prepayments_eur: prepayments.length > 0 ? prepayments : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client_id: null,
        car_id: null,
        created_by: null,
        items: formValues.parts.map((part, index) => ({
          id: `part-${index}`,
          offer_id: "temp",
          type: "part" as const,
          description: part.description,
          brand: part.brand || null,
          part_number: part.partNumber || null,
          unit_price: part.unitPrice,
          quantity: part.quantity,
          total: part.unitPrice * part.quantity,
          sort_order: index,
        })),
        service_actions: formValues.serviceActions.map((action, index) => {
            const isFixed = action.isFixedPrice ?? false;
            const hours = isFixed
              ? 0
              : parseTimeToHours(action.timeRequired || "0");
            const total = isFixed
              ? action.fixedPriceAmount || 0
              : hours * action.pricePerHour;
            return {
              id: `action-${index}`,
              offer_id: "temp",
              action_name: action.actionName,
              time_required_text: action.timeRequired || null,
              price_per_hour_eur_net: action.pricePerHour,
              total_eur_net: total,
              is_fixed_price: isFixed,
              fixed_price_amount: isFixed
                ? action.fixedPriceAmount || null
                : null,
              sort_order: index,
              created_at: new Date().toISOString(),
            };
          }),
      };

      // Register fonts before generating PDF
      const { registerPDFFonts } = await import("@/lib/pdf-fonts");
      const { setFontRegistered } =
        await import("@/components/pdf/ServiceCardPDFv3");
      const fontsReady = await registerPDFFonts();
      setFontRegistered(fontsReady);

      if (!fontsReady) {
        console.warn("Fonts not loaded, PDF will use Helvetica fallback");
      }

      const PDFComponent = (
        <ServiceCardPDFv3
          offer={offerData}
          locale={locale}
          prepayments={prepayments}
        />
      );
      const blob = await pdf(PDFComponent).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = savedOffer
        ? `service-card-${savedOffer.offer_number}.pdf`
        : "service-card-draft.pdf";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      // Auto-set status to "finished" and save/update service card generation metadata
      if (savedOffer && savedOffer.id !== "temp") {
        const updateData: any = {
          status: "finished",
          service_card_number:
            savedOffer.service_card_number || savedOffer.offer_number,
          ...(changedAfterLastCardRef.current && {
            service_card_generated_at: new Date().toISOString(),
          }),
        };
        changedAfterLastCardRef.current = false;

        await supabase
          .from("offers")
          .update(updateData as never)
          .eq("id", savedOffer.id);

        const refreshedOffer = await fetchOfferWithRelations(savedOffer.id);
        if (refreshedOffer) setSavedOffer(refreshedOffer);
      }
    } catch (error) {
      console.error("Error generating service card PDF:", error);
      showError(t("errors.serviceCardFailed"));
    } finally {
      setServiceCardGenerating(false);
    }
  };

  const cloneCurrentOffer = async () => {
    if (!savedOffer) return;
    setIsCloning(true);
    try {
      const { data: newOfferNumber, error: numError } = await supabase.rpc(
        "generate_offer_number",
      );
      if (numError || !newOfferNumber)
        throw new Error("Failed to generate offer number");

      const { data: newOffer, error: insertError } = await supabase
        .from("offers")
        .insert({
          offer_number: newOfferNumber,
          customer_name: savedOffer.customer_name,
          customer_phone: savedOffer.customer_phone,
          customer_email: savedOffer.customer_email,
          car_model_text: savedOffer.car_model_text,
          car_model_detail: savedOffer.car_model_detail,
          repair_name: savedOffer.repair_name,
          vin_text: savedOffer.vin_text,
          license_plate: savedOffer.license_plate,
          mileage: savedOffer.mileage,
          mileage_unit: savedOffer.mileage_unit,
          car_year: savedOffer.car_year,
          created_by_name: savedOffer.created_by_name,
          created_by: savedOffer.created_by,
          status: "draft",
          total_net: savedOffer.total_net,
          total_vat: savedOffer.total_vat,
          total_gross: savedOffer.total_gross,
          discount_percent: savedOffer.discount_percent,
          discount_parts_percent: savedOffer.discount_parts_percent,
          discount_services_percent: savedOffer.discount_services_percent,
          currency: savedOffer.currency || "EUR",
          notes: savedOffer.notes,
          notes_internal: savedOffer.notes_internal,
          notes_service: savedOffer.notes_service,
          prepayments_eur: savedOffer.prepayments_eur,
        } as never)
        .select()
        .single();

      if (insertError || !newOffer) throw new Error("Failed to create clone");

      if (savedOffer.items && savedOffer.items.length > 0) {
        await supabase.from("offer_items").insert(
          savedOffer.items.map((item, i) => ({
            offer_id: (newOffer as any).id,
            type: item.type,
            description: item.description,
            brand: item.brand,
            part_number: item.part_number,
            unit_price: item.unit_price,
            quantity: item.quantity,
            total: item.total,
            sort_order: i,
          })) as never,
        );
      }

      if (savedOffer.service_actions && savedOffer.service_actions.length > 0) {
        await supabase.from("service_actions").insert(
          savedOffer.service_actions.map((action, i) => ({
            offer_id: (newOffer as any).id,
            action_name: action.action_name,
            time_required_text: action.time_required_text,
            price_per_hour_eur_net: action.price_per_hour_eur_net,
            total_eur_net: action.total_eur_net,
            is_fixed_price: action.is_fixed_price,
            fixed_price_amount: action.fixed_price_amount,
            sort_order: i,
          })) as never,
        );
      }

      const basePath = pathname.includes("/mb-admin")
        ? pathname.split("/mb-admin")[0] + "/mb-admin"
        : pathname.split("/mb-admin-mechanics")[0] + "/mb-admin-mechanics";
      router.push(`${basePath}/offers/${(newOffer as any).id}`);
    } catch (error) {
      console.error("Error cloning offer:", error);
      showError(
        locale === "bg"
          ? "Грешка при клониране на офертата"
          : "Error cloning offer",
      );
    } finally {
      setIsCloning(false);
    }
  };

  const onSubmit = async (data: OfferFormData) => {
    console.log("=== FORM SUBMIT CALLED ===");
    console.log("Mode:", isEditing ? "UPDATE" : "CREATE");
    console.log("Form data:", data);
    console.log("Form errors:", errors);
    console.log("Parts count:", data.parts?.length || 0);
    console.log("Service actions count:", data.serviceActions?.length || 0);

    setIsSaving(true);

    // Add timeout to prevent infinite hanging
    const timeoutId = setTimeout(() => {
      console.error("Form submission timeout after 30 seconds");
      showError(t("errors.saveFailed"));
      setIsSaving(false);
    }, 30000);

    try {
      // Calculate totals first (needed for both create and update)
      let partsTotal = 0;
      data.parts.forEach((part) => {
        partsTotal += (part.unitPrice || 0) * (part.quantity || 1);
      });

      let serviceTotal = 0;
      data.serviceActions.forEach((action) => {
        const hours = parseTimeToHours(action.timeRequired || "0");
        serviceTotal += hours * (action.pricePerHour || 0);
      });

      const subtotal = partsTotal + serviceTotal;
      const discount = subtotal * ((data.discountPercent || 0) / 100);
      const netTotal = subtotal - discount;
      const vat = netTotal * 0.2; // 20% VAT
      const grossTotal = netTotal + vat;

      let offer: Offer;

      if (isEditing && offerId) {
        // UPDATE existing offer
        console.log("Updating existing offer:", offerId);

        const updateData: UpdateOffer = {
          customer_name: data.customerName,
          customer_phone: data.customerPhone || null,
          customer_email: data.clientEmail || null,
          car_model_text: data.carModel,
          car_model_detail: data.carModelDetail || null,
          repair_name: data.repairName || null,
          vin_text: data.vinText || null,
          license_plate: data.carLicensePlate || null,
          mileage: data.carMileage ?? null,
          mileage_unit: data.carMileageUnit || "km",
          car_year: data.carYear ?? null,
          created_by_name: data.createdByName,
          total_net: netTotal,
          total_vat: vat,
          total_gross: grossTotal,
          discount_percent: data.discountPercent || 0,
          discount_parts_percent: data.discountPartsPercent || 0,
          discount_services_percent: data.discountServicesPercent || 0,
          notes: data.notes || null,
          notes_internal: data.notesInternal || null,
          notes_service: data.notesService || null,
          prepayments_eur: prepayments.length > 0 ? prepayments : null,
        };

        const offerRes = await supabase
          .from("offers")
          .update(updateData as never)
          .eq("id", offerId)
          .select()
          .single();

        if (offerRes.error)
          throw new Error(`Failed to update offer: ${offerRes.error.message}`);
        offer = offerRes.data as Offer;

        // Delete existing items and service actions in parallel
        await Promise.all([
          supabase.from("offer_items").delete().eq("offer_id", offerId),
          supabase.from("service_actions").delete().eq("offer_id", offerId),
        ]);
      } else {
        // CREATE new offer
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Try to get profile from cache first
        const cachedProfile = queryClient.getQueryData(["profile", user.id]) as
          | Pick<Profile, "id">
          | undefined;

        let profile: Pick<Profile, "id"> | null;
        if (cachedProfile?.id) {
          profile = cachedProfile;
        } else {
          const profileRes = await supabase
            .from("profiles")
            .select("id")
            .eq("auth_id", user.id)
            .single();

          profile = profileRes.data as Pick<Profile, "id"> | null;
          if (!profile) throw new Error("Profile not found");
        }

        // Generate offer number
        console.log("Calling generate_offer_number RPC...");
        let offerNumber: string;

        try {
          const { data: rpcResult, error: offerNumberError } =
            await supabase.rpc("generate_offer_number");

          console.log("Offer number RPC result:", {
            rpcResult,
            offerNumberError,
          });

          if (offerNumberError) {
            console.error("RPC error details:", offerNumberError);

            if (
              offerNumberError.message?.includes("function") ||
              offerNumberError.code === "42883"
            ) {
              throw new Error(
                "Функцията за генериране на номер на оферта не съществува в базата данни.\n\n" +
                  "Моля изпълнете SQL скрипта от supabase/schema.sql в Supabase SQL Editor.",
              );
            }

            throw new Error(
              `Грешка при генериране на номер: ${offerNumberError.message}`,
            );
          }

          if (!rpcResult) {
            throw new Error(
              "Не беше генериран номер на оферта. Моля опитайте отново.",
            );
          }

          offerNumber = rpcResult;
          console.log("Generated offer number:", offerNumber);
        } catch (rpcError) {
          if (rpcError instanceof Error) {
            throw rpcError;
          }
          throw new Error("Неуспешно генериране на номер на оферта");
        }

        // Insert new offer
        console.log("Inserting offer to database...");
        const offerData: InsertOffer = {
          offer_number: offerNumber,
          customer_name: data.customerName,
          customer_phone: data.customerPhone || null,
          customer_email: data.clientEmail || null,
          car_model_text: data.carModel,
          car_model_detail: data.carModelDetail || null,
          repair_name: data.repairName || null,
          vin_text: data.vinText || null,
          license_plate: data.carLicensePlate || null,
          mileage: data.carMileage ?? null,
          mileage_unit: data.carMileageUnit || "km",
          car_year: data.carYear ?? null,
          created_by_name: data.createdByName,
          created_by: profile.id,
          status: "sent",
          total_net: netTotal,
          total_vat: vat,
          total_gross: grossTotal,
          discount_percent: data.discountPercent || 0,
          discount_parts_percent: data.discountPartsPercent || 0,
          discount_services_percent: data.discountServicesPercent || 0,
          currency: "EUR",
          notes: data.notes || null,
          notes_internal: data.notesInternal || null,
          notes_service: data.notesService || null,
          prepayments_eur: prepayments.length > 0 ? prepayments : null,
        };

        const offerRes = await supabase
          .from("offers")
          .insert(offerData as never)
          .select()
          .single();

        if (offerRes.error) {
          console.error("Offer insert error:", offerRes.error);
          throw new Error(`Failed to create offer: ${offerRes.error.message}`);
        }

        offer = offerRes.data as Offer;
        if (!offer) throw new Error("Failed to create offer: No data returned");
        console.log("Offer created successfully:", offer.id);
      }

      // Prepare parts inserts
      const partsInserts: InsertOfferItem[] = data.parts.map((part, index) => ({
        offer_id: offer.id,
        type: "part" as const,
        description: part.description,
        brand: part.brand || null,
        part_number: part.partNumber || null,
        unit_price: part.unitPrice,
        quantity: part.quantity,
        total: part.unitPrice * part.quantity,
        sort_order: index,
      }));

      // Prepare service actions inserts
      const serviceInserts: InsertServiceAction[] = data.serviceActions.map(
        (action, index) => {
          const isFixed = action.isFixedPrice ?? false;
          const hours = isFixed
            ? 0
            : parseTimeToHours(action.timeRequired || "0");
          const total = isFixed
            ? action.fixedPriceAmount || 0
            : hours * action.pricePerHour;

          return {
            offer_id: offer.id,
            action_name: action.actionName,
            time_required_text: action.timeRequired || null,
            price_per_hour_eur_net: action.pricePerHour,
            total_eur_net: total,
            is_fixed_price: isFixed,
            fixed_price_amount: isFixed
              ? action.fixedPriceAmount || null
              : null,
            sort_order: index,
          };
        },
      );

      // Insert parts and service actions in parallel
      const insertPromises = [];

      if (partsInserts.length > 0) {
        console.log(`Inserting ${partsInserts.length} parts...`);
        insertPromises.push(
          supabase
            .from("offer_items")
            .insert(partsInserts as never)
            .then(({ error }) => {
              if (error)
                throw new Error(`Failed to insert parts: ${error.message}`);
              console.log("Parts inserted successfully");
            }),
        );
      }

      if (serviceInserts.length > 0) {
        console.log(`Inserting ${serviceInserts.length} service actions...`);
        insertPromises.push(
          supabase
            .from("service_actions")
            .insert(serviceInserts as never)
            .then(({ error }) => {
              if (error)
                throw new Error(
                  `Failed to insert service actions: ${error.message}`,
                );
              console.log("Service actions inserted successfully");
            }),
        );
      }

      // Wait for all inserts to complete
      if (insertPromises.length > 0) {
        await Promise.all(insertPromises);
      }

      // Fetch complete offer with relations
      const { data: completeOffer, error: fetchError } = await supabase
        .from("offers")
        .select(
          `
            *,
            items:offer_items(*),
            service_actions(*)
          `,
        )
        .eq("id", offer.id)
        .single();

      console.log("Offer saved successfully, fetching complete offer data...");

      if (fetchError) {
        console.error("Error fetching complete offer:", fetchError);
        // Don't throw - offer is saved, just can't fetch it for PDF
        console.warn("Offer saved but couldn't fetch complete data for PDF");
      }

      if (completeOffer) {
        setSavedOffer(completeOffer as OfferWithRelations);

        // Generate and download PDF (don't block navigation on PDF errors)
        console.log("Generating PDF...");
        try {
          await generateOfferPDF(completeOffer as OfferWithRelations);
          console.log("PDF generated and downloaded successfully");
        } catch (pdfError) {
          console.error(
            "PDF generation failed, but offer was saved:",
            pdfError,
          );
          // Don't throw - offer is saved, just PDF failed
          showError(t("errors.pdfFailedButSaved"));
        }
      } else {
        console.warn("Complete offer data not available for PDF generation");
      }

      // Clear localStorage draft on successful creation
      if (!isEditing) {
        try {
          localStorage.removeItem(AUTOSAVE_KEY);
          console.log("Cleared draft from localStorage");
        } catch (err) {
          console.error("Error clearing draft:", err);
        }
      }

      // Navigate back to offers list (only if creating, stay on page if editing)
      if (!isEditing) {
        console.log("Navigating to offers list...");
        const basePath = pathname.includes("/mb-admin")
          ? pathname.split("/mb-admin")[0] + "/mb-admin"
          : pathname.split("/mb-admin-mechanics")[0] + "/mb-admin-mechanics";

        clearTimeout(timeoutId);
        router.push(`${basePath}/offers`);
      } else {
        console.log("Offer updated successfully, refreshing data...");
        clearTimeout(timeoutId);

        // Refetch the updated offer to get fresh data with all relations
        const refreshResult = await refetchOffer();
        if (refreshResult.data) {
          console.log("Offer data refreshed");
        }

        setIsSaving(false);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(
        `=== ERROR ${isEditing ? "UPDATING" : "CREATING"} OFFER ===`,
      );
      console.error("Error details:", error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack",
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : `Failed to ${isEditing ? "update" : "create"} offer`;

      showError(isEditing ? t("errors.updateFailed") : t("errors.saveFailed"));
      setIsSaving(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.log("=== FORM VALIDATION FAILED ===");
    console.log("Validation errors:", errors);

    // Map field names to user-friendly errors
    if (errors.customerName) {
      showError(t("errors.customerNameRequired"));
    } else if (errors.createdByName) {
      showError(t("errors.creatorRequired"));
    } else if (errors.parts) {
      showError(t("errors.partsRequired"));
    } else {
      showError(t("errors.formInvalid"));
    }

    setIsSaving(false);
  };

  // Show loading state when fetching existing offer
  if (isEditing && offerLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Car info skeleton */}
            <Card className="bg-mb-anthracite border-mb-border">
              <CardContent className="pt-6">
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-1/4"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-10 bg-white/10 rounded"></div>
                    <div className="h-10 bg-white/10 rounded"></div>
                    <div className="h-10 bg-white/10 rounded"></div>
                    <div className="h-10 bg-white/10 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Parts skeleton */}
            <Card className="bg-mb-anthracite border-mb-border">
              <CardContent className="pt-6">
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-1/5"></div>
                  <div className="h-10 bg-white/10 rounded"></div>
                  <div className="h-10 bg-white/10 rounded"></div>
                  <div className="h-10 bg-white/10 rounded"></div>
                </div>
              </CardContent>
            </Card>
            {/* Services skeleton */}
            <Card className="bg-mb-anthracite border-mb-border">
              <CardContent className="pt-6">
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-1/4"></div>
                  <div className="h-10 bg-white/10 rounded"></div>
                  <div className="h-10 bg-white/10 rounded"></div>
                </div>
              </CardContent>
            </Card>
            {/* Notes skeleton */}
            <Card className="bg-mb-anthracite border-mb-border">
              <CardContent className="pt-6">
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-1/5"></div>
                  <div className="h-20 bg-white/10 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card className="bg-mb-anthracite border-mb-border sticky top-4">
              <CardContent className="pt-6">
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  <div className="h-6 bg-white/10 rounded w-3/4"></div>
                  <div className="h-6 bg-white/10 rounded w-2/3"></div>
                  <div className="h-px bg-white/10 rounded"></div>
                  <div className="h-8 bg-white/10 rounded w-full"></div>
                  <div className="h-10 bg-white/10 rounded"></div>
                  <div className="h-10 bg-white/10 rounded"></div>
                  <div className="h-10 bg-white/10 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Mechanic limited view
  if (isMechanicView && isEditing && savedOffer) {
    const offerParts = (savedOffer.items || []).filter(
      (i) => i.type === "part",
    );
    return (
      <div className="space-y-6 max-w-95vw">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            type={notification.type}
            message={notification.message}
            onClose={() => dismiss(notification.id)}
          />
        ))}

        {/* Car Data */}
        <Card className="bg-mb-anthracite border-mb-border">
          <CardHeader>
            <CardTitle className="text-lg">{t("carInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-mb-silver text-sm">{t("carModel")}</span>
                <p className="text-white">
                  {[savedOffer.car_model_text, savedOffer.car_model_detail]
                    .filter(Boolean)
                    .join(" ") || "-"}
                </p>
              </div>
              <div>
                <span className="text-mb-silver text-sm">
                  {t("carLicensePlate")}
                </span>
                <p className="text-white">{savedOffer.license_plate || "-"}</p>
              </div>
              <div>
                <span className="text-mb-silver text-sm">{t("carVin")}</span>
                <p className="text-white">
                  {savedOffer.vin_text
                    ? savedOffer.vin_text.toUpperCase()
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-mb-silver text-sm">
                  {t("carMileage")}
                </span>
                <p className="text-white">
                  {savedOffer.mileage != null
                    ? `${savedOffer.mileage} ${savedOffer.mileage_unit || "км"}`
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Repair Name + Mechanics note + Performed by (side by side) */}
        <Card className="bg-mb-anthracite border-mb-border">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <CardTitle className="text-lg mb-2">
                  {t("repairName")}
                </CardTitle>
                <p className="text-white">{savedOffer.repair_name || "-"}</p>
              </div>
              <div>
                <CardTitle className="text-lg mb-2">
                  {t("notesFromReception")}
                </CardTitle>
                <p className="text-white whitespace-pre-wrap">
                  {savedOffer.notes_service || "-"}
                </p>
              </div>
              <div>
                <CardTitle className="text-lg mb-2">
                  {t("performedBy")}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={performedBySelection}
                    onChange={(e) => setPerformedBySelection(e.target.value)}
                    className="border border-mb-border bg-mb-blue/20 text-white rounded-lg px-4 py-2.5 text-sm w-full max-w-[200px] focus:outline-none focus:ring-2 focus:ring-mb-blue/50 focus:border-mb-blue/50 transition-colors"
                  >
                    <option value="" className="bg-mb-anthracite">
                      {t("performedByChoose")}
                    </option>
                    <option value="50:50" className="bg-mb-anthracite">
                      50:50
                    </option>
                    <option value="Жоро" className="bg-mb-anthracite">
                      Жоро
                    </option>
                    <option value="Любо" className="bg-mb-anthracite">
                      Любо
                    </option>
                  </select>
                  <Button
                    type="button"
                    className="bg-mb-blue hover:bg-mb-blue/90 text-white px-5 py-2"
                    disabled={performedBySaving}
                    onClick={async () => {
                      if (!savedOffer?.id) return;
                      setPerformedBySaving(true);
                      try {
                        await updateOfferMutation.mutateAsync({
                          id: savedOffer.id,
                          offer: {
                            performed_by: performedBySelection.trim() || null,
                          },
                        });
                        queryClient.invalidateQueries({
                          queryKey: ["offer", savedOffer.id],
                        });
                        showSuccess(locale === "bg" ? "Запазено." : "Saved.");
                      } catch {
                        showError(
                          locale === "bg"
                            ? "Грешка при запазване."
                            : "Error saving.",
                        );
                      } finally {
                        setPerformedBySaving(false);
                      }
                    }}
                  >
                    {performedBySaving ? "…" : t("performedBySave")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Забележки от сервиза - editable by mechanic */}
        <Card className="bg-mb-anthracite border-mb-border">
          <CardContent className="pt-6">
            <CardTitle className="text-lg mb-3">{t("notes")}</CardTitle>
            <textarea
              value={notesFromServiceInput}
              onChange={(e) => setNotesFromServiceInput(e.target.value)}
              placeholder="Опишете какво е открито по автомобила..."
              rows={4}
              className="w-full rounded-md border border-mb-border bg-gray-100 text-gray-900 px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-mb-blue/50"
            />
            <Button
              type="button"
              className="mt-3 bg-mb-blue hover:bg-mb-blue/90 text-white px-5 py-2"
              disabled={notesFromServiceSaving}
              onClick={async () => {
                if (!savedOffer?.id) return;
                setNotesFromServiceSaving(true);
                try {
                  await updateOfferMutation.mutateAsync({
                    id: savedOffer.id,
                    offer: {
                      notes: notesFromServiceInput.trim() || null,
                    } as any,
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["offer", savedOffer.id],
                  });
                  showSuccess(locale === "bg" ? "Запазено." : "Saved.");
                } catch {
                  showError(
                    locale === "bg" ? "Грешка при запазване." : "Error saving.",
                  );
                } finally {
                  setNotesFromServiceSaving(false);
                }
              }}
            >
              {notesFromServiceSaving ? "…" : t("performedBySave")}
            </Button>
          </CardContent>
        </Card>

        {/* Parts - no prices, only names, numbers, quantities */}
        {offerParts.length > 0 && (
          <Card className="bg-mb-anthracite border-mb-border">
            <CardHeader>
              <CardTitle className="text-lg">
                {t("parts")} ({offerParts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-[40px_minmax(0,2fr)_minmax(0,1fr)_80px] gap-3 text-sm text-mb-silver uppercase font-medium border-b border-mb-border pb-2">
                  <div>#</div>
                  <div>{t("productName")}</div>
                  <div>{t("partNumber")}</div>
                  <div className="text-right">{t("qty")}</div>
                </div>
                {offerParts
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((part, i) => (
                    <div
                      key={part.id}
                      className="grid grid-cols-[40px_minmax(0,2fr)_minmax(0,1fr)_80px] gap-3 text-base py-1.5 border-b border-mb-border/50"
                    >
                      <div className="text-mb-silver">{i + 1}</div>
                      <div className="text-white">{part.description}</div>
                      <div className="text-mb-silver font-mono truncate">
                        {part.part_number || "-"}
                      </div>
                      <div className="text-white text-right">
                        {part.quantity}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      {/* Notifications */}
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => dismiss(notification.id)}
        />
      ))}

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="flex w-full flex-1 min-h-0 min-w-0 flex-col gap-6 overflow-y-auto p-4 sm:p-6 lg:flex-row lg:items-start lg:gap-8 lg:p-8"
      >
        {/* Scrollable form content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Client Info */}
          <Card className="bg-mb-anthracite border-mb-border">
            <CardContent className="pt-6">
              <ClientSelector />
            </CardContent>
          </Card>

          {/* Car Info */}
          <Card className="bg-mb-anthracite border-mb-border">
            <CardContent className="pt-6">
              <CarSelector />
            </CardContent>
          </Card>

          {/* Created By */}
          <Card className="bg-mb-anthracite border-mb-border">
            <CardContent
              className="pt-6"
              key={isEditing && existingOffer ? existingOffer.id : "create"}
            >
              <CreatedBySelector />
            </CardContent>
          </Card>

          {/* Parts */}
          <PartsFieldArray />

          {/* Service Actions */}
          <ServiceActionsFieldArray />

          {/* Additional Info */}
          <Card className="bg-mb-anthracite border-mb-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
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
                {t("additionalInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Discounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountPartsPercent">
                    {t("discountParts")}
                  </Label>
                  <div className="relative w-32">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      {...methods.register("discountPartsPercent", {
                        valueAsNumber: true,
                      })}
                      className="bg-gray-100 text-gray-900 border-mb-border pr-8 placeholder:text-gray-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-mb-silver">
                      %
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountServicesPercent">
                    {t("discountServices")}
                  </Label>
                  <div className="relative w-32">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      {...methods.register("discountServicesPercent", {
                        valueAsNumber: true,
                      })}
                      className="bg-gray-100 text-gray-900 border-mb-border pr-8 placeholder:text-gray-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-mb-silver">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Three notes fields side by side */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notesInternal">{t("notesInternal")}</Label>
                  <Textarea
                    {...methods.register("notesInternal")}
                    placeholder={t("notesInternalPlaceholder")}
                    className="bg-gray-100 text-gray-900 border-mb-border min-h-[100px] placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notesService">{t("notesService")}</Label>
                  <Textarea
                    {...methods.register("notesService")}
                    placeholder={t("notesServicePlaceholder")}
                    className="bg-gray-100 text-gray-900 border-mb-border min-h-[100px] placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">{t("notes")}</Label>
                  <Textarea
                    {...methods.register("notes")}
                    placeholder={t("notesPlaceholder")}
                    className="bg-gray-100 text-gray-900 border-mb-border min-h-[100px] placeholder:text-gray-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: only on admin create/edit (not in mechanic view) */}
        {!isMechanicView && (
          <div className="flex w-full flex-col lg:shrink-0 lg:w-[20rem] xl:w-[22rem] min-[2200px]:w-[28rem] min-[3000px]:w-[34rem]">
            <div className="w-full lg:sticky lg:top-8">
              <FloatingSummary
                prepayments={prepayments}
                onRemovePrepayment={(i) =>
                  setPrepayments((p) => p.filter((_, j) => j !== i))
                }
              >
                {/* Create Offer Button - only on create page (edit page uses auto-save) */}
                {!isEditing && (
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-mb-blue hover:bg-mb-blue/90"
                  >
                    {isSaving ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {t("saving")}
                      </>
                    ) : (
                      <>
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {t("createOffer")}
                      </>
                    )}
                  </Button>
                )}

                {/* Download Offer PDF (only when editing existing offer) */}
                {isEditing && savedOffer && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-mb-border bg-green-600 hover:bg-green-700 text-white"
                    disabled={offerPdfGenerating || serviceCardGenerating}
                    onClick={() => generateOfferPDF(savedOffer)}
                  >
                    {offerPdfGenerating ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Създаване…
                      </>
                    ) : (
                      <>
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
                        {t("downloadOfferPdf")}
                      </>
                    )}
                  </Button>
                )}

                {/* Service Card Button (always enabled for preview) */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-mb-border"
                  disabled={serviceCardGenerating || offerPdfGenerating}
                  onClick={generateServiceCardPDF}
                >
                  {serviceCardGenerating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Създаване…
                    </>
                  ) : (
                    <>
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {t("generateServiceCard")}
                    </>
                  )}
                </Button>

                {/* Add Pre-payment Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-mb-border"
                  onClick={() => {
                    setPrepaymentAmount("");
                    setPrepaymentError("");
                    setPrepaymentModalOpen(true);
                  }}
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t("addPrePayment")}
                </Button>

                {/* Clone Button (only for existing offers) */}
                {isEditing && savedOffer && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-amber-600 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400"
                    disabled={isCloning}
                    onClick={cloneCurrentOffer}
                  >
                    {isCloning ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Създаване…
                      </>
                    ) : (
                      <>
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        {t("clone")}
                      </>
                    )}
                  </Button>
                )}

                {/* Delete Button (only for existing offers) */}
                {isEditing && savedOffer && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      if (confirm(t("errors.saveFailed"))) {
                        await supabase
                          .from("offers")
                          .delete()
                          .eq("id", savedOffer.id);
                        const basePath = pathname.includes("/mb-admin")
                          ? pathname.split("/mb-admin")[0] + "/mb-admin"
                          : pathname.split("/mb-admin-mechanics")[0] +
                            "/mb-admin-mechanics";
                        router.push(`${basePath}/offers`);
                      }
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white border-red-600"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    {t("deleteOffer")}
                  </Button>
                )}

                {/* Offer Metadata Info - prefer savedOffer (refreshed after actions) over existingOffer (initial load) */}
                {isEditing &&
                  (savedOffer ?? existingOffer) &&
                  (() => {
                    const metaOffer = savedOffer ?? existingOffer!;
                    return (
                      <div className="w-full p-3 bg-mb-black/30 border border-mb-border rounded-lg text-xs text-mb-silver space-y-1.5">
                        <div>
                          <span className="font-medium">
                            {t("offerCreatedAt")}:
                          </span>{" "}
                          {new Date(metaOffer.created_at).toLocaleDateString(
                            "bg-BG",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                        {metaOffer.service_card_generated_at && (
                          <div>
                            <span className="font-medium">
                              {t("serviceCardCreatedAt")}:
                            </span>{" "}
                            {new Date(
                              metaOffer.service_card_generated_at,
                            ).toLocaleDateString("bg-BG", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                        {metaOffer.performed_by && (
                          <div>
                            <span className="font-medium">
                              {t("performedBy")}:
                            </span>{" "}
                            {metaOffer.performed_by}
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </FloatingSummary>
            </div>
          </div>
        )}
      </form>

      {/* Prepayment modal */}
      <Dialog open={prepaymentModalOpen} onOpenChange={setPrepaymentModalOpen}>
        <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t("addPrePayment")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="prepayment-amount" className="text-gray-200">
                {t("prepaymentAmount")} *
              </Label>
              <Input
                id="prepayment-amount"
                type="number"
                step="0.01"
                min={0}
                value={prepaymentAmount}
                onChange={(e) => {
                  setPrepaymentAmount(e.target.value);
                  setPrepaymentError("");
                }}
                placeholder="0.00"
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
            {prepaymentError && (
              <p className="text-sm text-red-400">{prepaymentError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPrepaymentModalOpen(false)}
              className="bg-red-500 hover:bg-red-600 text-white border-red-500"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                const n = parseFloat(prepaymentAmount.replace(",", "."));
                if (Number.isNaN(n) || n <= 0) {
                  setPrepaymentError(t("prepaymentAmountInvalid"));
                  return;
                }
                setPrepayments((prev) => [...prev, n]);
                setPrepaymentModalOpen(false);
              }}
              className="bg-mb-blue hover:bg-mb-blue/90"
            >
              {t("ok")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
