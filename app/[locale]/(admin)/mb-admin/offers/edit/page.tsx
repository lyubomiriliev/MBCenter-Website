"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CreateOfferFormV2 } from "@/components/admin/forms/CreateOfferFormV2";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

function EditOfferContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("admin");
  const offerId = searchParams.get("id");
  const locale = params.locale as string;
  const [offerNumber, setOfferNumber] = useState<string | null>(null);
  const [serviceCardNumber, setServiceCardNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!offerId) {
      router.replace(`/${locale}/mb-admin/offers`);
      return;
    }
    supabase
      .from("offers")
      .select("offer_number, service_card_number")
      .eq("id", offerId)
      .single()
      .then(({ data }) => {
        const d = data as { offer_number: string; service_card_number: string | null } | null;
        setOfferNumber(d?.offer_number ?? null);
        setServiceCardNumber(d?.service_card_number ?? null);
      });
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
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span>{t("offers.editOffer")}</span>
              {offerNumber && (
                <span className="text-mb-blue">
                  <span className="text-mb-silver text-sm font-normal">Оферта</span>{" "}
                  <span className="font-semibold">№<button
                    type="button"
                    title="Копирай номера"
                    onClick={() => navigator.clipboard.writeText(offerNumber)}
                    className="hover:opacity-70 transition-opacity cursor-copy"
                  >{offerNumber}</button></span>
                </span>
              )}
              {serviceCardNumber && (
                <span className="text-green-400">
                  <span className="text-mb-silver text-sm font-normal">Сервизна карта</span>{" "}
                  <span className="font-semibold">№<button
                    type="button"
                    title="Копирай номера"
                    onClick={() => navigator.clipboard.writeText(serviceCardNumber)}
                    className="hover:opacity-70 transition-opacity cursor-copy"
                  >{serviceCardNumber}</button></span>
                </span>
              )}
            </span>
          }
          subtitle=""
        />
        <div className="flex max-w-[2560px] min-[3000px]:mx-auto flex-1 min-w-0 min-h-0 overflow-hidden">
          <CreateOfferFormV2 offerId={offerId} />
        </div>
      </div>
    </div>
  );
}

export default function EditOfferPage() {
  return (
    <Suspense fallback={<div className="flex flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-start lg:p-8 animate-pulse">
      <div className="flex-1 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 bg-white/10 rounded" />
              <div className="h-10 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>}>
      <EditOfferContent />
    </Suspense>
  );
}
