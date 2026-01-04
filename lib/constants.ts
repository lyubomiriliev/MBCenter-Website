type SiteConfig = {
  name: string;
  baseUrl: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  hours: {
    weekdays: string;
    weekend: string;
  };
  social: {
    facebook: string;
    instagram: string;
  };
  booking: {
    googleCalendar: string;
  };
  formspree: {
    contactFormId: string;
    careerFormId: string;
  };
};

const SITE_CONFIG_BG: SiteConfig = {
  name: "MB Center Sofia",
  baseUrl: "https://mbcenter.bg",
  phone: "+359 883 788 873",
  email: "info@mbcenter.bg",
  address: {
    street: "ул. Околовръстен път 155",
    city: "София",
    country: "България",
    postalCode: "1700",
  },
  hours: {
    weekdays: "10:30–19:00ч. Понеделник - Петък",
    weekend: "Затворено",
  },
  social: {
    facebook: "https://www.facebook.com/mbcenterbg",
    instagram: "https://www.instagram.com/mbcenter.bg/",
  },
  booking: {
    googleCalendar:
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0KHVTiNLWb9t5e_J7VvJ7BqGvfBvYjQZ7J7bYjQZ7J7bYjQZ7J7b?gv=true",
  },
  formspree: {
    contactFormId: "YOUR_FORMSPREE_ID",
    careerFormId: "YOUR_FORMSPREE_CAREER_ID",
  },
};

const SITE_CONFIG_EN: SiteConfig = {
  name: "MB Center Sofia",
  baseUrl: "https://mbcenter.bg",
  phone: "+359 883 788 873",
  email: "info@mbcenter.bg",
  address: {
    street: "155 Ring Road",
    city: "Sofia",
    country: "Bulgaria",
    postalCode: "1700",
  },
  hours: {
    weekdays: "10:30–19:00 Monday - Friday",
    weekend: "Closed",
  },
  social: {
    facebook: "https://www.facebook.com/mbcenterbg",
    instagram: "https://www.instagram.com/mbcenter.bg/",
  },
  booking: {
    googleCalendar:
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0KHVTiNLWb9t5e_J7VvJ7BqGvfBvYjQZ7J7bYjQZ7J7bYjQZ7J7b?gv=true",
  },
  formspree: {
    contactFormId: "YOUR_FORMSPREE_ID",
    careerFormId: "YOUR_FORMSPREE_CAREER_ID",
  },
};

// Function to get site config based on locale
export function getSiteConfig(locale: string = "bg"): SiteConfig {
  return locale === "en" ? SITE_CONFIG_EN : SITE_CONFIG_BG;
}

// Default export for backward compatibility (Bulgarian)
export const SITE_CONFIG = SITE_CONFIG_BG;

export const NAV_ITEMS = [
  { href: "/", labelKey: "nav.home" },
  { href: "/services", labelKey: "nav.services" },
  { href: "/gallery", labelKey: "nav.gallery" },
  { href: "/about", labelKey: "nav.about" },
  // { href: "/career", labelKey: "nav.career" }, // Commented out - can be re-enabled later
  { href: "/contacts", labelKey: "nav.contacts" },
] as const;
