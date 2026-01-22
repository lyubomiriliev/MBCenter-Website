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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  offerFormSchema,
  defaultOfferFormValues,
  type OfferFormData,
} from "@/lib/schemas/offer";
import { supabase } from "@/lib/supabase/client";
import { OfferPDFv3 } from "@/components/pdf/OfferPDFv3";
import { ServiceCardPDFv3 } from "@/components/pdf/ServiceCardPDFv3";
import type { 
  OfferWithRelations, 
  Profile,
  InsertOffer,
  InsertOfferItem,
  InsertServiceAction,
  Offer
} from "@/types/database";

interface CreateOfferFormV2Props {
  offerId?: string;
}

export function CreateOfferFormV2({ offerId }: CreateOfferFormV2Props) {
  const t = useTranslations("admin.form");
  const locale = useLocale() as "bg" | "en";
  const router = useRouter();
  const pathname = usePathname();
  const [isSaving, setIsSaving] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [savedOffer, setSavedOffer] = useState<OfferWithRelations | null>(null);

  const isEditing = !!offerId;

  const methods = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema) as any,
    defaultValues: defaultOfferFormValues,
  });

  const {
    handleSubmit,
    formState: { errors },
    watch,
  } = methods;

  // Debug: Watch form values
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      console.log("Form field changed:", name, value);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

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

      // Generate PDF with timeout
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
      alert(
        `Failed to generate PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error; // Re-throw so caller knows it failed
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
      alert(
        "Please add at least one part or service action before generating a service card"
      );
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
        car_model_text: methods.watch("carModel"),
        vin_text: methods.watch("vinText") || null,
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
            const timeStr = action.timeRequired || "0h 0min";
            const hourMatch = timeStr.match(/(\d+)h/);
            const minMatch = timeStr.match(/(\d+)min/);
            const hours =
              (hourMatch ? parseInt(hourMatch[1]) : 0) +
              (minMatch ? parseInt(minMatch[1]) : 0) / 60;
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
      alert("Failed to generate service card");
    } finally {
      setPdfGenerating(false);
    }
  };

  const onSubmit = async (data: OfferFormData) => {
    console.log("=== FORM SUBMIT CALLED ===");
    console.log("Form data:", data);
    console.log("Form errors:", errors);
    console.log("Parts count:", data.parts?.length || 0);
    console.log("Service actions count:", data.serviceActions?.length || 0);

    setIsSaving(true);

    // Add timeout to prevent infinite hanging
    const timeoutId = setTimeout(() => {
      console.error("Form submission timeout after 30 seconds");
      alert("Заявката отне твърде много време. Моля опитайте отново.");
      setIsSaving(false);
    }, 30000);

    try {
      // Get current user's profile
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

          // Check if RPC function doesn't exist
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
        // If RPC fails completely, throw with helpful message
        if (rpcError instanceof Error) {
          throw rpcError;
        }
        throw new Error("Неуспешно генериране на номер на оферта");
      }

      // Calculate totals for parts
      let partsTotal = 0;
      data.parts.forEach((part) => {
        partsTotal += (part.unitPrice || 0) * (part.quantity || 1);
      });

      // Calculate totals for service actions
      let serviceTotal = 0;
      data.serviceActions.forEach((action) => {
        const timeStr = action.timeRequired || "0h 0min";
        const hourMatch = timeStr.match(/(\d+)h/);
        const minMatch = timeStr.match(/(\d+)min/);
        const hours =
          (hourMatch ? parseInt(hourMatch[1]) : 0) +
          (minMatch ? parseInt(minMatch[1]) : 0) / 60;
        serviceTotal += hours * (action.pricePerHour || 0);
      });

      const subtotal = partsTotal + serviceTotal;
      const discount = subtotal * ((data.discountPercent || 0) / 100);
      const netTotal = subtotal - discount;
      const vat = netTotal * 0.2; // 20% VAT
      const grossTotal = netTotal + vat;

      // Insert offer
      console.log("Inserting offer to database...");
      const offerData: InsertOffer = {
        offer_number: offerNumber,
        customer_name: data.customerName,
        customer_phone: data.customerPhone || null,
        car_model_text: data.carModel,
        vin_text: data.vinText || null,
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
      console.log("Offer data to insert:", offerData);

      const offerRes = await supabase
        .from("offers")
        .insert(offerData as never)
        .select()
        .single();

      const offer = offerRes.data as Offer | null;
      const offerError = offerRes.error;

      console.log("Offer insert result:", { offer, offerError });

      if (offerError) {
        console.error("Offer insert error:", offerError);
        throw new Error(`Failed to create offer: ${offerError.message}`);
      }

      if (!offer) {
        throw new Error("Failed to create offer: No data returned");
      }

      console.log("Offer created successfully:", offer.id);

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
          const timeStr = action.timeRequired || "0h 0min";
          const hourMatch = timeStr.match(/(\d+)h/);
          const minMatch = timeStr.match(/(\d+)min/);
          const hours =
            (hourMatch ? parseInt(hourMatch[1]) : 0) +
            (minMatch ? parseInt(minMatch[1]) : 0) / 60;
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
          alert(
            "Офертата е запазена успешно, но генерирането на PDF не беше успешно. Можете да го генерирате по-късно от списъка с оферти."
          );
        }
      } else {
        console.warn("Complete offer data not available for PDF generation");
      }

      console.log("Navigating to offers list...");

      // Navigate to offers list
      const basePath = pathname.includes("/mb-admin-x77")
        ? pathname.split("/mb-admin-x77")[0] + "/mb-admin-x77"
        : pathname.split("/mb-admin-mechanics")[0] + "/mb-admin-mechanics";

      clearTimeout(timeoutId);
      router.push(`${basePath}/offers`);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("=== ERROR CREATING OFFER ===");
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
          : "Failed to create offer";

      alert(
        `Грешка при създаване на оферта:\n${errorMessage}\n\nМоля проверете конзолата за повече детайли.`
      );
      setIsSaving(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.log("=== FORM VALIDATION FAILED ===");
    console.log("Validation errors:", errors);
    console.log("Form values:", methods.getValues());

    // Show specific validation errors
    const errorMessages: string[] = [];
    Object.keys(errors).forEach((key) => {
      const error = errors[key];
      if (error?.message) {
        errorMessages.push(`${key}: ${error.message}`);
      }
    });

    alert(
      `Формата не е валидна:\n\n${errorMessages.join(
        "\n"
      )}\n\nМоля попълнете всички задължителни полета.`
    );
    setIsSaving(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <CardContent className="pt-6">
                <CreatedBySelector />
              </CardContent>
            </Card>

            {/* Parts */}
            <PartsFieldArray />
            {errors.parts && (
              <p className="text-sm text-red-400">
                {errors.parts.message ||
                  "At least one part or service action is required"}
              </p>
            )}

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
            <FloatingSummary>
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
                className="w-full border-mb-border"
              >
                {t("cancel")}
              </Button>
            </FloatingSummary>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
