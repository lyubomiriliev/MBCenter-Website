"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OfferFormData } from "@/lib/schemas/offer";

const CREATORS = [
  "Християн Момчилов",
  "Ивайло Карлабишки",
];

export function CreatedBySelector() {
  const t = useTranslations("admin.form");
  const { setValue, watch } = useFormContext<OfferFormData>();
  const createdByName = watch("createdByName");

  const options = useMemo(() => {
    const list = [...CREATORS];
    if (createdByName && !list.includes(createdByName)) list.unshift(createdByName);
    return list;
  }, [createdByName]);

  return (
    <div className="space-y-2">
      <Label htmlFor="createdByName">{t("createdBy")}</Label>
      <Select
        value={createdByName || undefined}
        onValueChange={(value) => setValue("createdByName", value, { shouldValidate: true })}
      >
        <SelectTrigger className="bg-gray-100 text-gray-900 border-mb-border">
          <SelectValue placeholder={t("selectCreator")} />
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-200 text-gray-900">
          {options.map((creator) => (
            <SelectItem
              key={creator}
              value={creator}
              className="text-gray-900 focus:bg-gray-100 focus:text-gray-900"
            >
              {creator}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}



