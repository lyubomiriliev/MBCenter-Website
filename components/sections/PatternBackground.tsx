"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type PatternBackgroundProps = {
  children: React.ReactNode;
  className?: string;
  patternOpacity?: number;
  animate?: boolean;
  id?: string;
};

export function PatternBackground({
  children,
  className = "",
  patternOpacity = 0.03,
  animate = true,
  id,
}: PatternBackgroundProps) {
  const patternRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate || !patternRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(patternRef.current, {
        scale: 1.15,
        duration: 6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      gsap.to(patternRef.current, {
        opacity: patternOpacity * 1.5,
        duration: 6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    });

    return () => ctx.revert();
  }, [animate, patternOpacity]);

  return (
    <div
      id={id}
      className={`relative overflow-hidden bg-mb-black ${className}`}
    >
      {/* Animated Pattern Background */}
      <div
        ref={patternRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: patternOpacity }}
      >
        <Image
          src="/assets/images/mb_pattern-1.webp"
          alt=""
          fill
          className="object-cover"
          priority={false}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
