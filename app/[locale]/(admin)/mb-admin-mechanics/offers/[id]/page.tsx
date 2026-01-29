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
    <div className="flex flex-col flex-1 min-h-0">
      <AdminHeader
        title={t('offers.editOffer')}
        subtitle={offerId ? `ID: ${offerId}` : undefined}
      />
      <div className="flex-1 min-w-0 overflow-auto p-4 sm:p-6">
        <CreateOfferFormV2 offerId={offerId} />
      </div>
    </div>
  );
}