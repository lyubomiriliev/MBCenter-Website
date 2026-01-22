'use client';

import { useTranslations } from 'next-intl';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CreateOfferFormV2 } from '@/components/admin/forms/CreateOfferFormV2';

export default function MechanicsCreateOfferPage() {
  const t = useTranslations('admin');

  return (
    <div className="flex flex-col h-full">
      <AdminHeader
        title={t('offers.createOffer')}
        subtitle={t('offers.createOfferSubtitle')}
      />
      
      <div className="flex-1 p-6">
        <CreateOfferFormV2 />
      </div>
    </div>
  );
}

