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
        actions={
          <Link href={`/${locale}/mb-admin-mechanics/create-offer`}>
            <Button className="bg-mb-blue hover:bg-mb-blue/90 text-sm sm:text-base shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('offers.newOffer')}
            </Button>
          </Link>
        }
      />
      <div className="flex-1 min-w-0 overflow-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <OfferFilters onFiltersChange={setFilters} />
        <OffersTable isMechanicView filters={filters} />
      </div>
    </div>
  );
}

