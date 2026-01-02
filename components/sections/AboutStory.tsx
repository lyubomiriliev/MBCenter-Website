import { useTranslations } from "next-intl";
import Image from "next/image";
import { PatternBackground } from "./PatternBackground";
import { AnimatedText } from "@/components/animations/AnimatedText";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

export function AboutStory() {
  const t = useTranslations("about");

  return (
    <>
      {/* Welcome Section */}
      <PatternBackground className="py-24 bg-mb-black">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedText className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              {t("welcome.title")}
            </h2>
            <div className="w-24 h-1 bg-mb-blue mx-auto"></div>
          </AnimatedText>
        </div>
      </PatternBackground>

      {/* Mission Section with Image */}
      <section className="relative overflow-hidden bg-mb-anthracite">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <AnimatedSection from="left">
            <div className="relative h-[400px] lg:h-[600px]">
              <Image
                src="/assets/images/wallpaper.avif"
                alt="MB Center Workshop"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-mb-anthracite/80 to-transparent lg:from-transparent lg:to-mb-anthracite/80" />
            </div>
          </AnimatedSection>

          {/* Text */}
          <AnimatedSection from="right">
            <div className="flex items-center h-full p-8 lg:p-16">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-mb-blue/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-mb-blue"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  {t("mission.title")}
                </h3>
                <p className="text-lg text-mb-silver leading-relaxed">
                  {t("mission.content")}
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Why Choose Section with Image */}
      <section className="relative overflow-hidden bg-mb-black">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Text */}
          <AnimatedSection from="left">
            <div className="flex items-center h-full p-8 lg:p-16 order-2 lg:order-1">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-mb-blue/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-mb-blue"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {t("whyChoose.title")}
                </h3>
                <p className="text-lg text-mb-silver leading-relaxed">
                  {t("whyChoose.content")}
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Image */}
          <AnimatedSection from="right">
            <div className="relative h-[400px] lg:h-[600px] order-1 lg:order-2">
              <Image
                src="/assets/images/oem-parts.jpg"
                alt="OEM Parts"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-mb-black/80 to-transparent lg:from-transparent lg:to-mb-black/80" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Expert Service Section with Image */}
      <section className="relative overflow-hidden bg-mb-anthracite">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <AnimatedSection from="left">
            <div className="relative h-[400px] lg:h-[600px]">
              <Image
                src="/assets/images/gallery/gle-w167.jpg"
                alt="Expert Service"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-mb-anthracite/80 to-transparent lg:from-transparent lg:to-mb-anthracite/80" />
            </div>
          </AnimatedSection>

          {/* Text */}
          <AnimatedSection from="right">
            <div className="flex items-center h-full p-8 lg:p-16">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-mb-blue/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-mb-blue"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  {t("expertService.title")}
                </h3>
                <p className="text-lg text-mb-silver leading-relaxed">
                  {t("expertService.content")}
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Cars for Sale Section with Image */}
      <section className="relative overflow-hidden bg-mb-black">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Text */}
          <AnimatedSection from="left">
            <div className="flex items-center h-full p-8 lg:p-16 order-2 lg:order-1">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-mb-blue/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-mb-blue"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  {t("carsForSale.title")}
                </h3>
                <p className="text-lg text-mb-silver leading-relaxed">
                  {t("carsForSale.content")}
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Image */}
          <AnimatedSection from="right">
            <div className="relative h-[400px] lg:h-[600px] order-1 lg:order-2">
              <Image
                src="/assets/images/glb-ev1.avif"
                alt="Cars for Sale"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-mb-black/80 to-transparent lg:from-transparent lg:to-mb-black/80" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* All Clients Section with Image */}
      <section className="relative overflow-hidden bg-mb-anthracite">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <AnimatedSection from="left">
            <div className="relative h-[400px] lg:h-[600px]">
              <Image
                src="/assets/images/gallery/w223.jpg"
                alt="All Clients"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-mb-anthracite/80 to-transparent lg:from-transparent lg:to-mb-anthracite/80" />
            </div>
          </AnimatedSection>

          {/* Text */}
          <AnimatedSection from="right">
            <div className="flex items-center h-full p-8 lg:p-16">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-mb-blue/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-mb-blue"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  {t("allClients.title")}
                </h3>
                <p className="text-lg text-mb-silver leading-relaxed">
                  {t("allClients.content")}
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <PatternBackground className="py-24 bg-mb-black">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatedSection from="bottom">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8"></div>
              <p className="text-2xl md:text-3xl text-white font-semibold leading-relaxed mb-4">
                {t("cta.content")}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </PatternBackground>
    </>
  );
}
