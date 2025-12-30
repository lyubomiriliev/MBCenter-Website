import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";

type AboutCTAProps = {
  locale: string;
};

export function AboutCTA({ locale }: AboutCTAProps) {
  const t = useTranslations("about");

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/gallery/w223.jpg"
          alt=""
          fill
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/95" />
      </div>

      {/* Animated accent lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mb-blue to-transparent opacity-50" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mb-blue to-transparent opacity-50" />
      </div>

      <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
        <AnimatedText>
          <div className="mb-8">
            <Image
              src="/assets/mb-star-white.svg"
              alt="Mercedes Star"
              width={60}
              height={60}
              className="mx-auto opacity-90"
            />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-xl text-mb-silver max-w-2xl mx-auto mb-12">
            {t("story.content")}
          </p>
        </AnimatedText>

        <AnimatedSection from="bottom" delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={`/${locale}/booking`}
              className="group relative inline-flex items-center gap-3 bg-mb-blue text-white px-8 py-4 rounded-button hover:bg-mb-blue/90 transition-all duration-300 text-base font-medium uppercase tracking-wide shadow-xl hover:shadow-2xl hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10">{t("cta")}</span>
              <svg
                className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform translate-x-1"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-mb-blue via-blue-600 to-mb-blue opacity-100 transition-opacity duration-300" />
            </Link>

            <Link
              href={`/${locale}/services`}
              className="inline-flex items-center gap-3 bg-transparent text-white px-8 py-4 rounded-button border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300 text-base font-medium uppercase tracking-wide backdrop-blur-sm"
            >
              <span>{t("equipment.oem")}</span>
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
