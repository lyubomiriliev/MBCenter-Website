"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type GalleryImage = {
  src: string;
  alt: string;
  category?: string;
};

type GalleryGridProps = {
  images: GalleryImage[];
};

export function GalleryGrid({ images }: GalleryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!gridRef.current) return;

    const items = gridRef.current.querySelectorAll(".gallery-item");

    const ctx = gsap.context(() => {
      items.forEach((item, index) => {
        gsap.from(item, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          delay: index * 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });
      });
    });

    return () => ctx.revert();
  }, [images]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSelectedImageIndex((prev) =>
          prev !== null ? (prev === 0 ? images.length - 1 : prev - 1) : null
        );
      } else if (e.key === "ArrowRight") {
        setSelectedImageIndex((prev) =>
          prev !== null ? (prev === images.length - 1 ? 0 : prev + 1) : null
        );
      } else if (e.key === "Escape") {
        setSelectedImageIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, images.length]);

  return (
    <>
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="gallery-item group relative aspect-[4/3] bg-mb-anthracite rounded-card overflow-hidden border border-mb-border hover:border-mb-blue transition-all duration-500 cursor-pointer"
            onClick={() => setSelectedImageIndex(index)}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
              <p className="text-white font-medium text-lg">{image.alt}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedImageIndex(null);
            }
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-6 right-6 text-white hover:text-mb-blue transition-colors z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Title at Top Center */}
          <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-10 text-center max-w-[calc(100%-8rem)] sm:max-w-[calc(100%-12rem)]">
            <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-white px-4 py-2 bg-black/60 backdrop-blur-md rounded-lg shadow-lg">
              {images[selectedImageIndex].alt}
            </h3>
          </div>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) =>
                  prev !== null
                    ? prev === 0
                      ? images.length - 1
                      : prev - 1
                    : null
                );
              }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white hover:text-mb-blue transition-all duration-300 group"
              aria-label="Previous image"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((prev) =>
                  prev !== null
                    ? prev === images.length - 1
                      ? 0
                      : prev + 1
                    : null
                );
              }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white hover:text-mb-blue transition-all duration-300 group"
              aria-label="Next image"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image Container */}
          <div className="relative max-w-7xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <Image
              src={images[selectedImageIndex].src}
              alt={images[selectedImageIndex].alt}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Dots Indicator at Bottom */}
          {images.length > 1 && (
            <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-black/60 backdrop-blur-md rounded-full shadow-lg">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(index);
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    index === selectedImageIndex
                      ? "bg-mb-blue w-6 sm:w-8 h-3 sm:h-3 scale-110"
                      : "bg-white/40 hover:bg-white/60 w-2 sm:w-3 h-2 sm:h-3"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
