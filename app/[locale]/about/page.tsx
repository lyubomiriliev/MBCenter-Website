import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { VideoHero } from "@/components/sections/VideoHero";
import { AboutStory } from "@/components/sections/AboutStory";
import { EquipmentSection } from "@/components/sections/EquipmentSection";
import { ParallaxDivider } from "@/components/sections/ParallaxDivider";
import { AboutCTA } from "@/components/sections/AboutCTA";
import { generateAlternateLinks } from "@/lib/seo";
import { useTranslations } from "next-intl";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo.about" });
  const alternateLinks = generateAlternateLinks(locale, "/about");

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

export default function AboutPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations("about");

  return (
    <>
      <VideoHero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        videoSrc="/assets/videos/AQOrOSpoU-4453Yfb5DF98SiG2BAtP1cWYYdmN1NpRI5GzblE7C_aiXO581gpvPFUsfkrJEVrIe2Dm8WHGgg1zLwQ3QHWBb9LGOB9L8.mp4"
      />

      <AboutStory />

      <ParallaxDivider
        imageSrc="/assets/images/glc-white.webp"
        imageAlt="Mercedes GLC"
        text={t("equipment.oem")}
        icon={
          <Image
            src="/assets/mb-star-white.svg"
            alt="Mercedes Star"
            width={80}
            height={80}
            className="mx-auto opacity-80"
          />
        }
      />

      <EquipmentSection />

      <AboutCTA locale={locale} />
    </>
  );
}
