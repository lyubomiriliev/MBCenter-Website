import Image from "next/image";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";
import { useTranslations } from "next-intl";

type HoursSectionProps = {
  title: string;
  description: string;
};

export function HoursSection({ title, description }: HoursSectionProps) {
  const t = useTranslations("booking.hours");
  return (
    <section className="relative py-32 bg-mb-black overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/oem-diagnostics.png"
          alt="Service Hours"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <AnimatedText className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            {title}
          </h2>
          <div className="w-24 h-1 bg-mb-blue mx-auto mb-8"></div>
        </AnimatedText>

        <AnimatedSection from="bottom" delay={0.2}>
          <div className="bg-mb-anthracite/90 backdrop-blur-md rounded-2xl border border-mb-border p-8 md:p-12 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-mb-blue to-blue-600 mb-6 shadow-xl">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-4xl md:text-5xl text-mb-blue font-bold mb-6">
                {t("hours")}
              </p>
              <p className="text-xl text-mb-silver leading-relaxed max-w-2xl mx-auto">
                {description}
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
