import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";

type CTABandProps = {
  locale: string;
};

export function CTABand({ locale }: CTABandProps) {
  const t = useTranslations();

  return (
    <section className="relative py-16 sm:py-20 md:py-24 bg-mb-black overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.08]">
        <Image
          src="/assets/images/mb-pattern-white.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <AnimatedText>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8 md:mb-12 tracking-tight leading-tight px-2">
            {t("home.cta.title")}
          </h2>
        </AnimatedText>
        <AnimatedSection from="bottom" delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center">
            <Link
              href={`/${locale}/booking`}
              className="group relative inline-flex items-center justify-center gap-2 bg-mb-blue text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-button hover:bg-mb-blue/90 transition-all duration-300 text-sm sm:text-base font-medium uppercase tracking-wide shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden w-full sm:w-auto min-w-[200px] sm:min-w-0"
            >
              <span className="relative z-10 whitespace-nowrap">
                {t("home.cta.book")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-mb-blue via-blue-600 to-mb-blue opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              href={`/${locale}/contacts`}
              className="inline-flex items-center gap-3 justify-center border border-mb-blue/80 text-mb-blue hover:bg-mb-blue/10 hover:border-mb-blue px-6 py-3 sm:px-8 sm:py-3.5 rounded-button transition-all duration-300 text-sm sm:text-base font-medium uppercase tracking-wide backdrop-blur-sm w-full sm:w-auto min-w-[200px] sm:min-w-0"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="whitespace-nowrap">{t("home.cta.contact")}</span>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
