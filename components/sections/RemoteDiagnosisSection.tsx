import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";
import { PatternBackground } from "./PatternBackground";

type RemoteDiagnosisSectionProps = {
  locale: string;
};

export function RemoteDiagnosisSection({ locale }: RemoteDiagnosisSectionProps) {
  const t = useTranslations("remoteDiagnosis");

  const advantages = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      key: "adv1",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      key: "adv2",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      key: "adv3",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      key: "adv4",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      key: "adv5",
    },
  ];

  return (
    <PatternBackground className="py-32 bg-mb-anthracite">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <AnimatedText className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mb-blue/10 border border-mb-blue/30 mb-6">
            <svg className="w-5 h-5 text-mb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Image Side */}
          <AnimatedSection from="left" delay={0.2}>
            <div className="relative h-full min-h-[500px] rounded-2xl overflow-hidden group">
              <Image
                src="/assets/images/coding4.webp"
                alt={t("title")}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-mb-black/90 via-mb-black/40 to-transparent"></div>
              
              {/* Overlay Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mb-blue/20 backdrop-blur-md border border-mb-blue/40 mb-4">
                  <svg className="w-5 h-5 text-mb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className="text-white font-semibold text-sm">XENTRY Remote</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{t("imageCaption")}</h3>
                <p className="text-mb-chrome">{t("imageDescription")}</p>
              </div>
            </div>
          </AnimatedSection>

          {/* Content Side */}
          <AnimatedSection from="right" delay={0.3}>
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">{t("what.title")}</h3>
                <p className="text-lg text-mb-silver leading-relaxed mb-4">
                  {t("what.description")}
                </p>
              </div>

              <div className="space-y-4">
                {["capability1", "capability2", "capability3"].map((cap, index) => (
                  <div key={cap} className="flex items-start gap-4 p-4 rounded-xl bg-mb-black/40 border border-mb-border hover:border-mb-blue/50 transition-all duration-300">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-mb-blue mt-2"></div>
                    <p className="text-mb-silver">{t(`what.${cap}`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Advantages Grid */}
        <AnimatedSection from="bottom" delay={0.4}>
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-white mb-4 text-center">{t("advantages.title")}</h3>
            <p className="text-lg text-mb-silver text-center max-w-2xl mx-auto mb-12">
              {t("advantages.subtitle")}
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-16">
          {advantages.map((advantage, index) => (
            <AnimatedSection 
              key={advantage.key} 
              from="bottom" 
              delay={0.1 * index}
              className={index < 2 ? "md:col-span-1 lg:col-span-3" : "md:col-span-1 lg:col-span-2"}
            >
              <div className="group relative h-full p-6 rounded-2xl bg-gradient-to-br from-mb-black/60 to-mb-anthracite/60 border border-mb-border hover:border-mb-blue transition-all duration-500 hover:shadow-2xl hover:shadow-mb-blue/20">
                <div className="flex flex-col h-full">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-mb-blue to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-white">
                    {advantage.icon}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-mb-chrome transition-colors duration-300">
                    {t(`advantages.${advantage.key}.title`)}
                  </h4>
                  <p className="text-mb-silver leading-relaxed flex-grow">
                    {t(`advantages.${advantage.key}.description`)}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-mb-blue via-blue-500 to-mb-blue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Supported Models */}
        <AnimatedSection from="bottom" delay={0.5}>
          <div className="relative overflow-hidden rounded-2xl border border-mb-border bg-gradient-to-br from-mb-black/80 to-mb-anthracite/80 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-mb-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-8 h-8 text-mb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-2xl md:text-3xl font-bold text-white">{t("models.title")}</h3>
              </div>
              <p className="text-lg text-mb-silver mb-6 leading-relaxed">
                {t("models.description")}
              </p>
              <div className="flex flex-wrap gap-3">
                {["E-Class", "S-Class", "GLE", "GLC", "C-Class", "A-Class", "EQC", "EQS", "EQE"].map((model) => (
                  <span
                    key={model}
                    className="px-4 py-2 rounded-full bg-mb-blue/10 border border-mb-blue/30 text-mb-chrome font-semibold hover:bg-mb-blue/20 hover:border-mb-blue/50 transition-all duration-300"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </PatternBackground>
  );
}

