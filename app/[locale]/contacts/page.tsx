import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { ImageHero } from "@/components/sections/ImageHero";
import { GoogleMap } from "@/components/sections/GoogleMap";
import { PatternBackground } from "@/components/sections/PatternBackground";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";
import { generateAlternateLinks } from "@/lib/seo";
import { getSiteConfig } from "@/lib/constants";
import { ContactForm } from "@/components/forms/ContactForm";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo.contacts" });
  const alternateLinks = generateAlternateLinks(locale, "/contacts");

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

export default function ContactsPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations("contacts");
  const config = getSiteConfig(locale);

  return (
    <>
      {/* Image Hero */}
      <ImageHero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        imageSrc="/assets/images/gallery/gle-w167.jpg"
      />

      {/* Contact Info & Form */}
      <PatternBackground className="pt-32 pb-32 bg-mb-black -mt-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <AnimatedSection from="left">
              <div>
                <h2 className="text-4xl font-bold text-white mb-12 tracking-tight">
                  {t("info.title")}
                </h2>
                <div className="space-y-8">
                  <div className="group flex items-start gap-6 p-6 bg-mb-anthracite rounded-card border border-mb-border hover:border-mb-blue transition-all duration-300">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-mb-blue/10 rounded-full flex items-center justify-center group-hover:bg-mb-blue/20 transition-colors">
                        <svg
                          className="w-7 h-7 text-mb-blue"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg mb-2">
                        {t("info.address")}
                      </p>
                      <p className="text-mb-blue mb-1">
                        {config.address.street}
                      </p>
                      <p className="text-mb-blue">
                        {config.address.city}, {config.address.country}
                      </p>
                    </div>
                  </div>

                  <div className="group flex items-start gap-6 p-6 bg-mb-anthracite rounded-card border border-mb-border hover:border-mb-blue transition-all duration-300">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-mb-blue/10 rounded-full flex items-center justify-center group-hover:bg-mb-blue/20 transition-colors">
                        <svg
                          className="w-7 h-7 text-mb-blue"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg mb-2">
                        {t("info.phone")}
                      </p>
                      <a
                        href={`tel:${config.phone.replace(/\s/g, "")}`}
                        className="text-mb-blue hover:text-white transition-colors text-lg"
                      >
                        {config.phone}
                      </a>
                    </div>
                  </div>

                  <div className="group flex items-start gap-6 p-6 bg-mb-anthracite rounded-card border border-mb-border hover:border-mb-blue transition-all duration-300">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-mb-blue/10 rounded-full flex items-center justify-center group-hover:bg-mb-blue/20 transition-colors">
                        <svg
                          className="w-7 h-7 text-mb-blue"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg mb-2">
                        {t("info.email")}
                      </p>
                      <a
                        href={`mailto:${config.email}`}
                        className="text-mb-blue hover:text-white transition-colors text-lg"
                      >
                        {config.email}
                      </a>
                    </div>
                  </div>

                  <div className="group flex items-start gap-6 p-6 bg-mb-anthracite rounded-card border border-mb-border hover:border-mb-blue transition-all duration-300">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-mb-blue/10 rounded-full flex items-center justify-center group-hover:bg-mb-blue/20 transition-colors">
                        <svg
                          className="w-7 h-7 text-mb-blue"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg mb-2">
                        {t("info.workingHours")}
                      </p>
                      <p className="text-mb-blue text-lg">{t("info.hours")}</p>
                    </div>
                  </div>

                  {/* MB Center Logo */}
                  <div className="mt-8 flex justify-center">
                    <Image
                      src={
                        locale === "en"
                          ? "/assets/logos/mbc-logo-en.png"
                          : "/assets/logos/mbc-logo-white.png"
                      }
                      alt="MB Center Sofia"
                      width={240}
                      height={80}
                      draggable={false}
                      className="h-auto w-[400px] opacity-90 hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Contact Form */}
            <AnimatedSection from="right">
              <div className="bg-mb-anthracite p-8 lg:p-10 rounded-card border border-mb-border">
                <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">
                  {t("form.title")}
                </h2>
                <ContactForm />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </PatternBackground>

      {/* Map Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-32 relative z-10">
          <AnimatedText className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              {t("map.title")}
            </h2>
            <div className="w-24 h-1 bg-mb-blue mx-auto"></div>
          </AnimatedText>
          <AnimatedSection from="bottom" delay={0.2}>
            <GoogleMap />
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
