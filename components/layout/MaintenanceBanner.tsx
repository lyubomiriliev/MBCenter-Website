"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { supabase } from "@/lib/supabase/client";

const DEFAULTS = {
  bg: "Внимание: сервизът няма да работи от 20 септември до 01 октомври.",
  en: "Notice: the service will be unavailable from 20 September to 01 October.",
};

export function MaintenanceBanner() {
  const locale = useLocale();
  const isBg = locale === "bg";
  const [enabled, setEnabled] = useState(false);
  const [textBg, setTextBg] = useState(DEFAULTS.bg);
  const [textEn, setTextEn] = useState(DEFAULTS.en);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await (supabase.from("app_settings").select("*") as any);
      if (!active || !data) return;
      const get = (key: string) => data.find((s: any) => s.key === key);
      const on = Number(get("maintenance_banner_enabled")?.value) === 1;
      const tb = get("maintenance_banner_text_bg")?.value_text;
      const te = get("maintenance_banner_text_en")?.value_text;
      setEnabled(on);
      if (tb) setTextBg(tb);
      if (te) setTextEn(te);
      setMounted(true);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  if (!mounted || !enabled) return null;

  const message = isBg ? textBg : textEn;

  // One repeated unit: warning icon + the sentence.
  const Item = () => (
    <span className="flex items-center gap-3 shrink-0">
      <svg
        className="w-6 h-6 sm:w-7 sm:h-7 text-white shrink-0 animate-pulse drop-shadow"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.25}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
      <span className="text-base sm:text-lg font-bold tracking-wide text-white drop-shadow-sm whitespace-nowrap">
        {message}
      </span>
    </span>
  );

  // A single track holds the sentence repeated several times. Two identical
  // tracks sit side by side and each scrolls from 0 → -100%, so the loop is seamless.
  const Track = () => (
    <div className="flex shrink-0 items-center gap-10 pr-10 animate-marquee">
      {Array.from({ length: 4 }).map((_, i) => (
        <Item key={i} />
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden bg-gradient-to-r from-mb-blue via-blue-600 to-mb-blue border-b-2 border-white/20 shadow-2xl shadow-mb-blue/30">
      <div className="flex w-max py-3.5 sm:py-4">
        <Track />
        <Track />
      </div>
    </div>
  );
}
