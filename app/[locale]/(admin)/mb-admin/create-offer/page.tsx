"use client";

import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CreateOfferFormV2 } from "@/components/admin/forms/CreateOfferFormV2";
import Image from "next/image";

export default function CreateOfferPage() {
  const t = useTranslations("admin");

  return (
    <div className="flex relative flex-col flex-1 min-h-0">
      <AdminHeader
        title={t("offers.createOffer")}
        subtitle={t("offers.createOfferSubtitle")}
      />
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/mb-pattern.webp"
          alt=""
          fill
          className="object-cover translate-x-[62%] hidden min-[3000px]:block opacity-10"
          priority
          sizes="100vw"
        />
      </div>

      <div className="flex bg-black max-w-[2560px] flex-1 min-w-0 min-h-0 overflow-hidden">
        <CreateOfferFormV2 />
      </div>
    </div>
  );
}
