'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CreateOfferFormV2 } from '@/components/admin/forms/CreateOfferFormV2';

export default function EditOfferPage() {
  const params = useParams();
  const t = useTranslations('admin');
  const offerId = params.id as string;

  return (
    <div className="flex flex-col h-full">
      <AdminHeader
        title={t('offers.editOffer')}
        subtitle={`ID: ${offerId}`}
      />
      
      <div className="flex-1 p-6">
        <CreateOfferFormV2 offerId={offerId} />
      </div>
    </div>
  );
}

