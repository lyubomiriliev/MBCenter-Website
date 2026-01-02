import Image from "next/image";
import Link from "next/link";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";

type SpecializedService = {
  title: string;
  description: string;
  features: string[];
  image: string;
  icon?: string;
};

type SpecializedServicesSectionProps = {
  title: string;
  subtitle: string;
  services: SpecializedService[];
  ctaText: string;
  ctaHref: string;
};

export function SpecializedServicesSection({
  title,
  subtitle,
  services,
  ctaText,
  ctaHref,
}: SpecializedServicesSectionProps) {
  return (
    <section className="py-32 bg-mb-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <Image
          src="/assets/images/star-pattern-bg.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatedText className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {title}
          </h2>
          <div className="w-24 h-1 bg-mb-blue mx-auto mb-8"></div>
          <p className="text-xl text-mb-silver max-w-3xl mx-auto">{subtitle}</p>
        </AnimatedText>

        <div className="space-y-16">
          {services.map((service, index) => (
            <AnimatedSection
              key={index}
              from={index % 2 === 0 ? "left" : "right"}
              delay={0.1}
            >
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="relative h-80 lg:h-96 rounded-card overflow-hidden border border-mb-border group">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                </div>

                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    {service.title}
                  </h3>

                  <p className="text-lg text-mb-silver mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, featIndex) => (
                      <li key={featIndex} className="flex items-start gap-3">
                        <svg
                          className="w-6 h-6 text-mb-blue flex-shrink-0 mt-1"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-mb-chrome leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={ctaHref}
                    className="group relative inline-flex items-center gap-2 bg-mb-blue text-white px-6 py-3 rounded-button hover:bg-mb-blue/90 transition-all duration-300 text-sm font-medium uppercase tracking-wide shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
                  >
                    <span className="relative z-10">{ctaText}</span>
                    <svg
                      className="w-5 h-5 relative z-10"
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
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
