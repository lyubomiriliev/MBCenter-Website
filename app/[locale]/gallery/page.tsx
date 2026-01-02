import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { VideoHero } from "@/components/sections/VideoHero";
import { GallerySection } from "@/components/sections/GallerySection";
import { generateAlternateLinks } from "@/lib/seo";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo.gallery" });
  const alternateLinks = generateAlternateLinks(locale, "/gallery");

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

type GalleryProject = {
  id: string;
  title: string;
  description: {
    bg: string;
    en: string;
  };
  images: string[];
};

export default function GalleryPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations("gallery");

  const projects: GalleryProject[] = [
    {
      id: "eqs580",
      title: "EQS 580 SUV X296",
      description: {
        bg: "Смяна на електродвигател",
        en: "Electric motor replacement",
      },
      images: [
        "/assets/images/gallery/work/eqs1.jpg",
        "/assets/images/gallery/work/eqs2.jpg",
      ],
    },
    {
      id: "g63",
      title: "G63 AMG W463r",
      description: {
        bg: "Сервизно обслужване тип Service А",
        en: "Service A maintenance",
      },
      images: [
        "/assets/images/gallery/work/g63.jpg",
        "/assets/images/gallery/work/g63-1.jpg",
        "/assets/images/gallery/work/g63-2.jpg",
      ],
    },
    {
      id: "s400d",
      title: "S400d W223",
      description: {
        bg: "Програмиране и адаптация на фар. Star Diagnosis and SCN coding. ZenZefi certificate",
        en: "Headlight programming and adaptation. Star Diagnosis and SCN coding. ZenZefi certificate",
      },
      images: [
        "/assets/images/gallery/work/w223.jpg",
        "/assets/images/gallery/work/w223-1.jpg",
        "/assets/images/gallery/work/w223-2.jpg",
      ],
    },
    {
      id: "s580",
      title: "S580 W223",
      description: {
        bg: "Diagnostics and SCN coding. ZenZefi certificate",
        en: "Diagnostics and SCN coding. ZenZefi certificate",
      },
      images: ["/assets/images/gallery/work/w223-3.jpg"],
    },
    {
      id: "gle350-service",
      title: "GLE350 W167",
      description: {
        bg: "Сервизно обслужване тип Service А с вписване на официална сервизна история + Maps update Europe 2025",
        en: "Service A maintenance with official service history entry + Maps update Europe 2025",
      },
      images: [
        "/assets/images/gallery/work/gle.jpg",
        "/assets/images/gallery/work/gle-1.jpg",
        "/assets/images/gallery/work/gle-2.jpg",
      ],
    },
    {
      id: "g800",
      title: "G800 BRABUS W463",
      description: {
        bg: "Programming and coding. Start/Stop memory, Belts warning off, USA to ECE.",
        en: "Programming and coding. Start/Stop memory, Belts warning off, USA to ECE.",
      },
      images: [
        "/assets/images/gallery/work/brabus.jpg",
        "/assets/images/gallery/work/brabus-1.jpg",
        "/assets/images/gallery/work/brabus-2.jpg",
      ],
    },
    {
      id: "s63",
      title: "S63 AMG W217",
      description: {
        bg: "Star диагностика и сервизна инспекция",
        en: "Star Diagnosis and service inspection",
      },
      images: ["/assets/images/gallery/work/w217.jpg"],
    },
    {
      id: "gle350-2",
      title: "GLE350 W167",
      description: {
        bg: "Техническо обслужване - бобини и свещи. Сменена допълнителна ел. водна помпа ниско температурен кръг.",
        en: "Service - ignition coils and spark plugs. Changed aux. water pump.",
      },
      images: [
        "/assets/images/gallery/work/gle350.jpg",
        "/assets/images/gallery/work/gle350-1.jpg",
        "/assets/images/gallery/work/gle350-2.jpg",
        "/assets/images/gallery/work/gle350-3.jpg",
        "/assets/images/gallery/work/gle350-4.jpg",
      ],
    },
    {
      id: "s500",
      title: "S500 W222",
      description: {
        bg: "Programming and coding AMG menu",
        en: "Programming and coding AMG menu",
      },
      images: [
        "/assets/images/gallery/work/w222.jpg",
        "/assets/images/gallery/work/w222-1.jpg",
      ],
    },
  ];

  return (
    <>
      <VideoHero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        videoSrc="/assets/videos/w223-video.mp4"
      />

      <GallerySection title={t("title")} projects={projects} locale={locale} />
    </>
  );
}
