"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_MEASUREMENT_ID } from "./GoogleAnalytics";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sends a page_view on every route change, including the first render.
 *
 * This is required, not redundant: gtag's Enhanced Measurement does not report
 * this app's client-side navigations (verified — pushState fires, gtag stays
 * loaded, and no hit is sent), so without this only full document loads would
 * be counted. The paired <GoogleAnalytics /> config therefore sets
 * send_page_view: false to avoid double-counting the initial view.
 */
export function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;

    const query = searchParams.toString();
    const page_path = query ? `${pathname}?${query}` : pathname;

    window.gtag("event", "page_view", {
      page_path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA_MEASUREMENT_ID,
    });
  }, [pathname, searchParams]);

  return null;
}
