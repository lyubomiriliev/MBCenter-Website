'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function MechanicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const locale = params.locale as string;
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AdminGuard requiredRole={['mechanic', 'admin']} redirectTo={`/${locale}/admin-login`}>
        <div className="flex min-h-screen bg-mb-black">
          <AdminSidebar basePath={`/${locale}/mb-admin-mechanics`} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </AdminGuard>
    </QueryClientProvider>
  );
}

