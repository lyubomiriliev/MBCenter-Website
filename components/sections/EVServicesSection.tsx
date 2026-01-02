import Image from "next/image";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

type EVServicesSectionProps = {
  diagnosticsTitle: string;
  diagnosticsDescription: string;
  multimediaDescription: string;
};

export function EVServicesSection({
  diagnosticsTitle,
  diagnosticsDescription,
  multimediaDescription,
}: EVServicesSectionProps) {
  return (
    <section className="py-32 bg-mb-anthracite relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <Image
          src="/assets/images/star-pattern-bg.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection from="left">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                {diagnosticsTitle}
              </h2>
              <div className="w-20 h-1 bg-mb-blue mb-8"></div>
              <p className="text-xl text-mb-silver leading-relaxed mb-6">
                {diagnosticsDescription}
              </p>
              <p className="text-lg text-mb-chrome leading-relaxed">
                {multimediaDescription}
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection from="right">
            <div className="relative h-[500px] rounded-card overflow-hidden border border-mb-border">
              <Image
                src="/assets/images/ev1.avif"
                alt="Mercedes EV Service"
                fill
                className="object-cover"
              />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
