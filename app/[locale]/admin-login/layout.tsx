import type { Metadata } from "next";

// Staff login — keep it out of search and AI indexes.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
