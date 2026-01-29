'use client';

import { useTranslations } from 'next-intl';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CreateOfferFormV2 } from '@/components/admin/forms/CreateOfferFormV2';

export default function CreateOfferPage() {
  const t = useTranslations('admin');

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AdminHeader
        title={t('offers.createOffer')}
        subtitle={t('offers.createOfferSubtitle')}
      />
      <div className="flex-1 min-w-0 overflow-auto p-4 sm:p-6">
        <CreateOfferFormV2 />
      </div>
    </div>
  );
}

