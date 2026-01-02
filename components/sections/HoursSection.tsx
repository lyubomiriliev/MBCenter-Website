import Image from "next/image";
import { SITE_CONFIG } from "@/lib/constants";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";

type HoursSectionProps = {
  title: string;
  description: string;
};

export function HoursSection({
  title,
  description,
}: HoursSectionProps) {
  return (
    <section className="relative py-32 bg-mb-black overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/servicing-2.jpg"
          alt="Service Hours"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <AnimatedText className="text-center mb-12">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            {title}
          </h3>
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
                {SITE_CONFIG.hours.weekdays}
              </p>
              <p className="text-xl text-mb-silver leading-relaxed max-w-2xl mx-auto">
                {description}
              </p>
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 bg-mb-black/50 rounded-xl border border-mb-border/50">
                <div className="text-2xl mb-2">📞</div>
                <p className="text-sm text-mb-silver mb-2">Бърза поддръжка</p>
                <p className="text-white font-semibold">24/7 Поддръжка</p>
              </div>
              <div className="text-center p-6 bg-mb-black/50 rounded-xl border border-mb-border/50">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-sm text-mb-silver mb-2">Бърза реакция</p>
                <p className="text-white font-semibold">В рамките на 24ч</p>
              </div>
              <div className="text-center p-6 bg-mb-black/50 rounded-xl border border-mb-border/50">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-sm text-mb-silver mb-2">Потвърждение</p>
                <p className="text-white font-semibold">Веднага</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

