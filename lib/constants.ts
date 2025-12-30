export const SITE_CONFIG = {
  name: "MB Center Sofia",
  baseUrl: "https://mbcenter.bg",
  phone: "088 378 8873",
  email: "info@mbcenter.bg",
  address: {
    street: "Софийски околовръстен път",
    city: "София",
    country: "Bulgaria",
    postalCode: "1700",
  },
  hours: {
    weekdays: "10:30–19:00 Понеделник - Петък",
    weekend: "Closed",
  },
  social: {
    facebook: "https://www.facebook.com/mbcenterbg",
    instagram: "https://www.instagram.com/mbcenter.bg/",
  },
  booking: {
    googleCalendar:
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0KHVTiNLWb9t5e_J7VvJ7BqGvfBvYjQZ7J7bYjQZ7J7bYjQZ7J7b?gv=true", // Placeholder - update with actual Google Calendar link
  },
  formspree: {
    contactFormId: "YOUR_FORMSPREE_ID",
    careerFormId: "YOUR_FORMSPREE_CAREER_ID", // Separate form ID for career applications
  },
} as const;

export const NAV_ITEMS = [
  { href: "/", labelKey: "nav.home" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/services", labelKey: "nav.services" },
  { href: "/gallery", labelKey: "nav.gallery" },
  { href: "/career", labelKey: "nav.career" },
  { href: "/contacts", labelKey: "nav.contacts" },
] as const;
