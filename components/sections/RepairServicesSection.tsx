import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";

type RepairServicesSectionProps = {
  locale: string;
};

export function RepairServicesSection({ locale }: RepairServicesSectionProps) {
  const t = useTranslations("repairServices");

  const repairCategories = [
    {
      key: "suspension",
      image: "/assets/images/airmatic.webp",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      services: ["s1", "s2", "s3", "s4"],
    },
    {
      key: "engine",
      image: "/assets/images/engine.png",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      services: ["s1", "s2", "s3", "s4"],
      note: true,
    },
    {
      key: "transmission",
      image: "/assets/images/gearbox.jpg",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      services: ["s1", "s2", "s3"],
      note: true,
    },
    {
      key: "electronics",
      image: "/assets/images/coding4.webp",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
        </svg>
      ),
      services: ["s1", "s2", "s3"],
    },
    {
      key: "brakes",
      image: "/assets/images/brakes-service.png",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      services: ["s1", "s2", "s3"],
    },
  ];

  const additionalServices = ["add1", "add2"];

  return (
    <section className="py-32 bg-gradient-to-b from-mb-black via-mb-anthracite to-mb-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/assets/images/mb-pattern.webp)",
            backgroundSize: "200px",
            backgroundRepeat: "repeat",
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <AnimatedText className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mb-blue/10 border border-mb-blue/30 mb-6">
            <svg
              className="w-5 h-5 text-mb-blue"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
              />
            </svg>
            <span className="text-mb-blue font-semibold text-sm uppercase tracking-wider">
              {t("badge")}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-xl text-mb-silver max-w-3xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
          <div className="w-24 h-1 bg-mb-blue mx-auto mt-8"></div>
        </AnimatedText>

        {/* Repair Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {repairCategories.map((category, index) => (
            <AnimatedSection
              key={category.key}
              from={index % 2 === 0 ? "left" : "right"}
              delay={0.1 * index}
              className={
                index === repairCategories.length - 1 ? "lg:col-span-2" : ""
              }
            >
              <div className="group relative h-full overflow-hidden rounded-2xl border border-mb-border hover:border-mb-blue transition-all duration-500 bg-mb-black/40 hover:shadow-2xl hover:shadow-mb-blue/20">
                {/* Image Background */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={t(`categories.${category.key}.title`)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-mb-black via-mb-black/60 to-transparent"></div>

                  {/* Category Header */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-mb-blue to-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-white">
                        {category.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-mb-chrome transition-colors duration-300">
                        {t(`categories.${category.key}.title`)}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Services List */}
                <div
                  className={`p-6 ${
                    index === repairCategories.length - 1
                      ? "flex flex-row flex-wrap gap-3"
                      : "space-y-3"
                  }`}
                >
                  {category.services.map((service, serviceIndex) => (
                    <div
                      key={service}
                      className={`flex items-start gap-3 p-3 rounded-lg bg-mb-anthracite/40 border border-mb-border/30 hover:border-mb-blue/50 hover:bg-mb-anthracite/60 transition-all duration-300 ${
                        index === repairCategories.length - 1
                          ? "flex-1 min-w-[200px]"
                          : ""
                      }`}
                    >
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-mb-blue/20 border border-mb-blue/40 flex items-center justify-center mt-0.5">
                        <svg
                          className="w-3 h-3 text-mb-blue"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="text-mb-silver text-sm leading-relaxed">
                        {t(`categories.${category.key}.${service}`)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bottom Accent */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-mb-blue via-blue-500 to-mb-blue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Additional Services */}
        <AnimatedSection from="bottom" delay={0.4}>
          <div className="relative overflow-hidden rounded-2xl border border-mb-border bg-gradient-to-br from-mb-anthracite/80 to-mb-black/80 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-mb-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <svg
                  className="w-8 h-8 text-mb-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {t("additional.title")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {additionalServices.map((service) => (
                  <div
                    key={service}
                    className="flex items-start gap-3 p-4 rounded-xl bg-mb-black/40 border border-mb-border hover:border-mb-blue/50 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-mb-blue/20 border border-mb-blue/40 flex items-center justify-center mt-0.5">
                      <svg
                        className="w-4 h-4 text-mb-blue"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-mb-silver leading-relaxed">
                      {t(`additional.${service}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Quality Statement */}
        <AnimatedSection from="bottom" delay={0.6}>
          <div className="mt-8 relative overflow-hidden rounded-2xl border border-mb-blue/50 bg-gradient-to-br from-mb-blue/10 to-blue-600/10 p-8 md:p-12">
            <div className="absolute top-0 left-0 w-96 h-96 bg-mb-blue/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative z-10 max-w-4xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-mb-blue to-blue-600 flex items-center justify-center text-white">
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {t("quality.title")}
                  </h3>
                  <div className="space-y-3 text-lg text-mb-chrome leading-relaxed">
                    <p>{t("quality.p1")}</p>
                    <p>{t("quality.p2")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
