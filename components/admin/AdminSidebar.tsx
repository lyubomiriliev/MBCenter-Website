'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/offers',
    labelKey: 'admin.sidebar.offers',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/create-offer',
    labelKey: 'admin.sidebar.createOffer',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/clients',
    labelKey: 'admin.sidebar.clients',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    adminOnly: true,
  },
];

interface AdminSidebarProps {
  basePath: string; // e.g., '/bg/mb-admin-x77' or '/en/mb-admin-mechanics'
}

export function AdminSidebar({ basePath }: AdminSidebarProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  const { profile, signOut, isAdmin } = useSupabaseAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = `/${locale}`;
  };

  return (
    <aside className="w-64 min-h-screen bg-mb-anthracite border-r border-mb-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-mb-border">
        <Link href={`/${locale}`} className="block">
          <h1 className="text-xl font-bold text-white">MB Center</h1>
          <p className="text-sm text-mb-silver">Admin Panel</p>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-mb-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-mb-blue flex items-center justify-center text-white font-medium">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.full_name || 'User'}
            </p>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                profile?.role === 'admin' 
                  ? "border-mb-blue text-mb-blue" 
                  : "border-mb-silver text-mb-silver"
              )}
            >
              {profile?.role === 'admin' ? t('admin.roles.admin') : t('admin.roles.mechanic')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          // Skip admin-only items for non-admins
          if (item.adminOnly && !isAdmin()) return null;

          const href = `${basePath}${item.href}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-mb-blue text-white"
                  : "text-mb-silver hover:bg-mb-black hover:text-white"
              )}
            >
              {item.icon}
              <span className="text-sm font-medium">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-mb-border space-y-2">
        {/* Back to site */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-mb-silver hover:bg-mb-black hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">{t('admin.sidebar.backToSite')}</span>
        </Link>

        {/* Logout */}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 px-4 py-2 text-mb-silver hover:bg-red-500/10 hover:text-red-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm">{t('admin.sidebar.logout')}</span>
        </Button>
      </div>
    </aside>
  );
}



