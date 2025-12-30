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

export default function GalleryPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations("gallery");

  const galleryImages = [
    {
      src: "/assets/images/gallery/w223.jpg",
      alt: "Mercedes-Benz S-Class W223",
      category: "projects",
    },
    {
      src: "/assets/images/gallery/w223-1.jpg",
      alt: "Mercedes-Benz S-Class Interior",
      category: "projects",
    },
    {
      src: "/assets/images/gallery/w223-2.jpg",
      alt: "Mercedes-Benz S-Class Detail",
      category: "projects",
    },
    {
      src: "/assets/images/gallery/w223x.jpg",
      alt: "Mercedes-Benz S-Class Workshop",
      category: "workshop",
    },
    {
      src: "/assets/images/gallery/gle-1.jpg",
      alt: "Mercedes-Benz GLE",
      category: "projects",
    },
    {
      src: "/assets/images/gallery/gle-w167.jpg",
      alt: "Mercedes-Benz GLE W167",
      category: "projects",
    },
    {
      src: "/assets/images/glc-white.webp",
      alt: "Mercedes-Benz GLC White",
      category: "projects",
    },
    {
      src: "/assets/images/g-class.jpg",
      alt: "Mercedes-Benz G-Class",
      category: "projects",
    },
    {
      src: "/assets/images/servicing.jpg",
      alt: "Mercedes Service",
      category: "workshop",
    },
    {
      src: "/assets/images/servicing-2.jpg",
      alt: "Mercedes Workshop",
      category: "workshop",
    },
    {
      src: "/assets/images/diagnosis1.png",
      alt: "Diagnostic Equipment",
      category: "equipment",
    },
    {
      src: "/assets/images/diagnosis2.png",
      alt: "Advanced Diagnostics",
      category: "equipment",
    },
    {
      src: "/assets/images/coding.webp",
      alt: "Mercedes Coding",
      category: "equipment",
    },
    {
      src: "/assets/images/coding3.webp",
      alt: "Vehicle Programming",
      category: "equipment",
    },
    {
      src: "/assets/images/ev1.avif",
      alt: "Mercedes EV Service",
      category: "projects",
    },
    {
      src: "/assets/images/glb-ev2.jpg",
      alt: "Mercedes GLB EV",
      category: "projects",
    },
  ];

  return (
    <>
      <VideoHero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        videoSrc="/assets/videos/glc-video.mp4"
      />

      <GallerySection
        title={t("title")}
        subtitle={t("hero.subtitle")}
        images={galleryImages}
      />
    </>
  );
}
