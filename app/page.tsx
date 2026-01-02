import {
  getTranslations,
  setRequestLocale,
  getMessages,
} from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import type { Metadata } from "next";
import { HomePageContent } from "./HomePageContent";
import { generateAlternateLinks } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyBookingCTA } from "@/components/layout/StickyBookingCTA";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "bg", namespace: "seo.home" });
  const alternateLinks = generateAlternateLinks("bg");

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

export default async function RootPage() {
  setRequestLocale("bg");
  const messages = await getMessages({ locale: "bg" });

  return (
    <NextIntlClientProvider messages={messages} locale="bg">
      <SmoothScroll />
      <Header />
      <main className="min-h-screen">
        <HomePageContent />
      </main>
      <Footer />
      <StickyBookingCTA />
    </NextIntlClientProvider>
  );
}
