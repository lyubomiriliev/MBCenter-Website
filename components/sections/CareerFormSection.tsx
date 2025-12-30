import { PatternBackground } from '@/components/sections/PatternBackground';
import { AnimatedText } from '@/components/animations/AnimatedText';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { CareerApplicationForm } from '@/components/forms/CareerApplicationForm';

type CareerFormSectionProps = {
  title: string;
  subtitle: string;
};

export function CareerFormSection({
  title,
  subtitle,
}: CareerFormSectionProps) {
  return (
    <PatternBackground id="career-application-form" className="py-32 bg-mb-black scroll-mt-24">
      <div className="max-w-4xl mx-auto px-6">
        <AnimatedText className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            {title}
          </h2>
          <div className="w-24 h-1 bg-mb-blue mx-auto mb-6"></div>
          <p className="text-xl text-mb-silver max-w-2xl mx-auto">
            {subtitle}
          </p>
        </AnimatedText>

        <AnimatedSection from="bottom" delay={0.2}>
          <div className="bg-mb-anthracite rounded-card border border-mb-border p-8 md:p-12">
            <CareerApplicationForm />
          </div>
        </AnimatedSection>
      </div>
    </PatternBackground>
  );
}

