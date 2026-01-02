"use client";

import { useTranslations } from "next-intl";
import { VideoHero } from "@/components/sections/VideoHero";
import { WhereToFindUs } from "@/components/sections/WhereToFindUs";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { ScrollVideoSection } from "@/components/sections/ScrollVideoSection";
import { ParallaxDivider } from "@/components/sections/ParallaxDivider";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { EVSection } from "@/components/sections/EVSection";
import { CTABand } from "@/components/sections/CTABand";

export function HomePageContent() {
  const t = useTranslations();

  return (
    <>
      <VideoHero
        title={t("home.hero.title")}
        subtitle={t("home.hero.subtitle")}
        videoSrc="/assets/videos/glc-video.mp4"
        ctaPrimary={{ text: t("home.hero.cta"), href: "/bg/booking" }}
        ctaSecondary={{
          text: t("home.hero.ctaSecondary"),
          href: "/bg/contacts",
        }}
      />

      <WhereToFindUs />

      <ServicesSection locale="bg" />

      {/* <ScrollVideoSection videoSrc="/assets/videos/gt53-video.mp4" /> */}

      <WhyChooseUs />

      <ParallaxDivider
        imageSrc="/assets/images/g-class.jpg"
        imageAlt="Mercedes G-Class"
        text={t("home.valueProps.whyChooseDesc")}
      />

      <EVSection locale="bg" />

      <CTABand locale="bg" />
    </>
  );
}
