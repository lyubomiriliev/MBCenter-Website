"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const currentPathRef = useRef(pathname);

  // Clear spinner when navigation completes (pathname changes)
  useEffect(() => {
    if (pathname !== currentPathRef.current) {
      currentPathRef.current = pathname;
      setIsLoading(false);
    }
  }, [pathname]);

  // Show spinner when any internal link is clicked
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
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
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-mb-black/60 backdrop-blur-[2px]">
      <div className="w-14 h-14 rounded-full border-4 border-mb-blue/20 border-t-mb-blue animate-spin" />
    </div>
  );
}
