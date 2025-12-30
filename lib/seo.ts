import { SITE_CONFIG } from './constants';

type LocalBusinessSchema = {
  '@context': string;
  '@type': string;
  name: string;
  image?: string;
  '@id'?: string;
  url: string;
  telephone: string;
  address: {
    '@type': string;
    streetAddress: string;
    addressLocality: string;
    addressCountry: string;
    postalCode: string;
  };
  geo?: {
    '@type': string;
    latitude: number;
    longitude: number;
  };
  openingHoursSpecification?: {
    '@type': string;
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }[];
  sameAs?: string[];
};

export function generateLocalBusinessSchema(locale: string): LocalBusinessSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: SITE_CONFIG.name,
    url: `${SITE_CONFIG.baseUrl}/${locale}`,
    telephone: SITE_CONFIG.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.address.street,
      addressLocality: SITE_CONFIG.address.city,
      addressCountry: SITE_CONFIG.address.country,
      postalCode: SITE_CONFIG.address.postalCode,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: [SITE_CONFIG.social.facebook, SITE_CONFIG.social.instagram],
  };
}

export function generateAlternateLinks(locale: string, path: string = '') {
  const otherLocale = locale === 'en' ? 'bg' : 'en';
  return {
    canonical: `${SITE_CONFIG.baseUrl}/${locale}${path}`,
    languages: {
      en: `${SITE_CONFIG.baseUrl}/en${path}`,
      bg: `${SITE_CONFIG.baseUrl}/bg${path}`,
      'x-default': `${SITE_CONFIG.baseUrl}/bg${path}`,
    },
  };
}

