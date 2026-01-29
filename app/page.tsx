'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/bg');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mb-black">
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
