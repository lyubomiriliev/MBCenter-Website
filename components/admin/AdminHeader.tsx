'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarContext';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === 'en' ? 'bg' : 'en';
  const { toggle } = useSidebar();
  const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/';

  return (
    <header className="sticky top-0 z-10 flex-shrink-0 bg-mb-anthracite border-b border-mb-border px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={toggle}
            className="lg:hidden p-2 -ml-2 rounded-lg text-mb-silver hover:bg-mb-black hover:text-white shrink-0"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-white truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-mb-silver mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            href={`/${otherLocale}${pathWithoutLocale}`}
            className="text-mb-silver hover:text-white transition-colors text-sm uppercase font-medium px-2 py-1 rounded hover:bg-mb-black"
          >
            {otherLocale.toUpperCase()}
          </Link>
          {actions}
        </div>
      </div>
    </header>
  );
}



