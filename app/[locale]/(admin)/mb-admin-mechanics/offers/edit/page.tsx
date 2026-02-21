"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CreateOfferFormV2 } from "@/components/admin/forms/CreateOfferFormV2";

export default function EditOfferPageMechanics() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("admin");
  const offerId = searchParams.get("id");
  const locale = params.locale as string;

  useEffect(() => {
    if (!offerId) {
      router.replace(`/${locale}/mb-admin-mechanics/offers`);
    }
  }, [offerId, locale, router]);

  if (!offerId) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <AdminHeader
        title={t("offers.editOffer")}
        subtitle={`ID: ${offerId}`}
      />
      <div className="flex-1 min-w-0 overflow-auto p-4 sm:p-6">
        <CreateOfferFormV2 offerId={offerId} isMechanicView />
      </div>
    </div>
  );
}
