import { PatternBackground } from '@/components/sections/PatternBackground';
import { AnimatedText } from '@/components/animations/AnimatedText';
import { GalleryGrid } from '@/components/sections/GalleryGrid';

type GalleryImage = {
  src: string;
  alt: string;
  category?: string;
};

type GallerySectionProps = {
  title: string;
  subtitle: string;
  images: GalleryImage[];
};

export function GallerySection({
  title,
  subtitle,
  images,
}: GallerySectionProps) {
  return (
    <PatternBackground className="py-32 bg-mb-black">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedText className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {title}
          </h2>
          <div className="w-24 h-1 bg-mb-blue mx-auto mb-8"></div>
          <p className="text-xl text-mb-silver max-w-3xl mx-auto">
            {subtitle}
          </p>
        </AnimatedText>

        <GalleryGrid images={images} />
      </div>
    </PatternBackground>
  );
}

