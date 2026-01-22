'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { OffersTable } from '@/components/admin/offers/OffersTable';
import { OfferFilters } from '@/components/admin/offers/OfferFilters';
import { Button } from '@/components/ui/button';

export default function OffersPage() {
  const t = useTranslations('admin');
  const locale = useLocale();

  return (
    <div className="flex flex-col h-full">
      <AdminHeader
        title={t('offers.title')}
        subtitle={t('offers.subtitle')}
        actions={
          <Link href={`/${locale}/mb-admin-x77/create-offer`}>
            <Button className="bg-mb-blue hover:bg-mb-blue/90">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('offers.newOffer')}
            </Button>
          </Link>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        <OfferFilters />
        <OffersTable />
      </div>
    </div>
  );
}

