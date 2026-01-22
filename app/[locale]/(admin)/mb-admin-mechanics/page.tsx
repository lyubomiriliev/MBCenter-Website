'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function MechanicsDashboard() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    // Redirect to offers page
    router.replace(`/${locale}/mb-admin-mechanics/offers`);
  }, [router, locale]);

  return null;
}

