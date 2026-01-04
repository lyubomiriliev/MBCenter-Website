import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { VideoHero } from "@/components/sections/VideoHero";
import { ServicesGridSection } from "@/components/sections/ServicesGridSection";
import { SpecializedServicesSection } from "@/components/sections/SpecializedServicesSection";
import { CodingByGenerationSection } from "@/components/sections/CodingByGenerationSection";
import { DetailedServicesSection } from "@/components/sections/DetailedServicesSection";
import { ServicesCTASection } from "@/components/sections/ServicesCTASection";
import { RemoteDiagnosisSection } from "@/components/sections/RemoteDiagnosisSection";
import { DigitalServiceBookletSection } from "@/components/sections/DigitalServiceBookletSection";
import { PeriodicMaintenanceSection } from "@/components/sections/PeriodicMaintenanceSection";
import { RepairServicesSection } from "@/components/sections/RepairServicesSection";
import { generateAlternateLinks } from "@/lib/seo";
import { CTABand } from "@/components/sections/CTABand";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo.services" });
  const alternateLinks = generateAlternateLinks(locale, "/services");

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

export default function ServicesPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations("services");

  const services = [
    {
      key: "maintenance",
      image: "/assets/images/servicing.jpg",
    },
    {
      key: "diagnostics",
      image: "/assets/images/diagnosis3.webp",
    },
    {
      key: "coding",
      image: "/assets/images/coding.webp",
    },
    {
      key: "multimedia",
      image: "/assets/images/coding2.webp",
    },
    {
      key: "parts",
      image: "/assets/images/oem-parts.jpg",
    },
    {
      key: "inspection",
      image: "/assets/images/inspection.webp",
    },
  ];

  // Specialized services
  const specializedServices = [
    {
      title: t("specialized.xentry.title"),
      description: t("specialized.xentry.description"),
      features: [
        t("specialized.xentry.feature1"),
        t("specialized.xentry.feature2"),
        t("specialized.xentry.feature3"),
        t("specialized.xentry.feature4"),
      ],
      image: "/assets/images/xentry.jpg",
    },
    {
      title: t("specialized.coding.title"),
      description: t("specialized.coding.description"),
      features: [
        t("specialized.coding.feature1"),
        t("specialized.coding.feature2"),
        t("specialized.coding.feature3"),
        t("specialized.coding.feature4"),
      ],
      image: "/assets/images/coding3.webp",
    },
    {
      title: t("specialized.transmission.title"),
      description: t("specialized.transmission.description"),
      features: [
        t("specialized.transmission.feature1"),
        t("specialized.transmission.feature2"),
        t("specialized.transmission.feature3"),
        t("specialized.transmission.feature4"),
      ],
      image: "/assets/images/gearbox.jpg",
    },
  ];

  // Coding by generation
  const codingGenerations = [
    {
      id: "latest",
      name: t("codingGen.latest.name"),
      models: t("codingGen.latest.models"),
      system: "MBUX NTG 7",
      image: "/assets/images/gallery/w223.jpg",
      categories: [
        {
          title: t("codingGen.latest.dashboard.title"),
          features: [
            t("codingGen.latest.dashboard.f1"),
            t("codingGen.latest.dashboard.f2"),
            t("codingGen.latest.dashboard.f3"),
            t("codingGen.latest.dashboard.f4"),
            t("codingGen.latest.dashboard.f5"),
          ],
        },
        {
          title: t("codingGen.latest.lights.title"),
          features: [
            t("codingGen.latest.lights.f1"),
            t("codingGen.latest.lights.f2"),
            t("codingGen.latest.lights.f3"),
            t("codingGen.latest.lights.f4"),
          ],
        },
        {
          title: t("codingGen.latest.modes.title"),
          features: [
            t("codingGen.latest.modes.f1"),
            t("codingGen.latest.modes.f2"),
            t("codingGen.latest.modes.f3"),
            t("codingGen.latest.modes.f4"),
          ],
        },
        {
          title: t("codingGen.latest.assist.title"),
          features: [
            t("codingGen.latest.assist.f1"),
            t("codingGen.latest.assist.f2"),
            t("codingGen.latest.assist.f3"),
            t("codingGen.latest.assist.f4"),
          ],
        },
      ],
    },
    {
      id: "mbux-compact",
      name: t("codingGen.compact.name"),
      models: t("codingGen.compact.models"),
      system: "MBUX NTG 6",
      image: "/assets/images/eqb2021.webp",
      categories: [
        {
          title: t("codingGen.compact.dashboard.title"),
          features: [
            t("codingGen.compact.dashboard.f1"),
            t("codingGen.compact.dashboard.f2"),
            t("codingGen.compact.dashboard.f3"),
            t("codingGen.compact.dashboard.f4"),
          ],
        },
        {
          title: t("codingGen.compact.modes.title"),
          features: [
            t("codingGen.compact.modes.f1"),
            t("codingGen.compact.modes.f2"),
            t("codingGen.compact.modes.f3"),
            t("codingGen.compact.modes.f4"),
          ],
        },
        {
          title: t("codingGen.compact.lights.title"),
          features: [
            t("codingGen.compact.lights.f1"),
            t("codingGen.compact.lights.f2"),
            t("codingGen.compact.lights.f3"),
          ],
        },
        {
          title: t("codingGen.compact.comfort.title"),
          features: [
            t("codingGen.compact.comfort.f1"),
            t("codingGen.compact.comfort.f2"),
            t("codingGen.compact.comfort.f3"),
          ],
        },
      ],
    },
    {
      id: "e-cls",
      name: t("codingGen.eCls.name"),
      models: t("codingGen.eCls.models"),
      system: "NTG 5.5 / MBUX",
      image: "/assets/images/g-class.jpg",
      categories: [
        {
          title: t("codingGen.eCls.multimedia.title"),
          features: [
            t("codingGen.eCls.multimedia.f1"),
            t("codingGen.eCls.multimedia.f2"),
            t("codingGen.eCls.multimedia.f3"),
            t("codingGen.eCls.multimedia.f4"),
          ],
        },
        {
          title: t("codingGen.eCls.display.title"),
          features: [
            t("codingGen.eCls.display.f1"),
            t("codingGen.eCls.display.f2"),
            t("codingGen.eCls.display.f3"),
          ],
        },
        {
          title: t("codingGen.eCls.lights.title"),
          features: [
            t("codingGen.eCls.lights.f1"),
            t("codingGen.eCls.lights.f2"),
            t("codingGen.eCls.lights.f3"),
          ],
        },
        {
          title: t("codingGen.eCls.comfort.title"),
          features: [
            t("codingGen.eCls.comfort.f1"),
            t("codingGen.eCls.comfort.f2"),
          ],
        },
      ],
    },
    {
      id: "older",
      name: t("codingGen.older.name"),
      models: t("codingGen.older.models"),
      system: "NTG 5.0 / 5.1",
      image: "/assets/images/glc2018.avif",
      categories: [
        {
          title: t("codingGen.older.multimedia.title"),
          features: [
            t("codingGen.older.multimedia.f1"),
            t("codingGen.older.multimedia.f2"),
            t("codingGen.older.multimedia.f3"),
          ],
        },
        {
          title: t("codingGen.older.comfort.title"),
          features: [
            t("codingGen.older.comfort.f1"),
            t("codingGen.older.comfort.f2"),
            t("codingGen.older.comfort.f3"),
            t("codingGen.older.comfort.f4"),
          ],
        },
        {
          title: t("codingGen.older.lights.title"),
          features: [
            t("codingGen.older.lights.f1"),
            t("codingGen.older.lights.f2"),
          ],
        },
        {
          title: t("codingGen.older.control.title"),
          features: [
            t("codingGen.older.control.f1"),
            t("codingGen.older.control.f2"),
          ],
        },
      ],
    },
  ];

  // Detailed service categories
  const detailedCategories = [
    {
      title: t("detailed.diagnostic.title"),
      image: "/assets/images/coding.webp",
      services: [
        {
          icon: "🔍",
          title: t("detailed.diagnostic.s1.title"),
          description: t("detailed.diagnostic.s1.desc"),
        },
        {
          icon: "🛡️",
          title: t("detailed.diagnostic.s2.title"),
          description: t("detailed.diagnostic.s2.desc"),
        },
        {
          icon: "📊",
          title: t("detailed.diagnostic.s3.title"),
          description: t("detailed.diagnostic.s3.desc"),
        },
      ],
    },
    {
      title: t("detailed.coding.title"),
      image: "/assets/images/coding2.webp",
      services: [
        {
          icon: "🔓",
          title: t("detailed.coding.s1.title"),
          description: t("detailed.coding.s1.desc"),
        },
        {
          icon: "📡",
          title: t("detailed.coding.s2.title"),
          description: t("detailed.coding.s2.desc"),
        },
        {
          icon: "🎯",
          title: t("detailed.coding.s3.title"),
          description: t("detailed.coding.s3.desc"),
        },
        {
          icon: "🔄",
          title: t("detailed.coding.s4.title"),
          description: t("detailed.coding.s4.desc"),
        },
        {
          icon: "📍",
          title: t("detailed.coding.s5.title"),
          description: t("detailed.coding.s5.desc"),
        },
        {
          icon: "🎬",
          title: t("detailed.coding.s6.title"),
          description: t("detailed.coding.s6.desc"),
        },
      ],
    },
    {
      title: t("detailed.transmission.title"),
      image: "/assets/images/servicing-2.jpg",
      services: [
        {
          icon: "⚙️",
          title: t("detailed.transmission.s1.title"),
          description: t("detailed.transmission.s1.desc"),
        },
        {
          icon: "🔧",
          title: t("detailed.transmission.s2.title"),
          description: t("detailed.transmission.s2.desc"),
        },
        {
          icon: "🔄",
          title: t("detailed.transmission.s3.title"),
          description: t("detailed.transmission.s3.desc"),
        },
      ],
    },
    {
      title: t("detailed.universal.title"),
      services: [
        {
          icon: "🌍",
          title: t("detailed.universal.s1.title"),
          description: t("detailed.universal.s1.desc"),
        },
        {
          icon: "📏",
          title: t("detailed.universal.s2.title"),
          description: t("detailed.universal.s2.desc"),
        },
        {
          icon: "🗣️",
          title: t("detailed.universal.s3.title"),
          description: t("detailed.universal.s3.desc"),
        },
      ],
    },
  ];

  return (
    <>
      <VideoHero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        videoSrc="/assets/videos/AQMvXyw8Qr_0EPmb5_YBTtwndhPK4wck9Z5nXi9DFt_iPPJfpDcxCYm98Pf_W9f19g9Jv-_juJF-QkhbeqWs-TOESfJ-0eHNyXInsYE.mp4"
        ctaPrimary={{ text: t("cta"), href: `/${locale}/booking` }}
      />

      <ServicesGridSection
        title={t("title")}
        services={services}
        getServiceTitle={(key) => t(`${key}.title`)}
        getServiceDescription={(key) => t(`${key}.desc`)}
        locale={locale}
      />

      <SpecializedServicesSection
        title={t("specialized.title")}
        subtitle={t("specialized.subtitle")}
        services={specializedServices}
        ctaText={t("cta")}
        ctaHref={`/${locale}/booking`}
      />

      <CodingByGenerationSection
        title={t("codingGen.title")}
        subtitle={t("codingGen.subtitle")}
        generations={codingGenerations}
      />

      <DetailedServicesSection
        title={t("detailed.title")}
        subtitle={t("detailed.subtitle")}
        categories={detailedCategories}
      />

      <RemoteDiagnosisSection locale={locale} />

      <DigitalServiceBookletSection locale={locale} />

      <PeriodicMaintenanceSection locale={locale} />

      <RepairServicesSection locale={locale} />

      <CTABand locale={locale} />
    </>
  );
}
