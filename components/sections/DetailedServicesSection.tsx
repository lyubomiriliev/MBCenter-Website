import Image from "next/image";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";

type Service = {
  icon: string;
  title: string;
  description: string;
};

type ServiceCategory = {
  title: string;
  services: Service[];
  image?: string;
};

type DetailedServicesSectionProps = {
  title: string;
  subtitle: string;
  categories: ServiceCategory[];
};

const ServiceIcon = ({ index }: { index: number }) => {
  const icons = [
    // Diagnostic icons
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>,
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>,
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>,
    // Coding icons
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>,
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>,
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>,
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>,
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>,
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>,
    // Transmission icons
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>,
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>,
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>,
    // Universal icons
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>,
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>,
    <svg
      className="w-6 h-6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>,
  ];

  return icons[index % icons.length];
};

export function DetailedServicesSection({
  title,
  subtitle,
  categories,
}: DetailedServicesSectionProps) {
  return (
    <section className="relative py-32 bg-gradient-to-b from-mb-black via-mb-anthracite to-mb-black overflow-hidden">
      {/* Futuristic grid background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-mb-blue/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mb-blue/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatedText className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {title}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-mb-blue" />
            <div className="w-2 h-2 bg-mb-blue rounded-full" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-mb-blue" />
          </div>
          <p className="text-xl text-mb-silver max-w-3xl mx-auto">{subtitle}</p>
        </AnimatedText>

        <div className="space-y-16">
          {categories.map((category, categoryIndex) => (
            <AnimatedSection
              key={categoryIndex}
              from="bottom"
              delay={categoryIndex * 0.1}
            >
              <div className="group relative">
                {/* Glowing border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-mb-blue/50 to-blue-600/50 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500" />

                <div className="relative bg-gradient-to-br from-mb-black/90 to-mb-anthracite/90 rounded-2xl border border-mb-border/50 backdrop-blur-sm overflow-hidden">
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mb-blue to-transparent" />

                  {category.image && (
                    <div className="relative h-48 md:h-64 overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-mb-black via-mb-black/70 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-mb-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="flex items-center gap-4">
                          <div className="w-1 h-12 bg-mb-blue rounded-full" />
                          <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            {category.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  )}

                  {!category.image && (
                    <div className="p-8 border-b border-mb-border/30">
                      <div className="flex items-center gap-4">
                        <div className="w-1 h-12 bg-mb-blue rounded-full" />
                        <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                          {category.title}
                        </h3>
                      </div>
                    </div>
                  )}

                  <div className="p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.services.map((service, serviceIndex) => (
                        <div
                          key={serviceIndex}
                          className="group/item relative bg-mb-black/40 p-6 rounded-xl border border-mb-border/30 hover:border-mb-blue/50 transition-all duration-300 hover:shadow-lg hover:shadow-mb-blue/10 hover:-translate-y-1"
                        >
                          {/* Corner accents */}
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-mb-blue/50 rounded-tl-xl opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-mb-blue/50 rounded-br-xl opacity-0 group-hover/item:opacity-100 transition-opacity" />

                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                              <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-mb-blue/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-mb-blue/30 group-hover/item:border-mb-blue group-hover/item:shadow-lg group-hover/item:shadow-mb-blue/30 transition-all duration-300">
                                  <div className="text-mb-blue group-hover/item:scale-110 transition-transform duration-300">
                                    <ServiceIcon
                                      index={categoryIndex * 10 + serviceIndex}
                                    />
                                  </div>
                                </div>
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-mb-blue/20 rounded-xl blur-md opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-semibold text-white mb-1 group-hover/item:text-mb-blue transition-colors truncate">
                                  {service.title}
                                </h4>
                                <div className="h-0.5 w-0 bg-gradient-to-r from-mb-blue to-transparent group-hover/item:w-full transition-all duration-500" />
                              </div>
                            </div>

                            <p className="text-sm text-mb-silver leading-relaxed group-hover/item:text-mb-chrome transition-colors">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mb-blue/50 to-transparent" />
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
