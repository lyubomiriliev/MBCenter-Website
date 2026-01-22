// This is a route group layout - it doesn't render anything
// The parent locale layout handles NextIntlClientProvider
// Admin routes are already wrapped by their specific layouts (mb-admin-x77/layout.tsx, etc.)
export default function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
