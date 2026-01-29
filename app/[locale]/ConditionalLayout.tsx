'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StickyBookingCTA } from '@/components/layout/StickyBookingCTA';
import { SmoothScroll } from '@/components/layout/SmoothScroll';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if this is an admin route
  const isAdminRoute = pathname?.includes('/mb-admin') || 
                       pathname?.includes('/mb-admin-mechanics') || 
                       pathname?.includes('/admin-login');

  if (isAdminRoute) {
    // Admin routes: no header, footer, or sticky CTA
    return <main className="min-h-screen">{children}</main>;
  }

  // Public routes: include header, footer, and sticky CTA
  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <StickyBookingCTA />
    </>
  );
}



