"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ServiceCardProps = {
  title: string;
  description: string;
  image: string;
  index: number;
};

export function ServiceCard({
  title,
  description,
  image,
  index,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });

      // Image hover effect
      if (imageRef.current && cardRef.current) {
        const card = cardRef.current;
        const img = imageRef.current;

        card.addEventListener("mouseenter", () => {
          gsap.to(img, {
            scale: 1.1,
            duration: 0.6,
            ease: "power2.out",
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(img, {
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
          });
        });
      }
    });

    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group relative bg-mb-anthracite rounded-card overflow-hidden border border-mb-border transition-all duration-500 hover:border-mb-blue hover:shadow-[0_0_30px_rgba(0,173,239,0.3)]"
    >
      {/* Image */}
      <div ref={imageRef} className="relative h-64 overflow-hidden">
        <Image src={image} alt={title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-mb-anthracite via-mb-anthracite/50 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-8 relative z-10">
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-mb-blue transition-colors duration-300">
          {title}
        </h3>
        <p className="text-mb-silver leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
