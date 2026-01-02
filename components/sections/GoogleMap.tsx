"use client";

import { useTranslations } from "next-intl";
import { SITE_CONFIG } from "@/lib/constants";

type GoogleMapProps = {
  embedUrl?: string;
  fallbackUrl?: string;
};

export function GoogleMap({ embedUrl, fallbackUrl }: GoogleMapProps) {
  const t = useTranslations("contacts.map");

  // Construct embed URL for MB Center Sofia location
  // Address: ул. Околовръстен път 155, София, България
  const address = encodeURIComponent(
    `${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.city}, ${SITE_CONFIG.address.country}`
  );
  // Using standard Google Maps embed format (no API key required)
  const defaultEmbedUrl =
    embedUrl || `https://www.google.com/maps?q=${address}&output=embed&zoom=15`;
  const defaultFallbackUrl =
    fallbackUrl || `https://www.google.com/maps/search/?api=1&query=${address}`;

  return (
    <div className="w-full">
      <div className="rounded-card overflow-hidden border border-mb-border">
        <iframe
          src={defaultEmbedUrl}
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full aspect-video"
        />
        <div className="bg-mb-anthracite p-4 text-center">
          <a
            href={defaultFallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-mb-blue hover:text-white transition-colors inline-flex items-center gap-2 font-medium"
          >
            {t("viewOnMaps")}
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
