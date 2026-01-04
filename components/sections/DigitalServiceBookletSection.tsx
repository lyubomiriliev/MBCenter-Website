import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";

type DigitalServiceBookletSectionProps = {
  locale: string;
};

export function DigitalServiceBookletSection({ locale }: DigitalServiceBookletSectionProps) {
  const t = useTranslations("digitalServiceBooklet");

  const benefits = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
      key: "benefit1",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      key: "benefit2",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      key: "benefit3",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      key: "benefit4",
    },
  ];

  const requirements = ["req1", "req2"];

  return (
    <section className="py-32 bg-gradient-to-br from-mb-black via-mb-anthracite to-mb-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-mb-blue/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <AnimatedText className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mb-blue/10 border border-mb-blue/30 mb-6">
            <svg className="w-5 h-5 text-mb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Left: Explanation */}
          <AnimatedSection from="left" delay={0.2}>
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl border border-mb-border bg-gradient-to-br from-mb-black/80 to-mb-anthracite/60 p-8">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <svg className="w-8 h-8 text-mb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t("what.title")}
                </h3>
                <p className="text-lg text-mb-silver leading-relaxed mb-4">
                  {t("what.description")}
                </p>
                <div className="space-y-3">
                  {["point1", "point2", "point3", "point4"].map((point, index) => (
                    <div key={point} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-mb-blue/20 border border-mb-blue/40 flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-mb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-mb-silver">{t(`what.${point}`)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="relative overflow-hidden rounded-2xl border border-mb-border bg-gradient-to-br from-mb-black/80 to-mb-anthracite/60 p-8">
                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {t("requirements.title")}
                </h4>
                <ul className="space-y-3">
                  {requirements.map((req, index) => (
                    <li key={req} className="flex items-start gap-3 text-mb-silver">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-500 text-sm font-bold mt-0.5">
                        {index + 1}
                      </span>
                      <span>{t(`requirements.${req}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </AnimatedSection>

          {/* Right: Benefits */}
          <AnimatedSection from="right" delay={0.3}>
            <div className="relative h-full min-h-[500px] rounded-2xl overflow-hidden group mb-8">
              <Image
                src="/assets/images/gallery/w223.jpg"
                alt="Digital Service Booklet"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-mb-black via-mb-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-white font-semibold text-sm">Mercedes-Benz DSB</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{t("imageCaption")}</h3>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Benefits Grid */}
        <AnimatedSection from="bottom" delay={0.4}>
          <div className="mb-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">{t("benefits.title")}</h3>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <AnimatedSection key={benefit.key} from="bottom" delay={0.1 * index}>
              <div className="group relative h-full p-6 rounded-2xl bg-gradient-to-br from-mb-black/60 to-mb-anthracite/60 border border-mb-border hover:border-mb-blue transition-all duration-500 hover:shadow-2xl hover:shadow-mb-blue/20 hover:-translate-y-1">
                <div className="flex flex-col h-full">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-mb-blue to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-white">
                    {benefit.icon}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-mb-chrome transition-colors duration-300">
                    {t(`benefits.${benefit.key}.title`)}
                  </h4>
                  <p className="text-mb-silver leading-relaxed flex-grow text-sm">
                    {t(`benefits.${benefit.key}.description`)}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-mb-blue via-blue-500 to-mb-blue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

