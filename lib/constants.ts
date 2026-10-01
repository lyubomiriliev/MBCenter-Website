type SiteConfig = {
  name: string;
  baseUrl: string;
  phone: string;
  email: string;
  address: {
    label: string;
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  hours: {
    weekdays: string;
    weekend: string;
  };
  viberUrl?: string;
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
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
  name: "MB Center",
  baseUrl: "https://mbcenter.bg",
  phone: "+359 883 788 873",
  email: "contact@mbcenter.bg",
  address: {
    label: "1151 София, България",
    street: "ул. Райовец 16",
    city: "София",
    country: "България",
    postalCode: "1151",
  },
  hours: {
    weekdays: "Понеделник - Петък 9:30 - 18:00ч.",
    weekend: "Събота и Неделя - Почивни дни",
  },
  viberUrl: "viber://chat?number=%2B359883788873",
  social: {
    facebook: "https://www.facebook.com/mbcenterbg",
    instagram: "https://www.instagram.com/mbcenter.bg/",
    tiktok: "https://www.tiktok.com/@mbcenter.bg",
    youtube: "https://www.youtube.com/@MBCenterBG",
  },
  booking: {
    googleCalendar:
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0KHVTiNLWb9t5e_J7VvJ7BqGvfBvYjQZ7J7bYjQZ7J7bYjQZ7J7b?gv=true",
  },
  formspree: {
    contactFormId: "mnjbgyba",
    careerFormId: "YOUR_FORMSPREE_CAREER_ID",
  },
};

const SITE_CONFIG_EN: SiteConfig = {
  name: "MB Center",
  baseUrl: "https://mbcenter.bg",
  phone: "+359 883 788 873",
  email: "contact@mbcenter.bg",
  address: {
    label: "1151 Sofia, Bulgaria",
    street: "16 Rayovets St.",
    city: "Sofia",
    country: "Bulgaria",
    postalCode: "1151",
  },
  hours: {
    weekdays: "Monday - Friday 9:30 - 18:00h",
    weekend: "Saturday and Sunday - Closed",
  },
  viberUrl: "viber://chat?number=%2B359883788873",
  social: {
    facebook: "https://www.facebook.com/mbcenterbg",
    instagram: "https://www.instagram.com/mbcenter.bg/",
    tiktok: "https://www.tiktok.com/@mbcenter.bg",
    youtube: "https://www.youtube.com/@MBCenterBG",
  },
  booking: {
    googleCalendar:
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0KHVTiNLWb9t5e_J7VvJ7BqGvfBvYjQZ7J7bYjQZ7J7bYjQZ7J7b?gv=true",
  },
  formspree: {
    contactFormId: "mnjbgyba",
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
