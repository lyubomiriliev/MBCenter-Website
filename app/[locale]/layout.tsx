import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyBookingCTA } from "@/components/layout/StickyBookingCTA";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { generateAlternateLinks, generateLocalBusinessSchema } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo.home" });
  const alternateLinks = generateAlternateLinks(locale);

  return {
    metadataBase: new URL(SITE_CONFIG.baseUrl),
    title: {
      default: t("title"),
      template: `%s | ${SITE_CONFIG.name}`,
    },
    description: t("description"),
    alternates: alternateLinks,
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
    openGraph: {
      type: "website",
      locale: locale === "bg" ? "bg_BG" : "en_US",
      url: alternateLinks.canonical,
      siteName: SITE_CONFIG.name,
      title: t("title"),
      description: t("description"),
      images: [
        {
          url: "/og-image.jpg", // Placeholder - add actual image
          width: 1200,
          height: 630,
          alt: SITE_CONFIG.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og-image.jpg"], // Placeholder - add actual image
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Props) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();
  const jsonLd = generateLocalBusinessSchema(locale);

  return (
    <html lang={locale} className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-mb-black text-white">
        <SmoothScroll />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <StickyBookingCTA />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
