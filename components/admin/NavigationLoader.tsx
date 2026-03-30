"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const currentPathRef = useRef(pathname);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear spinner when navigation completes (pathname changes)
  useEffect(() => {
    if (pathname !== currentPathRef.current) {
      currentPathRef.current = pathname;
      setIsLoading(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [pathname]);

  // Show spinner when any internal link is clicked
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // If the event was cancelled (e.g. by an unsaved-changes guard), don't show spinner
      if (e.defaultPrevented) return;
      const anchor = (e.target as Element).closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        anchor.hasAttribute("download") ||
        href.startsWith("blob:") ||
        href.startsWith("data:") ||
        href.startsWith("http") ||
        href.startsWith("mailto") ||
        href.startsWith("tel") ||
        href.startsWith("#") ||
        href === currentPathRef.current
      )
        return;
      setIsLoading(true);
      // Safety: auto-dismiss after 8s in case navigation hangs
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsLoading(false), 8000);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-mb-black/60 backdrop-blur-[2px]">
      <div className="w-14 h-14 rounded-full border-4 border-mb-blue/20 border-t-mb-blue animate-spin" />
    </div>
  );
}
