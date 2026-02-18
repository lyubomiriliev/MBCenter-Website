"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CreateOfferFormV2 } from "@/components/admin/forms/CreateOfferFormV2";
import Image from "next/image";

export default function EditOfferPage() {
  const params = useParams();
  const t = useTranslations("admin");
  const offerId = params.id as string;

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
          title={t("offers.editOffer")}
          subtitle={offerId ? `ID: ${offerId}` : undefined}
        />
        <div className="flex  max-w-[2560px] min-[3000px]:mx-auto flex-1 min-w-0 min-h-0 overflow-hidden">
          <CreateOfferFormV2 offerId={offerId} />
        </div>
      </div>
    </div>
  );
}
