import Link from 'next/link';

type HeroProps = {
  title: string;
  subtitle: string;
  ctaPrimary?: { text: string; href: string };
  ctaSecondary?: { text: string; href: string };
  fullHeight?: boolean;
};

export function Hero({ title, subtitle, ctaPrimary, ctaSecondary, fullHeight = true }: HeroProps) {
  return (
    <section className={`flex items-center justify-center bg-mb-black ${fullHeight ? 'min-h-screen' : 'py-32'}`}>
      <div className="max-w-5xl mx-auto text-center px-6">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl text-mb-silver mb-10 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        {(ctaPrimary || ctaSecondary) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {ctaPrimary && (
              <Link
                href={ctaPrimary.href}
                className="group relative inline-flex items-center gap-2 bg-mb-blue text-white px-8 py-4 rounded-button hover:opacity-90 transition-opacity font-medium text-lg overflow-hidden"
              >
                <span className="relative z-10">{ctaPrimary.text}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-mb-blue via-blue-600 to-mb-blue opacity-100 transition-opacity duration-300" />
              </Link>
            )}
            {ctaSecondary && (
              <Link
                href={ctaSecondary.href}
                className="border border-mb-silver text-mb-silver px-8 py-4 rounded-button hover:bg-mb-anthracite transition-colors font-medium text-lg"
              >
                {ctaSecondary.text}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}


