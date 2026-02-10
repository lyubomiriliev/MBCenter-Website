"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import type { OfferStatus } from "@/types/database";
import { cn } from "@/lib/utils";

interface OfferStatusBadgeProps {
  status: OfferStatus;
  className?: string;
}

const statusStyles: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  parts_ordered: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  finished: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  approved: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

export function OfferStatusBadge({ status, className }: OfferStatusBadgeProps) {
  const t = useTranslations("admin.offers.status");

  return (
    <Badge
      variant="outline"
      className={cn(statusStyles[status] || statusStyles.draft, className)}
    >
      {t(status)}
    </Badge>
  );
}
