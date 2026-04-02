"use client";

import { useMemo, useEffect, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
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
import { authClient as supabase } from "@/lib/supabase/client";

export function CreatedBySelector() {
  const t = useTranslations("admin.form");
  const { control } = useFormContext<OfferFormData>();
  const { field } = useController({ name: "createdByName", control });
  const createdByName = field.value;
  const [storedCreators, setStoredCreators] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await (supabase.from("app_settings").select("value_text").eq("key", "document_creators").single() as any);
      if (data?.value_text) {
        try {
          setStoredCreators(JSON.parse(data.value_text));
        } catch {}
      }
    };
    load();
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
        key={options.join(",")}
        value={createdByName || undefined}
        onValueChange={(value) => field.onChange(value)}
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
