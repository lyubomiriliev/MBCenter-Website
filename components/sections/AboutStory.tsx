import { useTranslations } from "next-intl";
import Image from "next/image";
import { PatternBackground } from "./PatternBackground";
import { AnimatedText } from "@/components/animations/AnimatedText";

export function AboutStory() {
  const t = useTranslations("about");

  return (
    <section className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Text Content */}
        <PatternBackground className="py-24 lg:py-32 bg-mb-anthracite flex items-center">
          <div className="max-w-2xl mx-auto px-6 lg:px-12">
            <AnimatedText>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                {t("story.title")}
              </h2>
              <div className="w-20 h-1 bg-mb-blue mb-8"></div>
              <p className="text-xl text-mb-silver leading-relaxed mb-6">
                {t("story.content")}
              </p>
              <p className="text-lg text-mb-chrome leading-relaxed">
                {t("equipment.title")}
              </p>
            </AnimatedText>
          </div>
        </PatternBackground>

        {/* Image */}
        <div className="relative h-[500px] lg:h-auto">
          <Image
            src="/assets/images/wallpaper.avif"
            alt="MB Center Workshop"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-mb-anthracite/50 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}

