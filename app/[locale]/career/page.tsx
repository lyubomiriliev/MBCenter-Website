// Career page - Commented out but kept for future use
// To re-enable: Uncomment this file and add { href: "/career", labelKey: "nav.career" } to NAV_ITEMS in lib/constants.ts

/*
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { VideoHero } from "@/components/sections/VideoHero";
import { OpenPositionsSection } from "@/components/sections/OpenPositionsSection";
import { BenefitsSection } from "@/components/sections/BenefitsSection";
import { CareerFormSection } from "@/components/sections/CareerFormSection";
import { generateAlternateLinks } from "@/lib/seo";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo.career" });
  const alternateLinks = generateAlternateLinks(locale, "/career");

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

export default function CareerPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations("career");

  return (
    <>
      <VideoHero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        videoSrc="/assets/videos/glc-video.mp4"
        ctaPrimary={{
          text: t("positions.apply"),
          href: `#career-application-form`,
        }}
      />

      <OpenPositionsSection
        title={t("positions.title")}
        positions={["technician", "advisor"]}
        applyText={t("positions.apply")}
      />

      <BenefitsSection
        title={t("benefits.title")}
        benefits={["training", "environment", "growth"]}
        getBenefitText={(key) => t(`benefits.${key}`)}
      />

      <CareerFormSection
        title={t("form.title")}
        subtitle={t("form.subtitle")}
      />
    </>
  );
}
*/

// Temporary placeholder to prevent route errors
// This route is disabled - uncomment the code above to re-enable
export default function CareerPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mb-black">
      <p className="text-mb-silver">Career page is currently disabled.</p>
    </div>
  );
}
