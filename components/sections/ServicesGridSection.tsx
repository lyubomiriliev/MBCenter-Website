import { ServiceCard } from '@/components/sections/ServiceCard';
import { PatternBackground } from '@/components/sections/PatternBackground';
import { AnimatedText } from '@/components/animations/AnimatedText';

type Service = {
  key: string;
  image: string;
};

type ServicesGridSectionProps = {
  title: string;
  services: Service[];
  getServiceTitle: (key: string) => string;
  getServiceDescription: (key: string) => string;
  locale: string;
};

export function ServicesGridSection({
  title,
  services,
  getServiceTitle,
  getServiceDescription,
  locale,
}: ServicesGridSectionProps) {
  return (
    <PatternBackground className="py-32 bg-mb-black">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedText className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {title}
          </h2>
          <div className="w-24 h-1 bg-mb-blue mx-auto"></div>
        </AnimatedText>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={service.key}
              title={getServiceTitle(service.key)}
              description={getServiceDescription(service.key)}
              image={service.image}
              index={index}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </PatternBackground>
  );
}

