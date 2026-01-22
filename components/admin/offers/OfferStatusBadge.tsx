'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import type { OfferStatus } from '@/types/database';
import { cn } from '@/lib/utils';

interface OfferStatusBadgeProps {
  status: OfferStatus;
  className?: string;
}

const statusStyles: Record<OfferStatus, string> = {
  draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  finished: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function OfferStatusBadge({ status, className }: OfferStatusBadgeProps) {
  const t = useTranslations('admin.offers.status');

  return (
    <Badge 
      variant="outline" 
      className={cn(statusStyles[status], className)}
    >
      {t(status)}
    </Badge>
  );
}



