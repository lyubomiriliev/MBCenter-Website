"use client";

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

  return (
    <div className="space-y-2">
      <Label htmlFor="createdByName">{t("createdBy")}</Label>
      <Select
        value={createdByName}
        onValueChange={(value) => setValue("createdByName", value, { shouldValidate: true })}
      >
        <SelectTrigger className="bg-gray-100 text-gray-900 border-mb-border">
          <SelectValue placeholder={t("selectCreator")} />
        </SelectTrigger>
        <SelectContent className="bg-mb-anthracite border-mb-border">
          {CREATORS.map((creator) => (
            <SelectItem
              key={creator}
              value={creator}
              className="text-white focus:bg-mb-black focus:text-white"
            >
              {creator}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}



