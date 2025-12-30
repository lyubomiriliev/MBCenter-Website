"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";

type EVSectionProps = {
  locale: string;
};

export function EVSection({ locale }: EVSectionProps) {
  const t = useTranslations();

  const evFeatures = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      titleKey: "highVoltage",
      descriptionKey: "highVoltageDesc",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      titleKey: "battery",
      descriptionKey: "batteryDesc",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      titleKey: "drivetrain",
      descriptionKey: "drivetrainDesc",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      titleKey: "charging",
      descriptionKey: "chargingDesc",
    },
  ];

  return (
    <section className="relative py-16 md:py-32 bg-gradient-to-b from-mb-black via-mb-anthracite to-mb-black overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 173, 239, 0.2) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 173, 239, 0.2) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <AnimatedText className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 md:gap-3 mb-4 md:mb-6 px-4 md:px-6 py-2 md:py-3 bg-mb-blue/10 rounded-full border border-mb-blue/30">
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-mb-blue"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-mb-blue font-semibold uppercase tracking-wider text-xs md:text-sm">
              {t("home.ev.badge")}
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 tracking-tight px-4">
            {t("home.ev.title")}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-mb-blue to-transparent mx-auto mb-6 md:mb-8" />
          <p className="text-base md:text-xl text-mb-silver max-w-3xl mx-auto leading-relaxed px-4">
            {t("home.ev.subtitle")}
          </p>
        </AnimatedText>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Left Side - Images */}
          <AnimatedSection from="left" delay={0.2}>
            <div className="relative h-full min-h-[400px] md:min-h-[500px]">
              {/* Main Image */}
              <div className="relative h-[350px] md:h-[400px] rounded-2xl overflow-hidden border border-mb-blue/30 shadow-2xl shadow-mb-blue/20">
                <Image
                  src="/assets/images/glb-ev2.jpg"
                  alt="Mercedes EQ Electric Vehicle"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Small Images - Hidden on mobile, visible on md+ */}
              <div className="hidden md:block absolute -bottom-10 -left-6 w-80 h-56 rounded-2xl overflow-hidden border-1 border-mb-black shadow-xl">
                <Image
                  src="/assets/images/ev-repair.jpg"
                  alt="EV Repair Service"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="hidden md:block absolute -bottom-6 -right-4 w-60 h-40 rounded-2xl overflow-hidden border-1 border-mb-black shadow-xl">
                <Image
                  src="/assets/images/glb-ev1.avif"
                  alt="EV Diagnostics"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </AnimatedSection>

          {/* Right Side - Features */}
          <div className="flex flex-col justify-center mt-8 lg:mt-0">
            <div className="space-y-4 md:space-y-6">
              {evFeatures.map((feature, index) => (
                <AnimatedSection key={index} from="right" delay={0.1 * index}>
                  <div className="group relative">
                    {/* Glow effect on hover */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-mb-blue to-blue-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300" />

                    <div className="relative bg-mb-anthracite/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-mb-border hover:border-mb-blue transition-all duration-300">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-mb-blue/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-mb-blue/30 text-mb-blue group-hover:scale-110 group-hover:border-mb-blue transition-all duration-300">
                          {feature.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-bold text-white mb-1.5 md:mb-2 group-hover:text-mb-blue transition-colors">
                            {t(`home.ev.features.${feature.titleKey}`)}
                          </h3>
                          <p className="text-mb-silver text-sm leading-relaxed">
                            {t(`home.ev.features.${feature.descriptionKey}`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <AnimatedSection from="bottom" delay={0.4}>
          <div className="text-center px-4">
            <Link
              href={`/${locale}/services`}
              className="group relative inline-flex items-center gap-2 md:gap-3 bg-mb-blue text-white px-6 md:px-8 py-3 md:py-4 rounded-button hover:bg-mb-blue/90 transition-all duration-300 text-sm md:text-base font-medium uppercase tracking-wide shadow-xl hover:shadow-2xl hover:shadow-mb-blue/50 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10">{t("home.ev.cta")}</span>
              <svg
                className="w-4 h-4 md:w-5 md:h-5 relative z-10 group-hover:translate-x-1 transition-transform"
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
          </div>
        </AnimatedSection>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-mb-blue to-transparent opacity-50" />
    </section>
  );
}
