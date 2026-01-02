"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Modal } from "@/components/ui/Modal";

gsap.registerPlugin(ScrollTrigger);

type GalleryProject = {
  id: string;
  title: string;
  description: {
    bg: string;
    en: string;
  };
  images: string[];
};

type GalleryGridProps = {
  projects: GalleryProject[];
  locale: string;
};

export function GalleryGrid({ projects, locale }: GalleryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<{
    projectIndex: number;
    imageIndex: number;
  } | null>(null);

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
  }, [projects]);

  // Keyboard navigation for arrow keys (Modal handles Escape)
  useEffect(() => {
    if (selectedProject === null) return;

    const currentProject = projects[selectedProject.projectIndex];
    const totalImages = currentProject.images.length;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSelectedProject((prev) => {
          if (!prev) return null;
          const newIndex =
            prev.imageIndex === 0 ? totalImages - 1 : prev.imageIndex - 1;
          return { ...prev, imageIndex: newIndex };
        });
      } else if (e.key === "ArrowRight") {
        setSelectedProject((prev) => {
          if (!prev) return null;
          const newIndex =
            prev.imageIndex === totalImages - 1 ? 0 : prev.imageIndex + 1;
          return { ...prev, imageIndex: newIndex };
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject, projects]);

  return (
    <>
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {projects.map((project, projectIndex) => (
          <div
            key={project.id}
            className="gallery-item group relative bg-mb-anthracite rounded-card overflow-hidden border border-mb-border hover:border-mb-blue transition-all duration-500 cursor-pointer"
            onClick={() => setSelectedProject({ projectIndex, imageIndex: 0 })}
          >
            {/* Image Stack Effect */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-card">
              {project.images.length > 1 ? (
                // Stacked images effect
                <div className="relative w-full h-full">
                  {project.images.slice(0, 3).map((img, imgIndex) => (
                    <div
                      key={imgIndex}
                      className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.02]"
                      style={{
                        transform: `translate(${imgIndex * 12}px, ${
                          imgIndex * 12
                        }px) scale(${1 - imgIndex * 0.08})`,
                        zIndex: 3 - imgIndex,
                      }}
                    >
                      <Image
                        src={img}
                        alt={`${project.title} - Image ${imgIndex + 1}`}
                        fill
                        className="object-cover rounded-t-card"
                      />
                      {imgIndex < 2 && (
                        <div className="absolute inset-0 bg-black/30 rounded-t-card"></div>
                      )}
                      {/* Border for stack effect */}
                      {imgIndex > 0 && (
                        <div className="absolute inset-0 border-2 border-white/10 rounded-t-card pointer-events-none"></div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Single image
                <Image
                  src={project.images[0]}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-card"></div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-mb-blue transition-colors">
                {project.title}
              </h3>
              <p className="text-mb-silver text-sm leading-relaxed line-clamp-2">
                {locale === "bg"
                  ? project.description.bg
                  : project.description.en}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Modal
        isOpen={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        className="bg-black/95"
      >
        {selectedProject !== null &&
          (() => {
            const currentProject = projects[selectedProject.projectIndex];
            const currentImages = currentProject.images;
            const currentImageIndex = selectedProject.imageIndex;

            return (
              <>
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProject(null)}
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

                {/* Project Title and Description at Top Center */}
                <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-10 text-center max-w-[calc(100%-8rem)] sm:max-w-[calc(100%-12rem)]">
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-white px-4 py-2 bg-black/60 backdrop-blur-md rounded-lg shadow-lg mb-2">
                    {currentProject.title}
                  </h3>
                  <p className="text-sm sm:text-base text-mb-silver px-4 py-1 bg-black/60 backdrop-blur-md rounded-lg">
                    {locale === "bg"
                      ? currentProject.description.bg
                      : currentProject.description.en}
                  </p>
                </div>

                {/* Previous Button */}
                {currentImages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject((prev) => {
                        if (!prev) return null;
                        const newIndex =
                          prev.imageIndex === 0
                            ? currentImages.length - 1
                            : prev.imageIndex - 1;
                        return { ...prev, imageIndex: newIndex };
                      });
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
                {currentImages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject((prev) => {
                        if (!prev) return null;
                        const newIndex =
                          prev.imageIndex === currentImages.length - 1
                            ? 0
                            : prev.imageIndex + 1;
                        return { ...prev, imageIndex: newIndex };
                      });
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
                    src={currentImages[currentImageIndex]}
                    alt={`${currentProject.title} - Image ${
                      currentImageIndex + 1
                    }`}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Dots Indicator at Bottom - Only for current project's images */}
                {currentImages.length > 1 && (
                  <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-black/60 backdrop-blur-md rounded-full shadow-lg">
                    {currentImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject({
                            projectIndex: selectedProject.projectIndex,
                            imageIndex: index,
                          });
                        }}
                        className={`rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? "bg-mb-blue w-6 sm:w-8 h-3 sm:h-3 scale-110"
                            : "bg-white/40 hover:bg-white/60 w-2 sm:w-3 h-2 sm:h-3"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            );
          })()}
      </Modal>
    </>
  );
}
