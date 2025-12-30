"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { NAV_ITEMS } from "@/lib/constants";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const otherLocale = locale === "en" ? "bg" : "en";

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show/hide header based on scroll direction
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setIsScrolled(currentScrollY > 20);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-500 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isScrolled
            ? "bg-mb-black/98 backdrop-blur-md border-b border-mb-border shadow-lg"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="relative z-10 transition-transform hover:scale-105 duration-300"
            >
              <Image
                src="/assets/logos/mbc-logo-white.png"
                alt="MB Center Sofia"
                width={180}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {NAV_ITEMS.map((item, index) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className="text-mb-silver hover:text-white transition-all duration-300 text-sm tracking-wider uppercase font-medium relative group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {t(item.labelKey)}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-mb-blue transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            {/* Desktop CTA & Language Switcher */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href={`/${otherLocale}`}
                className="text-mb-silver hover:text-white transition-colors text-sm uppercase font-medium px-3 py-2 rounded-button hover:bg-mb-anthracite"
              >
                {otherLocale}
              </Link>
            <Link
              href={`/${locale}/booking`}
              className="group relative inline-flex items-center gap-2 bg-mb-blue text-white px-6 py-3 rounded-button hover:bg-mb-blue/90 transition-all duration-300 text-sm font-medium uppercase tracking-wide shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10">{t("nav.bookService")}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-mb-blue via-blue-600 to-mb-blue opacity-100 transition-opacity duration-300" />
            </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white p-2 hover:bg-mb-anthracite rounded-button transition-colors relative z-[60]"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu - Full Screen Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[45] pt-20">
          {/* Dark Overlay Background */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div className="relative bg-mb-black/95 backdrop-blur-xl h-full overflow-y-auto animate-in slide-in-from-top duration-300">
            <div className="flex flex-col h-full px-6 py-8">
              {/* Navigation Links */}
              <div className="flex flex-col gap-6 flex-1">
                {NAV_ITEMS.map((item, index) => (
                  <Link
                    key={item.href}
                    href={`/${locale}${item.href}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:text-mb-blue transition-colors uppercase text-lg font-medium py-3 border-b border-mb-border/30 hover:border-mb-blue"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {t(item.labelKey)}
                  </Link>
                ))}

                {/* Language Switcher */}
                <Link
                  href={`/${otherLocale}`}
                  className="text-mb-silver hover:text-white transition-colors uppercase text-sm font-medium py-3 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  {otherLocale.toUpperCase()}
                </Link>
              </div>

              {/* CTA Button at Bottom */}
              <div className="pb-safe">
                <Link
                  href={`/${locale}/booking`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group relative bg-mb-blue text-white w-full py-4 rounded-button hover:bg-mb-blue/90 transition-all duration-300 text-base font-bold uppercase tracking-wide shadow-lg hover:shadow-xl flex items-center justify-center gap-2 overflow-hidden"
                >
                  <svg
                    className="w-5 h-5 relative z-10"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="relative z-10">{t("nav.bookService")}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-mb-blue via-blue-600 to-mb-blue opacity-100 transition-opacity duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
