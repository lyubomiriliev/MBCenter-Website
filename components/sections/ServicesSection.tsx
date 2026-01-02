import { useTranslations } from "next-intl";
import Link from "next/link";
import { ServiceCard } from "./ServiceCard";
import { PatternBackground } from "./PatternBackground";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";

type ServicesSectionProps = {
  locale: string;
};

export function ServicesSection({ locale }: ServicesSectionProps) {
  const t = useTranslations();

  const services = [
    {
      key: "maintenance",
      image: "/assets/images/servicing.jpg",
    },
    {
      key: "diagnostics",
      image: "/assets/images/diagnosis3.webp",
    },
    {
      key: "coding",
      image: "/assets/images/coding.webp",
    },
    {
      key: "multimedia",
      image: "/assets/images/coding2.webp",
    },
    {
      key: "parts",
      image: "/assets/images/oem-parts.jpg",
    },
    {
      key: "inspection",
      image: "/assets/images/inspection.webp",
    },
  ];

  return (
    <PatternBackground className="py-32 bg-mb-black">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatedText className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {t("home.services.title")}
          </h2>
          <div className="w-24 h-1 bg-mb-blue mx-auto"></div>
        </AnimatedText>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <ServiceCard
              key={service.key}
              title={t(`services.${service.key}.title`)}
              description={t(`services.${service.key}.desc`)}
              image={service.image}
              index={index}
              locale={locale}
            />
          ))}
        </div>

        <AnimatedSection from="fade" delay={0.5}>
          <div className="text-center">
            <Link
              href={`/${locale}/services`}
              className="inline-flex items-center gap-3 text-mb-blue hover:text-white transition-colors font-medium text-lg group"
            >
              {t("home.services.viewAll")}
              <svg
                className="w-6 h-6 group-hover:translate-x-2 transition-transform"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </PatternBackground>
  );
}


