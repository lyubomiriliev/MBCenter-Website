"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface StockStatusBadgeProps {
  qty: number;
  className?: string;
}

export function StockStatusBadge({ qty, className }: StockStatusBadgeProps) {
  const t = useTranslations("admin.warehouse");

  let style: string;
  let label: string;

  if (qty > 3) {
    style =
      "bg-green-500/20 text-green-400 border-green-500/40 shadow-[0_0_8px_rgba(34,197,94,0.4)]";
    label = t("status.inStock");
  } else if (qty >= 1) {
    style =
      "bg-yellow-500/20 text-yellow-400 border-yellow-500/40 shadow-[0_0_8px_rgba(234,179,8,0.4)]";
    label = t("status.limited");
  } else {
    style =
      "bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.4)]";
    label = t("status.outOfStock");
  }

  return (
    <Badge variant="outline" className={cn(style, "whitespace-nowrap", className)}>
      {label}
    </Badge>
  );
}
