"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatedText } from "@/components/animations/AnimatedText";

gsap.registerPlugin(ScrollTrigger);

type ParallaxDividerProps = {
  imageSrc: string;
  imageAlt: string;
  text?: string;
  icon?: React.ReactNode;
  overlayGradient?: string;
  height?: string;
  speed?: number;
};

export function ParallaxDivider({
  imageSrc,
  imageAlt,
  text,
  icon,
  overlayGradient = "bg-gradient-to-b from-black/70 via-black/50 to-black/70",
  height = "h-[500px]",
  speed = 0.5,
}: ParallaxDividerProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    const container = containerRef.current;
    if (!image || !container) return;

    const ctx = gsap.context(() => {
      gsap.to(image, {
        yPercent: 50,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={`relative ${height} overflow-hidden`}>
      {/* Parallax Image */}
      <div
        ref={imageRef}
        className="absolute inset-0 w-full h-[120%] -top-[50%]"
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Overlay Gradient */}
      <div className={`absolute inset-0 ${overlayGradient}`}></div>

      {/* Content */}
      {(text || icon) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedText>
            <div className="text-center px-6">
              {icon && <div className="mb-8">{icon}</div>}
              {text && (
                <p className="text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-5xl leading-tight">
                  {text}
                </p>
              )}
            </div>
          </AnimatedText>
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-mb-blue/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-mb-blue/50 to-transparent"></div>
      </div>
    </div>
  );
}
