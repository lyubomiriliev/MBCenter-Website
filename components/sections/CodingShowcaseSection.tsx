import Link from 'next/link';
import { ParallaxImage } from '@/components/sections/ParallaxImage';
import { AnimatedSection } from '@/components/animations/AnimatedSection';

type CodingShowcaseSectionProps = {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
};

export function CodingShowcaseSection({
  title,
  description,
  ctaText,
  ctaHref,
}: CodingShowcaseSectionProps) {
  return (
    <div className="relative h-[600px] overflow-hidden">
      <ParallaxImage
        src="/assets/images/coding2.webp"
        alt="Mercedes Coding"
        speed={0.4}
        className="h-full"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <AnimatedSection from="left">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                {title}
              </h2>
              <p className="text-xl text-mb-chrome mb-8 leading-relaxed">
                {description}
              </p>
              <Link
                href={ctaHref}
                className="group relative inline-block bg-mb-blue text-white px-6 py-3 rounded-button hover:bg-mb-blue/90 transition-all duration-300 text-sm font-medium uppercase tracking-wide shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10">{ctaText}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-mb-blue via-blue-600 to-mb-blue opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}

