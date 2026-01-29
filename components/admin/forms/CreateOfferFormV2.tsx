"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
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
import { useOffer } from "@/hooks/useOffers";
import type { 
  OfferWithRelations, 
  Profile,
  InsertOffer,
  InsertOfferItem,
  InsertServiceAction,
  Offer,
  UpdateOffer
} from "@/types/database";

interface CreateOfferFormV2Props {
  offerId?: string;
}

const AUTOSAVE_KEY = 'mbcenter_offer_draft';

export function CreateOfferFormV2({ offerId }: CreateOfferFormV2Props) {
  const t = useTranslations("admin.form");
  const locale = useLocale() as "bg" | "en";
  const router = useRouter();
  const pathname = usePathname();
  const [isSaving, setIsSaving] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [savedOffer, setSavedOffer] = useState<OfferWithRelations | null>(null);
  const [isLoadingOffer, setIsLoadingOffer] = useState(false);
  const [prepayments, setPrepayments] = useState<number[]>([]);
  const [prepaymentModalOpen, setPrepaymentModalOpen] = useState(false);
  const [prepaymentAmount, setPrepaymentAmount] = useState("");
  const [prepaymentError, setPrepaymentError] = useState("");
  
  const { notifications, dismiss, showError, showSuccess } = useNotification();

  const isEditing = !!offerId;
  const { data: existingOffer, isLoading: offerLoading, refetch: refetchOffer } = useOffer(offerId);

  const methods = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema) as any,
    defaultValues: defaultOfferFormValues,
  });

  const {
    handleSubmit,
    formState: { errors },
    watch,
  } = methods;

  // Load existing offer data into form when editing
  useEffect(() => {
    if (!existingOffer || !isEditing) return;
    setSavedOffer(existingOffer);

    const yearFallback = existingOffer.created_at
      ? new Date(existingOffer.created_at).getFullYear()
      : new Date().getFullYear();

    const formData: Partial<OfferFormData> = {
      customerName: existingOffer.customer_name ?? "",
      customerPhone: existingOffer.customer_phone ?? "",
      clientEmail:
        existingOffer.customer_email ??
        existingOffer.client?.email ??
        "",
      clientId: existingOffer.client_id ?? undefined,

      carModel: existingOffer.car_model_text ?? "",
      carYear:
        existingOffer.car_year ??
        existingOffer.car?.year ??
        yearFallback,
      vinText: existingOffer.vin_text ?? "",
      carLicensePlate:
        existingOffer.license_plate ??
        existingOffer.car?.license_plate ??
        "",
      carMileage:
        existingOffer.mileage ??
        existingOffer.car?.mileage ??
        0,
      carId: existingOffer.car_id ?? undefined,

      createdByName: existingOffer.created_by_name ?? "",

      discountPercent: existingOffer.discount_percent ?? 0,
      notes: existingOffer.notes ?? "",

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
  }, [existingOffer, isEditing, methods]);

  // Load from localStorage on mount (only for new offers)
  useEffect(() => {
    if (isEditing) return;

    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const savedTime = new Date(data.timestamp);
        const hoursSince = (Date.now() - savedTime.getTime()) / (1000 * 60 * 60);
        
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
      console.error('Error loading draft:', err);
      localStorage.removeItem(AUTOSAVE_KEY);
    }
  }, [isEditing, methods]);

  // Watch form values for auto-save
  const customerName = watch('customerName');
  const customerPhone = watch('customerPhone');
  const clientEmail = watch('clientEmail');
  const carModel = watch('carModel');
  const carYear = watch('carYear');
  const vinText = watch('vinText');
  const carLicensePlate = watch('carLicensePlate');
  const carMileage = watch('carMileage');
  const createdByName = watch('createdByName');
  const discountPercent = watch('discountPercent');
  const notes = watch('notes');
  const parts = watch('parts');
  const serviceActions = watch('serviceActions');

  // Auto-save to localStorage
  useEffect(() => {
    if (isEditing) return;

    const saveTimeout = setTimeout(() => {
      const formData = methods.getValues();
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
          formData,
          prepayments,
          timestamp: new Date().toISOString(),
        }));
      } catch (err) {
        console.error('Error saving draft:', err);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [isEditing, methods, prepayments, customerName, customerPhone, clientEmail, carModel, carYear, vinText, carLicensePlate, carMileage, createdByName, discountPercent, notes, parts, serviceActions]);

  const generateOfferPDF = async (offerData: OfferWithRelations) => {
    setPdfGenerating(true);
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

      const PDFComponent = <OfferPDFv3 offer={offerData} locale={locale} />;

      const blob = await Promise.race([
        pdf(PDFComponent).toBlob(),
        new Promise<Blob>((_, reject) =>
          setTimeout(() => reject(new Error("PDF generation timeout")), 30000)
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

      console.log("PDF download triggered");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showError(t('errors.pdfFailed'));
      throw error;
    } finally {
      setPdfGenerating(false);
    }
  };

  const generateServiceCardPDF = async () => {
    if (
      !savedOffer &&
      methods.watch("parts").length === 0 &&
      methods.watch("serviceActions").length === 0
    ) {
      showError(t('errors.noItemsForServiceCard'));
      return;
    }

    setPdfGenerating(true);
    try {
      // Create a mock offer for unsaved forms
      const offerData: OfferWithRelations = savedOffer || {
        id: "temp",
        offer_number: "",
        customer_name: methods.watch("customerName"),
        customer_phone: methods.watch("customerPhone") || null,
        customer_email: methods.watch("clientEmail") || null,
        car_model_text: methods.watch("carModel"),
        vin_text: methods.watch("vinText") || null,
        license_plate: methods.watch("carLicensePlate") || null,
        mileage: methods.watch("carMileage") ?? null,
        car_year: methods.watch("carYear") ?? null,
        created_by_name: methods.watch("createdByName"),
        status: "draft",
        total_net: 0,
        total_vat: 0,
        total_gross: 0,
        discount_percent: methods.watch("discountPercent") || 0,
        currency: "EUR",
        notes: methods.watch("notes") || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client_id: null,
        car_id: null,
        created_by: null,
        items: methods.watch("parts").map((part, index) => ({
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
        service_actions: methods
          .watch("serviceActions")
          .map((action, index) => {
            const hours = parseTimeToHours(action.timeRequired || "0");
            return {
              id: `action-${index}`,
              offer_id: "temp",
              action_name: action.actionName,
              time_required_text: action.timeRequired || null,
              price_per_hour_eur_net: action.pricePerHour,
              total_eur_net: hours * action.pricePerHour,
              sort_order: index,
              created_at: new Date().toISOString(),
            };
          }),
      };

      // Register fonts before generating PDF
      const { registerPDFFonts } = await import("@/lib/pdf-fonts");
      const { setFontRegistered } = await import(
        "@/components/pdf/ServiceCardPDFv3"
      );
      const fontsReady = await registerPDFFonts();
      setFontRegistered(fontsReady);

      if (!fontsReady) {
        console.warn("Fonts not loaded, PDF will use Helvetica fallback");
      }

      const PDFComponent = (
        <ServiceCardPDFv3 offer={offerData} locale={locale} />
      );
      const blob = await pdf(PDFComponent).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = savedOffer
        ? `service-card-${savedOffer.offer_number}.pdf`
        : "service-card-draft.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating service card PDF:", error);
      showError(t('errors.serviceCardFailed'));
    } finally {
      setPdfGenerating(false);
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
      showError(t('errors.saveFailed'));
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
          vin_text: data.vinText || null,
          license_plate: data.carLicensePlate || null,
          mileage: data.carMileage ?? null,
          car_year: data.carYear ?? null,
          created_by_name: data.createdByName,
          total_net: netTotal,
          total_vat: vat,
          total_gross: grossTotal,
          discount_percent: data.discountPercent || 0,
          notes: data.notes || null,
        };

        const offerRes = await supabase
          .from("offers")
          .update(updateData as never)
          .eq("id", offerId)
          .select()
          .single();

        if (offerRes.error) throw new Error(`Failed to update offer: ${offerRes.error.message}`);
        offer = offerRes.data as Offer;

        // Delete existing items and service actions
        await supabase.from("offer_items").delete().eq("offer_id", offerId);
        await supabase.from("service_actions").delete().eq("offer_id", offerId);

      } else {
        // CREATE new offer
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const profileRes = await supabase
          .from("profiles")
          .select("id")
          .eq("auth_id", user.id)
          .single();

        const profile = profileRes.data as Pick<Profile, 'id'> | null;
        if (!profile) throw new Error("Profile not found");

        // Generate offer number
        console.log("Calling generate_offer_number RPC...");
        let offerNumber: string;

        try {
          const { data: rpcResult, error: offerNumberError } = await supabase.rpc(
            "generate_offer_number"
          );

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
                  "Моля изпълнете SQL скрипта от supabase/schema.sql в Supabase SQL Editor."
              );
            }

            throw new Error(
              `Грешка при генериране на номер: ${offerNumberError.message}`
            );
          }

          if (!rpcResult) {
            throw new Error(
              "Не беше генериран номер на оферта. Моля опитайте отново."
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
          vin_text: data.vinText || null,
          license_plate: data.carLicensePlate || null,
          mileage: data.carMileage ?? null,
          car_year: data.carYear ?? null,
          created_by_name: data.createdByName,
          created_by: profile.id,
          status: "draft",
          total_net: netTotal,
          total_vat: vat,
          total_gross: grossTotal,
          discount_percent: data.discountPercent || 0,
          currency: "EUR",
          notes: data.notes || null,
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

      // Insert parts
      if (data.parts.length > 0) {
        console.log(`Inserting ${data.parts.length} parts...`);
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

        const { error: partsError } = await supabase
          .from("offer_items")
          .insert(partsInserts as never);

        if (partsError) {
          console.error("Parts insert error:", partsError);
          throw new Error(`Failed to insert parts: ${partsError.message}`);
        }
        console.log("Parts inserted successfully");
      }

      // Insert service actions
      if (data.serviceActions.length > 0) {
        console.log(
          `Inserting ${data.serviceActions.length} service actions...`
        );
        const serviceInserts: InsertServiceAction[] = data.serviceActions.map((action, index) => {
          const hours = parseTimeToHours(action.timeRequired || "0");
          const total = hours * action.pricePerHour;

          return {
            offer_id: offer.id,
            action_name: action.actionName,
            time_required_text: action.timeRequired || null,
            price_per_hour_eur_net: action.pricePerHour,
            total_eur_net: total,
            sort_order: index,
          };
        });

        const { error: serviceError } = await supabase
          .from("service_actions")
          .insert(serviceInserts as never);

        if (serviceError) {
          console.error("Service actions insert error:", serviceError);
          throw new Error(
            `Failed to insert service actions: ${serviceError.message}`
          );
        }
        console.log("Service actions inserted successfully");
      }

      // Fetch complete offer with relations
      const { data: completeOffer, error: fetchError } = await supabase
        .from("offers")
        .select(
          `
            *,
            items:offer_items(*),
            service_actions(*)
          `
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
            pdfError
          );
          // Don't throw - offer is saved, just PDF failed
          showError(t('errors.pdfFailedButSaved'));
        }
      } else {
        console.warn("Complete offer data not available for PDF generation");
      }

      // Clear localStorage draft on successful creation
      if (!isEditing) {
        try {
          localStorage.removeItem(AUTOSAVE_KEY);
          console.log('Cleared draft from localStorage');
        } catch (err) {
          console.error('Error clearing draft:', err);
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
      console.error(`=== ERROR ${isEditing ? 'UPDATING' : 'CREATING'} OFFER ===`);
      console.error("Error details:", error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack"
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : `Failed to ${isEditing ? 'update' : 'create'} offer`;

      showError(isEditing ? t('errors.updateFailed') : t('errors.saveFailed'));
      setIsSaving(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.log("=== FORM VALIDATION FAILED ===");
    console.log("Validation errors:", errors);

    // Map field names to user-friendly errors
    if (errors.customerName) {
      showError(t('errors.customerNameRequired'));
    } else if (errors.createdByName) {
      showError(t('errors.creatorRequired'));
    } else if (errors.parts) {
      showError(t('errors.partsRequired'));
    } else {
      showError(t('errors.formInvalid'));
    }
    
    setIsSaving(false);
  };

  // Show loading state when fetching existing offer
  if (isEditing && offerLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Skeleton cards */}
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-mb-anthracite border-mb-border">
                <CardContent className="pt-6">
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-mb-black rounded w-1/4"></div>
                    <div className="h-10 bg-mb-black rounded"></div>
                    <div className="h-4 bg-mb-black rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-1">
            <Card className="bg-mb-anthracite border-mb-border">
              <CardContent className="pt-6">
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-mb-black rounded w-1/2"></div>
                  <div className="h-20 bg-mb-black rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
      
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Main Form - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
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
              <CardContent className="pt-6" key={isEditing && existingOffer ? existingOffer.id : "create"}>
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
                {/* Discount */}
                <div className="space-y-2">
                  <Label htmlFor="discountPercent">{t("discount")}</Label>
                  <div className="relative w-32">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      {...methods.register("discountPercent", {
                        valueAsNumber: true,
                      })}
                      className="bg-gray-100 text-gray-900 border-mb-border pr-8 placeholder:text-gray-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-mb-silver">
                      %
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">{t("notes")}</Label>
                  <Textarea
                    {...methods.register("notes")}
                    placeholder={t("notesPlaceholder")}
                    className="bg-gray-100 text-gray-900 border-mb-border min-h-[100px] placeholder:text-gray-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Summary with Action Buttons */}
          <div className="lg:col-span-1">
            <FloatingSummary
              prepayments={prepayments}
              onRemovePrepayment={(i) => setPrepayments((p) => p.filter((_, j) => j !== i))}
            >
              {/* Create/Update Offer Button */}
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
                    {isEditing ? t("updateOffer") : t("createOffer")}
                  </>
                )}
              </Button>

             

              {/* Download Offer PDF (only when editing existing offer) */}
              {isEditing && savedOffer && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-mb-border bg-green-600 hover:bg-green-700 text-white"
                  disabled={pdfGenerating}
                  onClick={() => generateOfferPDF(savedOffer)}
                >
                  {pdfGenerating ? (
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
                      Generating...
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
                      Download Offer PDF
                    </>
                  )}
                </Button>
              )}

              {/* Service Card Button (always enabled for preview) */}
              <Button
                type="button"
                variant="outline"
                className="w-full border-mb-border"
                disabled={pdfGenerating}
                onClick={generateServiceCardPDF}
              >
                {pdfGenerating ? (
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
                    Generating...
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

              {/* Cancel Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full bg-red-500 hover:bg-red-600 text-white border-red-500"
              >
                {t("cancel")}
              </Button>
            </FloatingSummary>
          </div>
        </div>
      </form>

      {/* Prepayment modal */}
      <Dialog open={prepaymentModalOpen} onOpenChange={setPrepaymentModalOpen}>
        <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">{t("addPrePayment")}</DialogTitle>
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
