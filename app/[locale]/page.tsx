import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import { VideoHero } from "@/components/sections/VideoHero";
import { WhereToFindUs } from "@/components/sections/WhereToFindUs";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { ParallaxDivider } from "@/components/sections/ParallaxDivider";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { EVSection } from "@/components/sections/EVSection";
import { CTABand } from "@/components/sections/CTABand";
import { generateAlternateLinks } from "@/lib/seo";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo.home" });
  const alternateLinks = generateAlternateLinks(locale);

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

export default function HomePage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations();

  return (
    <>
      <VideoHero
        title={t("home.hero.title")}
        subtitle={t("home.hero.subtitle")}
        videoSrc="/assets/videos/glc-video.mp4"
        ctaPrimary={{ text: t("home.hero.cta"), href: `/${locale}/booking` }}
        ctaSecondary={{
          text: t("home.hero.ctaSecondary"),
          href: `/${locale}/contacts`,
        }}
      />

      <WhereToFindUs />

      <ServicesSection locale={locale} />

      {/* <ScrollVideoSection videoSrc="/assets/videos/gt53-video.mp4" /> */}

      <WhyChooseUs />

      <ParallaxDivider
        imageSrc="/assets/images/g-class.jpg"
        imageAlt="Mercedes G-Class"
        text={t("home.valueProps.whyChooseDesc")}
      />

      <EVSection locale={locale} />

      <CTABand locale={locale} />
    </>
  );
}
