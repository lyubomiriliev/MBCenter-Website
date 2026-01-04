import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MB Center Sofia",
  description: "Mercedes-Benz Service Center in Sofia, Bulgaria",
  icons: {
    icon: [
      {
        url: "/assets/favicon-32x32.webp",
        type: "image/webp",
        sizes: "32x32",
      },
      { url: "/assets/favicon.ico", sizes: "any" },
    ],
    shortcut: "/assets/favicon.ico",
    apple: "/assets/favicon-32x32.webp",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg" className={inter.variable}>
      <body className="bg-mb-black text-white">{children}</body>
    </html>
  );
}
