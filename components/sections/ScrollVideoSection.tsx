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
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollTriggerInstanceRef = useRef<ScrollTrigger | null>(null);
  const handleLoadedMetadataRef = useRef<(() => void) | null>(null);
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

    const video = videoRef.current;
    const section = sectionRef.current;

    if (!video || !section) return;

    // Use gsap.context for proper cleanup
    const ctx = gsap.context(() => {
      const setupScrollTrigger = () => {
        // Clean up any existing ScrollTrigger instance
        if (scrollTriggerInstanceRef.current) {
          scrollTriggerInstanceRef.current.kill(true); // Kill immediately and revert
          scrollTriggerInstanceRef.current = null;
        }

        // Ensure video is at start
        video.currentTime = 0;
        video.pause();

        // Calculate scroll distance based on video duration
        // More scroll distance = slower video playback = smoother experience
        const scrollDistance = window.innerHeight * 4; // Increased to 4x viewport height

        // Create the scroll trigger
        scrollTriggerInstanceRef.current = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: `+=${scrollDistance}`,
          scrub: 1, // 1 second lag for smooth scrubbing
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Update video time based on scroll progress
            // Ensure progress is clamped between 0 and 1
            const progress = Math.max(0, Math.min(1, self.progress));

            if (
              video.duration &&
              video.readyState >= 2 &&
              !isNaN(video.duration)
            ) {
              // Calculate target time - when progress is 1, we want full duration
              let targetTime = video.duration * progress;

              // When at 100% progress, ensure we reach the actual end
              if (progress >= 0.99) {
                targetTime = video.duration;
              }

              // Clamp to valid range
              targetTime = Math.max(0, Math.min(targetTime, video.duration));

              // Update video time
              if (Math.abs(video.currentTime - targetTime) > 0.05) {
                video.currentTime = targetTime;
              }
            }
          },
          onEnter: () => {
            if (video.duration) {
              video.currentTime = 0;
            }
          },
          onLeave: () => {
            // Ensure video reaches the end when leaving
            if (video.duration && !isNaN(video.duration)) {
              video.currentTime = video.duration;
            }
          },
          onEnterBack: () => {
            // When scrolling back from below, start at end
            if (video.duration && !isNaN(video.duration)) {
              video.currentTime = video.duration;
            }
          },
          onLeaveBack: () => {
            // When scrolling back past the start, reset to beginning
            if (video.duration) {
              video.currentTime = 0;
            }
          },
        });

        // Refresh ScrollTrigger after setup
        ScrollTrigger.refresh();
      };

      // Wait for video metadata
      handleLoadedMetadataRef.current = () => {
        setupScrollTrigger();
      };

      if (video.readyState >= 2) {
        // Metadata already loaded
        handleLoadedMetadataRef.current();
      } else {
        // Wait for metadata
        video.addEventListener(
          "loadedmetadata",
          handleLoadedMetadataRef.current,
          {
            once: true,
          }
        );
        // Force load to ensure metadata loads
        video.load();
      }
    }, section);

    // Cleanup - this runs BEFORE React removes the DOM nodes
    return () => {
      // Kill ScrollTrigger instance FIRST before reverting context
      if (scrollTriggerInstanceRef.current) {
        scrollTriggerInstanceRef.current.kill(true); // Kill and revert immediately
        scrollTriggerInstanceRef.current = null;
      }

      // Then revert gsap context
      ctx.revert();

      // Remove event listener if video still exists
      if (handleLoadedMetadataRef.current) {
        const videoElement = videoRef.current;
        if (videoElement) {
          videoElement.removeEventListener(
            "loadedmetadata",
            handleLoadedMetadataRef.current
          );
        }
        handleLoadedMetadataRef.current = null;
      }
    };
  }, [videoSrc, isMobile]);

  // Don't render on mobile
  if (isMobile) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
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
    </section>
  );
}
