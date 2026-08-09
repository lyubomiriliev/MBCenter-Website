'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { Umami } from '@/components/analytics/Umami';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/bg');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mb-black">
      {/* "/" is the bare domain people type, so the tag must load here — the
          redirect to /bg is client-side and never reloads the document.
          sendPageView stays off: /bg's own tracker reports the resulting view,
          and letting this config report too would count the visit twice. */}
      <GoogleAnalytics />
      <Umami />
      <Image
        src="/assets/logos/mbc-logo-white.png"
        alt="MB Center"
        width={600}
        height={300}
        className="animate-pulse"
        priority
      />
    </div>
  );
}
