'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import type { UserRole } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole: UserRole | UserRole[];
  redirectTo?: string;
}

export function AdminGuard({
  children,
  requiredRole,
  redirectTo,
}: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, hasRole, profile } = useSupabaseAuth();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // Extract locale from pathname (e.g., /bg/mb-admin-x77 -> bg)
    const localeMatch = pathname?.match(/^\/([a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : 'bg';
    
    // Default redirect to login page with locale preserved
    const defaultRedirect = `/${locale}/admin-login`;
    const finalRedirect = redirectTo || defaultRedirect;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.replace(finalRedirect);
      return;
    }

    // Redirect if doesn't have required role
    if (!hasRole(requiredRole)) {
      router.replace(finalRedirect);
      return;
    }
  }, [isLoading, isAuthenticated, hasRole, requiredRole, router, redirectTo, pathname]);

  // Show loading skeleton while checking auth
  if (isLoading) {
    return <AdminLoadingSkeleton />;
  }

  // Show nothing while redirecting
  if (!isAuthenticated || !hasRole(requiredRole)) {
    return <AdminLoadingSkeleton />;
  }

  return <>{children}</>;
}

function AdminLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-mb-black flex">
      {/* Sidebar skeleton */}
      <div className="w-64 border-r border-mb-border p-4 space-y-4">
        <Skeleton className="h-10 w-32 bg-mb-anthracite" />
        <div className="space-y-2 mt-8">
          <Skeleton className="h-8 w-full bg-mb-anthracite" />
          <Skeleton className="h-8 w-full bg-mb-anthracite" />
          <Skeleton className="h-8 w-full bg-mb-anthracite" />
          <Skeleton className="h-8 w-full bg-mb-anthracite" />
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="flex-1 p-8 space-y-6">
        <Skeleton className="h-10 w-64 bg-mb-anthracite" />
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full bg-mb-anthracite" />
          <Skeleton className="h-64 w-full bg-mb-anthracite" />
        </div>
      </div>
    </div>
  );
}

// Higher-order component variant for wrapping pages
export function withAdminGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole: UserRole | UserRole[]
) {
  return function AdminProtectedComponent(props: P) {
    return (
      <AdminGuard requiredRole={requiredRole}>
        <WrappedComponent {...props} />
      </AdminGuard>
    );
  };
}

