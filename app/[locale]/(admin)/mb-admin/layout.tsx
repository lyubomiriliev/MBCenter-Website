'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SidebarProvider } from '@/components/admin/SidebarContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const locale = params.locale as string;
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AdminGuard requiredRole="admin" redirectTo={`/${locale}/admin-login`}>
        <SidebarProvider>
          <div className="min-h-screen bg-mb-black">
            <AdminSidebar basePath={`/${locale}/mb-admin`} />
            <main className="lg:ml-64 min-h-screen flex flex-col overflow-hidden">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </AdminGuard>
    </QueryClientProvider>
  );
}

