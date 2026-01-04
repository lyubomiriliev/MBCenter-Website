import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";
import { PatternBackground } from "./PatternBackground";

type PeriodicMaintenanceSectionProps = {
  locale: string;
};

export function PeriodicMaintenanceSection({ locale }: PeriodicMaintenanceSectionProps) {
  const t = useTranslations("periodicMaintenance");

  const serviceCategories = [
    {
      key: "periodic",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      services: ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"],
    },
    {
      key: "automatic",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      services: ["s1", "s2", "s3"],
    },
    {
      key: "manual",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
      services: ["s1"],
    },
    {
      key: "differential",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      services: ["s1", "s2", "s3"],
    },
    {
      key: "seasonal",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      services: ["s1", "s2", "s3"],
    },
  ];

  return (
    <PatternBackground className="py-32 bg-mb-black">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <AnimatedText className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mb-blue/10 border border-mb-blue/30 mb-6">
            <svg className="w-5 h-5 text-mb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-mb-blue font-semibold text-sm uppercase tracking-wider">{t("badge")}</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-xl text-mb-silver max-w-3xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="w-24 h-1 bg-mb-blue mx-auto mt-8"></div>
        </AnimatedText>

        {/* Introduction */}
        <AnimatedSection from="bottom" delay={0.2}>
          <div className="max-w-4xl mx-auto mb-16">
            <div className="relative overflow-hidden rounded-2xl border border-mb-border bg-gradient-to-br from-mb-anthracite/80 to-mb-black/80 p-8 md:p-12">
              <div className="absolute top-0 right-0 w-64 h-64 bg-mb-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-4">{t("intro.title")}</h3>
                <div className="space-y-4 text-lg text-mb-silver leading-relaxed">
                  <p>{t("intro.p1")}</p>
                  <p>{t("intro.p2")}</p>
                  <p>{t("intro.p3")}</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Service Categories */}
        <div className="space-y-12">
          {serviceCategories.map((category, categoryIndex) => (
            <AnimatedSection key={category.key} from="bottom" delay={0.1 * categoryIndex}>
              <div className="group relative overflow-hidden rounded-2xl border border-mb-border hover:border-mb-blue transition-all duration-500 bg-gradient-to-br from-mb-anthracite/60 to-mb-black/60">
                {/* Category Header */}
                <div className="relative bg-gradient-to-r from-mb-anthracite via-mb-black to-mb-anthracite p-6 md:p-8 border-b border-mb-border">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-mb-blue to-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-white">
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-mb-chrome transition-colors duration-300">
                        {t(`categories.${category.key}.title`)}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Services List */}
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.services.map((service, serviceIndex) => (
                      <div
                        key={service}
                        className="flex items-start gap-3 p-4 rounded-xl bg-mb-black/40 border border-mb-border/50 hover:border-mb-blue/50 hover:bg-mb-black/60 transition-all duration-300"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-mb-blue/20 border border-mb-blue/40 flex items-center justify-center mt-0.5">
                          <svg className="w-4 h-4 text-mb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-mb-silver leading-relaxed">
                          {t(`categories.${category.key}.${service}`)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Accent */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-mb-blue via-blue-500 to-mb-blue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Quality Guarantee */}
        <AnimatedSection from="bottom" delay={0.5}>
          <div className="mt-16 relative overflow-hidden rounded-2xl border border-mb-blue/50 bg-gradient-to-br from-mb-blue/10 to-blue-600/10 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-mb-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 max-w-4xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-mb-blue to-blue-600 flex items-center justify-center text-white">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">{t("guarantee.title")}</h3>
                  <div className="space-y-3 text-lg text-mb-chrome leading-relaxed">
                    <p>{t("guarantee.p1")}</p>
                    <p>{t("guarantee.p2")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </PatternBackground>
  );
}

