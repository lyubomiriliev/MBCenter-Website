import Image from "next/image";
import { SITE_CONFIG } from "@/lib/constants";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";
import { PatternBackground } from "./PatternBackground";

type BookingInfoSectionProps = {
  title: string;
  steps: string[];
  getStepText: (key: string) => string;
  ctaText: string;
  orText: string;
  callUsText: string;
};

const stepImages = [
  "/assets/images/servicing.jpg",
  "/assets/images/coding.webp",
  "/assets/images/diagnosis3.webp",
  "/assets/images/oem-parts.jpg",
];

export function BookingInfoSection({
  title,
  steps,
  getStepText,
  ctaText,
  orText,
  callUsText,
}: BookingInfoSectionProps) {
  return (
    <PatternBackground className="py-32 bg-mb-black">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatedText className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            {title}
          </h2>
          <div className="w-24 h-1 bg-mb-blue mx-auto"></div>
        </AnimatedText>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {steps.map((step, index) => (
            <AnimatedSection key={step} delay={index * 0.1} from="bottom">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-mb-border hover:border-mb-blue transition-all duration-500 hover:shadow-2xl hover:shadow-mb-blue/30">
                {/* Image Background */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={stepImages[index] || stepImages[0]}
                    alt={getStepText(step)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Black Overlay */}
                  <div className="absolute inset-0 bg-black/70 group-hover:bg-black/60 transition-colors duration-500"></div>
                  
                  {/* Step Number Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mb-blue to-blue-600 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <span className="text-white font-bold text-lg">{index + 1}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative bg-mb-anthracite p-6 border-t border-mb-border/50">
                  <p className="text-lg text-white leading-relaxed font-medium group-hover:text-mb-chrome transition-colors duration-300">
                    {getStepText(step)}
                  </p>
                  
                  {/* Bottom Accent Line */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-mb-blue via-blue-500 to-mb-blue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>

                {/* Corner Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-mb-blue/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2"></div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Booking Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Google Calendar Booking Card */}
          <AnimatedSection from="left" delay={0.5}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-mb-border hover:border-mb-blue transition-all duration-500 hover:shadow-2xl hover:shadow-mb-blue/30">
              {/* Image Background */}
              <div className="absolute inset-0">
                <Image
                  src="/assets/images/gallery/w223.jpg"
                  alt="Book Appointment"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Black Overlay */}
                <div className="absolute inset-0 bg-black/75 group-hover:bg-black/70 transition-colors duration-500"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-8 lg:p-10 h-full flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mb-blue to-blue-600 flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-mb-chrome transition-colors duration-300">
                    {ctaText}
                  </h3>
                  <p className="text-lg text-mb-silver leading-relaxed mb-8">
                    Изберете удобно време за вашата услуга чрез нашата система за резервации.
                  </p>
                </div>
                <a
                  href={SITE_CONFIG.booking.googleCalendar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn relative inline-flex items-center justify-center gap-2 bg-mb-blue text-white px-8 py-4 rounded-button hover:bg-mb-blue/90 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden w-full sm:w-auto"
                >
                  <span className="relative z-10">Резервирай с Google</span>
                  <svg
                    className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform"
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
                </a>
              </div>
            </div>
          </AnimatedSection>

          {/* Divider */}
          <div className="lg:hidden flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-mb-border"></div>
            <p className="text-mb-silver uppercase text-sm tracking-wider">{orText}</p>
            <div className="flex-1 h-px bg-mb-border"></div>
          </div>

          {/* Phone Booking Card */}
          <AnimatedSection from="right" delay={0.6}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-mb-border hover:border-mb-blue transition-all duration-500 hover:shadow-2xl hover:shadow-mb-blue/30">
              {/* Image Background */}
              <div className="absolute inset-0">
                <Image
                  src="/assets/images/gallery/gle-w167.jpg"
                  alt="Call Us"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Black Overlay */}
                <div className="absolute inset-0 bg-black/75 group-hover:bg-black/70 transition-colors duration-500"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-8 lg:p-10 h-full flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mb-blue to-blue-600 flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-mb-chrome transition-colors duration-300">
                    {callUsText}
                  </h3>
                  <p className="text-lg text-mb-silver leading-relaxed mb-8">
                    Свържете се с нас директно за бърза резервация и персонализирано обслужване.
                  </p>
                </div>
                <a
                  href={`tel:${SITE_CONFIG.phone.replace(/\s/g, "")}`}
                  className="group/btn inline-flex items-center justify-center gap-3 bg-mb-anthracite/90 backdrop-blur-sm border-2 border-mb-blue text-white px-8 py-4 rounded-button hover:bg-mb-blue transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
                >
                  <svg
                    className="w-6 h-6 group-hover/btn:scale-110 transition-transform"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-xl font-bold">{SITE_CONFIG.phone}</span>
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </PatternBackground>
  );
}

