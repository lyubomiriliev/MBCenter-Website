import { SITE_CONFIG } from '@/lib/constants';

type HoursSectionProps = {
  title: string;
  description: string;
};

export function HoursSection({
  title,
  description,
}: HoursSectionProps) {
  return (
    <section className="py-16 bg-mb-anthracite">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h3 className="text-2xl font-bold text-white mb-6">{title}</h3>
        <p className="text-3xl text-mb-blue font-bold mb-4">
          {SITE_CONFIG.hours.weekdays}
        </p>
        <p className="text-lg text-mb-silver">
          {description}
        </p>
      </div>
    </section>
  );
}

