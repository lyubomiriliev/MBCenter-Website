import { PatternBackground } from "@/components/sections/PatternBackground";
import { AnimatedText } from "@/components/animations/AnimatedText";
import { GalleryGrid } from "@/components/sections/GalleryGrid";

type GalleryProject = {
  id: string;
  title: string;
  description: {
    bg: string;
    en: string;
  };
  images: string[];
};

type GallerySectionProps = {
  title: string;
  projects: GalleryProject[];
  locale: string;
};

export function GallerySection({
  title,
  projects,
  locale,
}: GallerySectionProps) {
  return (
    <PatternBackground className="py-32 bg-mb-black">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedText className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {title}
          </h2>
          <div className="w-24 h-1 bg-mb-blue mx-auto mb-8"></div>
        </AnimatedText>

        <GalleryGrid projects={projects} locale={locale} />
      </div>
    </PatternBackground>
  );
}
