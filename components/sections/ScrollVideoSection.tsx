"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type ScrollVideoSectionProps = {
  videoSrc: string;
};

export function ScrollVideoSection({ videoSrc }: ScrollVideoSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    // Check on mount
    checkMobile();

    // Check on resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Don't initialize on mobile
    if (isMobile) return;

    const container = containerRef.current;
    const video = videoRef.current;

    if (!container || !video) return;

    let scrollTrigger: ScrollTrigger | null = null;
    let ctx: gsap.Context | null = null;

    const setupScrollTrigger = () => {
      // Ensure video is at start
      video.currentTime = 0;
      video.pause();

      // Calculate scroll distance based on video duration
      const scrollDistance = window.innerHeight * 4;

      // Create the scroll trigger
      scrollTrigger = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${scrollDistance}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = Math.max(0, Math.min(1, self.progress));

          if (
            video.duration &&
            video.readyState >= 2 &&
            !isNaN(video.duration) &&
            video.seekable.length > 0
          ) {
            let targetTime = video.duration * progress;

            if (progress >= 0.99) {
              targetTime = video.duration;
            }

            targetTime = Math.max(0, Math.min(targetTime, video.duration));

            if (Math.abs(video.currentTime - targetTime) > 0.05) {
              video.currentTime = targetTime;
            }
          }
        },
        onEnter: () => {
          if (video.duration) video.currentTime = 0;
        },
        onLeave: () => {
          if (video.duration && !isNaN(video.duration)) {
            video.currentTime = video.duration;
          }
        },
        onEnterBack: () => {
          if (video.duration && !isNaN(video.duration)) {
            video.currentTime = video.duration;
          }
        },
        onLeaveBack: () => {
          if (video.duration) video.currentTime = 0;
        },
      });
    };

    const handleLoadedMetadata = () => {
      setupScrollTrigger();
      ScrollTrigger.refresh();
    };

    // Initialize with gsap.context
    ctx = gsap.context(() => {
      if (video.readyState >= 2) {
        handleLoadedMetadata();
      } else {
        video.addEventListener("loadedmetadata", handleLoadedMetadata, {
          once: true,
        });
        video.load();
      }
    }, container);

    // Cleanup function
    return () => {
      // Remove event listener immediately
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);

      // Kill ScrollTrigger FIRST - this reverts all DOM changes synchronously
      if (scrollTrigger) {
        scrollTrigger.kill(true);
        scrollTrigger = null;
      }

      // Then revert gsap context
      if (ctx) {
        ctx.revert();
        ctx = null;
      }

      // Force ScrollTrigger to update and clear any remaining pins
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === container) {
          st.kill(true);
        }
      });
    };
  }, [videoSrc, isMobile]);

  // Don't render on mobile
  if (isMobile) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-mb-black"
    >
      {/* Video Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
        />
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce pointer-events-none">
        <svg
          className="w-8 h-8 text-white/50"
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
    </div>
  );
}
