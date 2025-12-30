import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { BookingInfoSection } from "@/components/sections/BookingInfoSection";
import { HoursSection } from "@/components/sections/HoursSection";
import { generateAlternateLinks } from "@/lib/seo";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo.booking" });
  const alternateLinks = generateAlternateLinks(locale, "/booking");

  return {
    title: t("title"),
    description: t("description"),
    alternates: alternateLinks,
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: alternateLinks.canonical,
    },
  };
}

export default function BookingPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations("booking");

  return (
    <>
      <Hero title={t("hero.title")} subtitle={t("hero.subtitle")} fullHeight={false} />

      <BookingInfoSection
        title={t("info.title")}
        steps={["step1", "step2", "step3", "step4"]}
        getStepText={(key) => t(`info.${key}`)}
        ctaText={t("cta")}
        orText={t("or")}
        callUsText={t("callUs")}
      />

      <HoursSection
        title={t("hours.title")}
        description={t("hours.description")}
      />
    </>
  );
}
