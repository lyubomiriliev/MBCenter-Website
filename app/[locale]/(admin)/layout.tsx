import type { Metadata } from "next";

// Private staff area — keep it out of search and AI indexes.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// This is a route group layout - it doesn't render anything
// The parent locale layout handles NextIntlClientProvider
// Admin routes are already wrapped by their specific layouts (mb-admin/layout.tsx, etc.)
export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
