import Link from "next/link";
import { PatternBackground } from "@/components/sections/PatternBackground";
import { AnimatedText } from "@/components/animations/AnimatedText";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

type ServicesCTASectionProps = {
  title: string;
  ctaText: string;
  ctaHref: string;
};

export function ServicesCTASection({
  title,
  ctaText,
  ctaHref,
}: ServicesCTASectionProps) {
  return (
    <PatternBackground className="py-24 bg-mb-anthracite" patternOpacity={1}>
      <div className="max-w-4xl mx-auto text-center px-6">
        <AnimatedText>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-tight">
            {title}
          </h2>
        </AnimatedText>
        <AnimatedSection from="bottom" delay={0.2}>
          <Link
            href={ctaHref}
            className="inline-block bg-white text-mb-blue px-6 py-3 rounded-button hover:bg-mb-chrome transition-all duration-300 text-sm font-medium uppercase tracking-wide shadow-lg hover:shadow-xl hover:scale-105"
          >
            {ctaText}
          </Link>
        </AnimatedSection>
      </div>
    </PatternBackground>
  );
}
