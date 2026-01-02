"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";

type VideoHeroProps = {
  title: string;
  subtitle: string;
  videoSrc: string;
  ctaPrimary?: { text: string; href: string };
  ctaSecondary?: { text: string; href: string };
};

export function VideoHero({
  title,
  subtitle,
  videoSrc,
  ctaPrimary,
  ctaSecondary,
}: VideoHeroProps) {
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-0 pt-0">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 -top-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center px-4 sm:px-6">
        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 tracking-tight leading-[1.1] sm:leading-tight"
          style={{
            wordBreak: "keep-all",
            hyphens: "none",
          }}
        >
          {title.replace(/Mercedes-Benz/g, "Mercedes\u00A0Benz")}
        </h1>
        <p
          ref={subtitleRef}
          className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-mb-chrome mb-8 sm:mb-16 md:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-2"
        >
          {subtitle}
        </p>
        {(ctaPrimary || ctaSecondary) && (
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-auto mx-auto mt-4 sm:mt-6"
          >
            {ctaPrimary && (
              <Link
                href={ctaPrimary.href}
                className="group relative flex items-center justify-center gap-2 bg-mb-blue text-white px-8 py-3.5 sm:px-10 sm:py-4 rounded-button hover:bg-mb-blue/90 transition-all duration-300 text-sm sm:text-base font-medium uppercase tracking-wide shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden w-56 sm:w-auto min-w-[200px] sm:min-w-0"
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
                className="flex items-center justify-center border border-white/80 text-white px-8 py-3.5 sm:px-10 sm:py-4 rounded-button hover:bg-white/10 transition-all duration-300 text-sm sm:text-base font-medium uppercase tracking-wide backdrop-blur-sm w-56 sm:w-auto min-w-[200px] sm:min-w-0"
              >
                <span className="whitespace-nowrap">{ctaSecondary.text}</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
