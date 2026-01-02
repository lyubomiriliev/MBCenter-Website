import { useTranslations } from "next-intl";
import Image from "next/image";
import { PatternBackground } from "./PatternBackground";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";

export function EquipmentSection() {
  const t = useTranslations("about");

  const equipment = [
    {
      key: "oem",
      image: "/assets/images/oem-diagnostics.png",
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
    },
    {
      key: "certified",
      image: "/assets/images/skilled-technicians.png",
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: "tools",
      image: "/assets/images/modern-equipment.png",
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative py-32 bg-mb-black overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <Image
          src="/assets/images/star-pattern-bg.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatedText className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {t("equipment.title")}
          </h2>
          <div className="w-24 h-1 bg-mb-blue mx-auto"></div>
        </AnimatedText>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {equipment.map((item, index) => (
            <AnimatedSection key={item.key} delay={index * 0.15} from="bottom">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-mb-border hover:border-mb-blue transition-all duration-500 hover:shadow-2xl hover:shadow-mb-blue/30">
                {/* Image Background */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={t(`equipment.${item.key}`)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-mb-black/60 via-mb-black/30 to-transparent group-hover:from-mb-black/70 group-hover:via-mb-black/40 group-hover:to-transparent transition-all duration-500" />

                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>

                {/* Content */}
                <div className="relative bg-mb-anthracite p-8 h-full text-center border-t border-mb-border/50">
                  <p className="text-xl text-white leading-relaxed font-medium group-hover:text-mb-chrome transition-colors duration-300">
                    {t(`equipment.${item.key}`)}
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
      </div>
    </section>
  );
}
