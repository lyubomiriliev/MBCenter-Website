"use client";

import { useMemo, useEffect, useState } from "react";
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

const DOCUMENT_CREATORS_KEY = "mb_document_creators";

export function CreatedBySelector() {
  const t = useTranslations("admin.form");
  const { setValue, watch } = useFormContext<OfferFormData>();
  const createdByName = watch("createdByName");
  const [storedCreators, setStoredCreators] = useState<string[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const stored = localStorage.getItem(DOCUMENT_CREATORS_KEY);
        if (stored) setStoredCreators(JSON.parse(stored));
      } catch {}
    };
    load();
    const handler = (e: StorageEvent) => {
      if (e.key === DOCUMENT_CREATORS_KEY) load();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const options = useMemo(() => {
    const list = [...storedCreators];
    if (createdByName && !list.includes(createdByName)) list.unshift(createdByName);
    return list;
  }, [storedCreators, createdByName]);

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
          {options.length === 0 ? (
            <SelectItem value="__none__" disabled className="text-gray-400">
              {t("noCreatorsAdded") || "No creators added in Settings"}
            </SelectItem>
          ) : (
            options.map((creator) => (
              <SelectItem
                key={creator}
                value={creator}
                className="text-gray-900 focus:bg-gray-100 focus:text-gray-900"
              >
                {creator}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
