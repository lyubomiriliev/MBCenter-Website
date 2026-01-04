import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { VideoHero } from "@/components/sections/VideoHero";
import { BookingInfoSection } from "@/components/sections/BookingInfoSection";
import { HoursSection } from "@/components/sections/HoursSection";
import { generateAlternateLinks } from "@/lib/seo";
import { ImageHero } from "@/components/sections/ImageHero";

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
      <ImageHero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        imageSrc="/assets/images/skilled-technicians.png"
      />

      <BookingInfoSection locale={locale} />

      <HoursSection
        title={t("hours.title")}
        description={t("hours.description")}
      />
    </>
  );
}
