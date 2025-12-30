'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type GoogleMapProps = {
  title: string;
  embedUrl?: string;
  fallbackUrl?: string;
};

export function GoogleMap({ title, embedUrl, fallbackUrl }: GoogleMapProps) {
  const t = useTranslations('contacts.map');
  const [isLoaded, setIsLoaded] = useState(false);

  // Placeholder Google Maps embed URL - to be replaced with actual location
  const defaultEmbedUrl = embedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2932.6!2d23.32!3d42.69!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDQxJzI0LjAiTiAyM8KwMTknMTIuMCJF!5e0!3m2!1sen!2sbg!4v1234567890';
  const defaultFallbackUrl = fallbackUrl || 'https://maps.google.com/?q=Sofia,Bulgaria';

  const handleLoadClick = () => {
    setIsLoaded(true);
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">
        {title}
      </h2>
      
      {!isLoaded ? (
        <div className="bg-mb-anthracite rounded-card aspect-video flex flex-col items-center justify-center border border-mb-border">
          <svg className="w-16 h-16 text-mb-border mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <button
            onClick={handleLoadClick}
            className="group relative inline-flex items-center gap-2 bg-mb-blue text-white px-6 py-3 rounded-button hover:opacity-90 transition-opacity font-medium mb-3 overflow-hidden"
          >
            <span className="relative z-10">Load Map</span>
            <div className="absolute inset-0 bg-gradient-to-r from-mb-blue via-blue-600 to-mb-blue opacity-100 transition-opacity duration-300" />
          </button>
          <a
            href={defaultFallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-mb-silver hover:text-white transition-colors text-sm inline-flex items-center gap-2"
          >
            {t('viewOnMaps')}
            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      ) : (
        <div className="rounded-card overflow-hidden border border-mb-border">
          <iframe
            src={defaultEmbedUrl}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={title}
            className="w-full aspect-video"
          />
          <div className="bg-mb-anthracite p-4 text-center">
            <a
              href={defaultFallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-mb-blue hover:text-white transition-colors inline-flex items-center gap-2 font-medium"
            >
              {t('viewOnMaps')}
              <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}


