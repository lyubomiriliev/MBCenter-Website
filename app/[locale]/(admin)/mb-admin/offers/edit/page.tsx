"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CreateOfferFormV2 } from "@/components/admin/forms/CreateOfferFormV2";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

export default function EditOfferPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("admin");
  const offerId = searchParams.get("id");
  const locale = params.locale as string;
  const [offerNumber, setOfferNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!offerId) {
      router.replace(`/${locale}/mb-admin/offers`);
      return;
    }
    supabase
      .from("offers")
      .select("offer_number")
      .eq("id", offerId)
      .single()
      .then(({ data }) => setOfferNumber((data as { offer_number: string } | null)?.offer_number ?? null));
  }, [offerId, locale, router]);

  if (!offerId) return null;

  return (
    <div className="flex relative flex-col flex-1 min-h-0">
      <div className="absolute inset-0 z-0 select-none hidden min-[2550px]:block">
        <Image
          src="/assets/images/mb-pattern.webp"
          alt=""
          fill
          className="object-cover translate-x-[62%] hidden min-[3000px]:block opacity-10"
          priority
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 z-0 select-none hidden min-[2550px]:block">
        <Image
          src="/assets/images/mb-pattern.webp"
          alt=""
          fill
          className="object-cover -translate-x-[79%] hidden min-[3000px]:block opacity-10"
          priority
          sizes="100vw"
        />
      </div>
      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        <AdminHeader
          title={
            <span>
              {t("offers.editOffer")}
              {offerNumber && (
                <span className="ml-2 text-mb-blue">№{offerNumber}</span>
              )}
            </span>
          }
          subtitle={`ID: ${offerId}`}
        />
        <div className="flex max-w-[2560px] min-[3000px]:mx-auto flex-1 min-w-0 min-h-0 overflow-hidden">
          <CreateOfferFormV2 offerId={offerId} />
        </div>
      </div>
    </div>
  );
}
