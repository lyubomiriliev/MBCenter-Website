"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export interface AppSettings {
  mechanic_rate: number;
  receptionist_pct: number;
  default_price_per_hour: number;
  default_mileage_unit: "km" | "miles";
  default_parts_discount: number;
  default_services_discount: number;
  default_notes: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  mechanic_rate: 0,
  receptionist_pct: 0,
  default_price_per_hour: 65,
  default_mileage_unit: "km",
  default_parts_discount: 0,
  default_services_discount: 0,
  default_notes: "",
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await (supabase.from("app_settings").select("*") as any);
      if (data) {
        const getNum = (key: string) => data.find((s: any) => s.key === key)?.value;
        const getText = (key: string) => data.find((s: any) => s.key === key)?.value_text;
        setSettings({
          mechanic_rate: Number(getNum("mechanic_rate")) || 0,
          receptionist_pct: Number(getNum("receptionist_pct")) || 0,
          default_price_per_hour: Number(getNum("default_price_per_hour")) || 65,
          default_mileage_unit: getText("default_mileage_unit") === "miles" ? "miles" : "km",
          default_parts_discount: Number(getNum("default_parts_discount")) || 0,
          default_services_discount: Number(getNum("default_services_discount")) || 0,
          default_notes: getText("default_notes") ?? "",
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  return { settings, loading };
}
