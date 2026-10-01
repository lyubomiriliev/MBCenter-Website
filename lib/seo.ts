import { SITE_CONFIG, getSiteConfig } from './constants';

const BUSINESS_ID = `${SITE_CONFIG.baseUrl}/#business`;
const WEBSITE_ID = `${SITE_CONFIG.baseUrl}/#website`;

// Topics AI answer engines match the business against ("who does X in Sofia").
const KNOWS_ABOUT = [
  'Mercedes-Benz',
  'Mercedes-Benz service and maintenance',
  'Mercedes-Benz repair',
  'Xentry / Star Diagnosis',
  'SCN online coding',
  'Mercedes-Benz retrofit coding and feature activation',
  '7G-Tronic, 9G-Tronic, 7G-DCT and 8G-DCT transmission service',
  'AIRMATIC air suspension repair',
  'Mercedes-Benz EQ electric vehicle service',
  'Digital Service Booklet (DSB)',
  'XENTRY Remote Diagnosis',
  'Pre-purchase vehicle inspection',
];

type SchemaOptions = {
  description: string;
  services: string[];
};

// One @graph with the business and the website, so crawlers and AI engines
// resolve every page on the site to the same entity via @id.
export function generateLocalBusinessSchema(
  locale: string,
  { description, services }: SchemaOptions
) {
  const config = getSiteConfig(locale);
  const pageUrl = `${SITE_CONFIG.baseUrl}/${locale}/`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AutoRepair',
        '@id': BUSINESS_ID,
        name: SITE_CONFIG.name,
        description,
        url: pageUrl,
        logo: `${SITE_CONFIG.baseUrl}/assets/logos/mbc-logo-black.png`,
        image: `${SITE_CONFIG.baseUrl}/og-image.jpg`,
        telephone: SITE_CONFIG.phone.replace(/\s/g, ''),
        email: SITE_CONFIG.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: config.address.street,
          addressLocality: config.address.city,
          postalCode: config.address.postalCode,
          addressCountry: 'BG',
        },
        hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${SITE_CONFIG.name}, ${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.postalCode} ${SITE_CONFIG.address.city}`
        )}`,
        areaServed: { '@type': 'City', name: config.address.city },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:30',
            closes: '18:00',
          },
        ],
        knowsAbout: KNOWS_ABOUT,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: locale === 'bg' ? 'Услуги' : 'Services',
          itemListElement: services.map((name) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name },
          })),
        },
        sameAs: Object.values(SITE_CONFIG.social),
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: `${SITE_CONFIG.baseUrl}/`,
        name: SITE_CONFIG.name,
        inLanguage: locale === 'bg' ? 'bg-BG' : 'en-US',
        publisher: { '@id': BUSINESS_ID },
      },
    ],
  };
}

// trailingSlash: true in next.config — canonical/hreflang URLs must end in "/"
// or every one of them points at a 301 redirect.
export function generateAlternateLinks(locale: string, path: string = '') {
  const url = (l: string) => `${SITE_CONFIG.baseUrl}/${l}${path}/`;
  return {
    canonical: url(locale),
    languages: {
      en: url('en'),
      bg: url('bg'),
      'x-default': url('bg'),
    },
  };
}
