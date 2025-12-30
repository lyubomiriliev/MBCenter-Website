import { useTranslations } from "next-intl";
import Link from "next/link";
import { PatternBackground } from "./PatternBackground";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";

type CTABandProps = {
  locale: string;
};

export function CTABand({ locale }: CTABandProps) {
  const t = useTranslations();

  return (
    <PatternBackground className="py-24 bg-mb-anthracite" patternOpacity={0.05}>
      <div className="max-w-5xl mx-auto px-6 text-center">
        <AnimatedText>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-tight">
            {t("home.cta.title")}
          </h2>
        </AnimatedText>
        <AnimatedSection from="bottom" delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href={`/${locale}/booking`}
              className="group relative inline-flex items-center gap-2 bg-mb-blue text-white px-6 py-3 rounded-button hover:bg-mb-blue/90 transition-all duration-300 text-sm font-medium uppercase tracking-wide shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10">{t("home.cta.book")}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-mb-blue via-blue-600 to-mb-blue opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              href={`/${locale}/contacts`}
              className="border border-mb-blue/80 text-mb-blue hover:bg-mb-blue/10 px-6 py-3 rounded-button transition-all duration-300 text-sm font-medium uppercase tracking-wide backdrop-blur-sm"
            >
              {t("home.cta.contact")}
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </PatternBackground>
  );
}
