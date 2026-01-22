'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, actions }: AdminHeaderProps) {
  const locale = useLocale();
  const otherLocale = locale === 'en' ? 'bg' : 'en';

  return (
    <header className="bg-mb-anthracite border-b border-mb-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-mb-silver mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <Link
            href={`/${otherLocale}${typeof window !== 'undefined' ? window.location.pathname.replace(`/${locale}`, '') : ''}`}
            className="text-mb-silver hover:text-white transition-colors text-sm uppercase font-medium"
          >
            {otherLocale.toUpperCase()}
          </Link>
          
          {actions}
        </div>
      </div>
    </header>
  );
}



