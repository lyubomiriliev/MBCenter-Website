"use client";

import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    // Defer Lenis + GSAP ScrollTrigger init until after page is interactive
    // This avoids long main-thread tasks during initial load
    let lenis: import("lenis").default | null = null;
    let rafId: number;

    const init = async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/dist/ScrollTrigger"),
        ]);

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time: number) {
        lenis!.raf(time);
        ScrollTrigger.update();
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);
    };

    // Use requestIdleCallback if available, otherwise defer 1s after load
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(init, { timeout: 2000 });
    } else {
      const timer = setTimeout(init, 1000);
      return () => clearTimeout(timer);
    }

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return null;
}
