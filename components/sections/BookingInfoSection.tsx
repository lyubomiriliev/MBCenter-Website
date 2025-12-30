import { SITE_CONFIG } from '@/lib/constants';
import { AnimatedSection } from '@/components/animations/AnimatedSection';

type BookingInfoSectionProps = {
  title: string;
  steps: string[];
  getStepText: (key: string) => string;
  ctaText: string;
  orText: string;
  callUsText: string;
};

export function BookingInfoSection({
  title,
  steps,
  getStepText,
  ctaText,
  orText,
  callUsText,
}: BookingInfoSectionProps) {
  return (
    <section className="py-24 bg-mb-black">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-12 text-center tracking-tight">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {steps.map((step, index) => (
            <AnimatedSection key={step} delay={index * 0.1} from="bottom">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-mb-blue rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                  {index + 1}
                </div>
                <p className="text-lg text-mb-silver pt-1">{getStepText(step)}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Google Calendar Booking */}
        <AnimatedSection from="bottom" delay={0.5}>
          <div className="text-center space-y-8">
            <div className="bg-mb-anthracite p-8 rounded-card border border-mb-border">
              <h3 className="text-2xl font-bold text-white mb-6">
                {ctaText}
              </h3>
              <p className="text-mb-silver mb-8">
                Select a convenient time for your service appointment using our Google Calendar booking system.
              </p>
              <a
                href={SITE_CONFIG.booking.googleCalendar}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-block bg-mb-blue text-white px-10 py-4 rounded-button hover:bg-mb-blue/90 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10">Book via Google Calendar</span>
                <div className="absolute inset-0 bg-gradient-to-r from-mb-blue via-blue-600 to-mb-blue opacity-100 transition-opacity duration-300" />
              </a>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-mb-border"></div>
              <p className="text-mb-silver uppercase text-sm tracking-wider">{orText}</p>
              <div className="flex-1 h-px bg-mb-border"></div>
            </div>

            <div className="bg-mb-anthracite p-8 rounded-card border border-mb-border">
              <p className="text-mb-silver mb-4 text-lg">{callUsText}</p>
              <a
                href={`tel:${SITE_CONFIG.phone}`}
                className="text-3xl font-bold text-white hover:text-mb-blue transition-colors inline-flex items-center gap-3 group"
              >
                <svg
                  className="w-8 h-8 text-mb-blue group-hover:scale-110 transition-transform"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {SITE_CONFIG.phone}
              </a>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

