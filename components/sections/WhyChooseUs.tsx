import { useTranslations } from "next-intl";
import Image from "next/image";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";

export function WhyChooseUs() {
  const t = useTranslations();

  return (
    <section className="py-32 bg-mb-surface relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/mb-pattern.webp"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-mb-black/90"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatedText className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {t("home.valueProps.title")}
          </h2>
          <div className="w-24 h-1 bg-mb-blue mx-auto"></div>
        </AnimatedText>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <AnimatedSection delay={0.1} from="bottom">
            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-mb-anthracite border-2 border-mb-blue flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <svg
                    className="w-12 h-12 text-mb-blue"
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
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {t("home.valueProps.oemTitle")}
              </h3>
              <p className="text-mb-silver leading-relaxed text-center">
                {t("home.valueProps.oemDesc")}
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2} from="bottom">
            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-mb-anthracite border-2 border-mb-blue flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <svg
                    className="w-12 h-12 text-mb-blue"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {t("home.valueProps.partnerTitle")}
              </h3>
              <p className="text-mb-silver leading-relaxed text-center">
                {t("home.valueProps.partnerDesc")}
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.3} from="bottom">
            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-mb-anthracite border-2 border-mb-blue flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <svg
                    className="w-12 h-12 text-mb-blue"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {t("home.valueProps.experienceTitle")}
              </h3>
              <p className="text-mb-silver leading-relaxed text-center">
                {t("home.valueProps.experienceDesc")}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
