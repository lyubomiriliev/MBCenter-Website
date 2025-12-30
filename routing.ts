import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'bg'],
  defaultLocale: 'bg',
  // Remove localePrefix for static export
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
