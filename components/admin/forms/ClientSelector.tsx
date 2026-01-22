"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OfferFormData } from "@/lib/schemas/offer";

export function ClientSelector() {
  const t = useTranslations("admin.form");
  const {
    register,
    formState: { errors },
  } = useFormContext<OfferFormData>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white flex items-center gap-2">
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        {t("clientInfo")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="customerName">{t("clientName")} *</Label>
          <Input
            {...register("customerName")}
            placeholder={t("clientNamePlaceholder")}
            className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
          />
          {errors.customerName && (
            <p className="text-xs text-red-400">
              {errors.customerName.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="customerPhone">{t("clientPhone")}</Label>
          <Input
            type="tel"
            {...register("customerPhone")}
            placeholder="+359 88 888 8888"
            className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="clientEmail">{t("clientEmail")}</Label>
          <Input
            type="email"
            {...register("clientEmail")}
            placeholder="client@email.com"
            className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
          />
          {errors.clientEmail && (
            <p className="text-xs text-red-400">{errors.clientEmail.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
