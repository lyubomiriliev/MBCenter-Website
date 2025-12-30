type BenefitsSectionProps = {
  title: string;
  benefits: string[];
  getBenefitText: (key: string) => string;
};

export function BenefitsSection({
  title,
  benefits,
  getBenefitText,
}: BenefitsSectionProps) {
  return (
    <section className="py-24 bg-mb-anthracite">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white mb-12 text-center tracking-tight">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <div key={benefit} className="text-center">
              <div className="w-16 h-16 bg-mb-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-mb-blue" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg text-white">{getBenefitText(benefit)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

