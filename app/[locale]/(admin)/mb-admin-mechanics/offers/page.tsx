'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { OffersTable } from '@/components/admin/offers/OffersTable';
import { OfferFilters } from '@/components/admin/offers/OfferFilters';
import { Button } from '@/components/ui/button';
import type { OfferStatus } from '@/types/database';

export default function MechanicsOffersPage() {
  const t = useTranslations('admin');
  const locale = useLocale();

  const [filters, setFilters] = useState<{
    status: OfferStatus | 'all';
    search: string;
    dateFrom?: Date;
    dateTo?: Date;
  }>({
    status: 'all',
    search: '',
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AdminHeader
        title={t('offers.title')}
        subtitle={t('offers.mechanicSubtitle')}
      />
      <div className="flex-1 min-w-0 overflow-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <OfferFilters onFiltersChange={setFilters} />
        <OffersTable isMechanicView filters={filters} />
      </div>
    </div>
  );
}

