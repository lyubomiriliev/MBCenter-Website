"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";

type ImageHeroProps = {
  title: string;
  subtitle: string;
  imageSrc: string;
  ctaPrimary?: { text: string; href: string };
  ctaSecondary?: { text: string; href: string };
};

export function ImageHero({
  title,
  subtitle,
  imageSrc,
  ctaPrimary,
  ctaSecondary,
}: ImageHeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      tl.from(titleRef.current, {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
      })
        .from(
          subtitleRef.current,
          {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.6"
        )
        .from(
          ctaRef.current,
          {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.4"
        );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden -mb-32">
      {/* Image Background */}
      <div className="absolute inset-0 z-0">
        <Image src={imageSrc} alt="" fill className="object-cover" priority />
        {/* Gradient overlay that blends with dark background below */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/95"></div>
        {/* Additional bottom gradient for seamless blend */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-mb-black"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center px-4 sm:px-6">
        <h1
          ref={titleRef}
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 tracking-tight leading-[1.1] sm:leading-tight"
        >
          {title}
        </h1>
        <p
          ref={subtitleRef}
          className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-mb-chrome mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-2"
        >
          {subtitle}
        </p>
        {(ctaPrimary || ctaSecondary) && (
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-auto mx-auto"
          >
            {ctaPrimary && (
              <Link
                href={ctaPrimary.href}
                className="group relative flex items-center justify-center gap-2 bg-mb-blue text-white px-6 py-2.5 sm:px-6 sm:py-3 rounded-button hover:bg-mb-blue/90 transition-all duration-300 text-xs sm:text-sm font-medium uppercase tracking-wide shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden w-48 sm:w-auto"
              >
                <span className="relative z-10 whitespace-nowrap">
                  {ctaPrimary.text}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-mb-blue via-blue-600 to-mb-blue opacity-100 transition-opacity duration-300" />
              </Link>
            )}
            {ctaSecondary && (
              <Link
                href={ctaSecondary.href}
                className="flex items-center justify-center border border-white/80 text-white px-6 py-2.5 sm:px-6 sm:py-3 rounded-button hover:bg-white/10 transition-all duration-300 text-xs sm:text-sm font-medium uppercase tracking-wide backdrop-blur-sm w-48 sm:w-auto"
              >
                <span className="whitespace-nowrap">{ctaSecondary.text}</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
