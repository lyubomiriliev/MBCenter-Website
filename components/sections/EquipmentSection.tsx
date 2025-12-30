import { useTranslations } from "next-intl";
import { PatternBackground } from "./PatternBackground";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";

export function EquipmentSection() {
  const t = useTranslations("about");

  const equipment = ["oem", "certified", "tools"];

  return (
    <PatternBackground className="py-32 bg-mb-black">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedText className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {t("equipment.title")}
          </h2>
          <div className="w-24 h-1 bg-mb-blue mx-auto"></div>
        </AnimatedText>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {equipment.map((item, index) => (
            <AnimatedSection key={item} delay={index * 0.15} from="bottom">
              <div className="group relative bg-mb-anthracite p-10 rounded-card border border-mb-border hover:border-mb-blue transition-all duration-500 hover:shadow-2xl hover:shadow-mb-blue/20 overflow-hidden">
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-mb-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-mb-blue/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-mb-blue/20 transition-all duration-500">
                    <svg
                      className="w-8 h-8 text-mb-blue"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg text-white leading-relaxed group-hover:text-mb-chrome transition-colors duration-300">
                    {t(`equipment.${item}`)}
                  </p>
                </div>

                {/* Accent Line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-mb-blue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </PatternBackground>
  );
}

