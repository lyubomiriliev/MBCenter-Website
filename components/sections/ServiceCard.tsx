"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ServiceCardProps = {
  title: string;
  description: string;
  image: string;
  index: number;
  locale: string;
};

export function ServiceCard({
  title,
  description,
  image,
  index,
  locale,
}: ServiceCardProps) {
  const t = useTranslations();
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
        const img = imageRef.current.querySelector("img");

        if (img) {
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
      }
    });

    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group relative bg-mb-anthracite rounded-card overflow-hidden border border-mb-border transition-all duration-500 hover:border-mb-blue hover:shadow-[0_0_30px_rgba(0,173,239,0.3)] flex flex-col"
    >
      {/* Image */}
      <div ref={imageRef} className="relative h-64 overflow-hidden flex-shrink-0">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          style={{ transform: "scale(1)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-mb-anthracite via-mb-anthracite/50 to-transparent pointer-events-none"></div>
      </div>

      {/* Content */}
      <div className="p-8 relative z-10 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-mb-blue transition-colors duration-300">
          {title}
        </h3>
        <p className="text-mb-silver leading-relaxed flex-grow mb-6">{description}</p>
        
        {/* Book Appointment Button */}
        <div className="flex justify-end mt-auto">
          <Link
            href={`/${locale}/booking`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-mb-blue hover:bg-mb-blue/90 text-white font-semibold rounded-button transition-all duration-300 group/btn shadow-lg shadow-mb-blue/20 hover:shadow-mb-blue/40 hover:scale-105"
          >
            <span>{t("nav.bookService")}</span>
            <svg
              className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
