"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const otherLocale = locale === "en" ? "bg" : "en";
  
  // Get the path with the other locale, preserving the current page
  const getLocalizedPath = () => {
    // Replace the current locale in the pathname with the other locale
    return pathname.replace(`/${locale}`, `/${otherLocale}`);
  };

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
                src={
                  locale === "en"
                    ? "/assets/logos/mbc-logo-en.png"
                    : "/assets/logos/mbc-logo-white.png"
                }
                alt="MB Center Sofia"
                width={240}
                height={80}
                className="h-14 w-auto"
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
                href={getLocalizedPath()}
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
          {/* Dark Overlay Background with click-to-close */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div className="relative bg-mb-black/70 backdrop-blur-xl h-full overflow-y-auto animate-in slide-in-from-top duration-500">
            <div className="flex flex-col h-full px-6 py-8">
              {/* Navigation Links */}
              <div className="flex flex-col gap-2 flex-1">
                {NAV_ITEMS.map((item, index) => (
                  <Link
                    key={item.href}
                    href={`/${locale}${item.href}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group text-white hover:text-mb-blue transition-all duration-300 uppercase text-lg font-medium py-4 px-4 rounded-lg hover:bg-mb-anthracite/50 border border-transparent hover:border-mb-blue/30 animate-in slide-in-from-right"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{t(item.labelKey)}</span>
                      <svg
                        className="w-5 h-5 text-mb-silver group-hover:text-mb-blue group-hover:translate-x-1 transition-all duration-300"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}

                {/* Contact Info Section */}
                <div
                  className="mt-8 mb-6 space-y-4 animate-in slide-in-from-bottom duration-700"
                  style={{
                    animationDelay: "600ms",
                    animationFillMode: "backwards",
                  }}
                >
                  <div className="border-t border-mb-border/20 pt-6">
                    <h4 className="text-mb-silver text-xs uppercase tracking-wider mb-4 font-semibold">
                      {t("contacts.info.title")}
                    </h4>

                    {/* Address */}
                    <a
                      href="https://www.google.com/maps?sca_esv=1db8b9ddc237ac31&sxsrf=AE3TifNxHXl6TElWovZvLv2HrEmJmKpsdw:1767359204511&iflsig=AOw8s4IAAAAAaVfQ9J49qnv6f7qn6nLx-tM2oQJm2Cuf&uact=5&gs_lp=Egdnd3Mtd2l6GgIYAiIIbWJjZW50ZXIyBBAjGCcyDhAuGIAEGMsBGMcBGK8BMgoQABiABBjLARgKMggQABiABBjLATIEEAAYHjIEEAAYHjIEEAAYHjIEEAAYHjICECYyCBAAGIAEGKIESNsJUABYjwlwAHgAkAEAmAFmoAGLBaoBAzQuM7gBA8gBAPgBAZgCB6ACnwXCAgoQIxjwBRjJAhgnwgILEAAYgAQYsQMYgwHCAggQABiABBixA8ICEBAuGIAEGIoFGEMYxwEY0QPCAhkQLhiABBiKBRhDGMcBGNEDGIsDGNIDGKgDwgIIEC4YgAQYsQPCAgUQABiABMICCxAuGMcBGNEDGIAEwgILEC4YgAQYxwEYrwHCAg0QLhiABBjHARivARgKmAMAkgcDNC4zoAehQ7IHAzQuM7gHnwXCBwUxLjUuMcgHDYAIAQ&um=1&ie=UTF-8&fb=1&gl=bg&sa=X&geocode=KdtDD89Lm6pAMSy6FejRWsV_&daddr=%D0%A1%D0%BE%D1%84%D0%B8%D0%B9%D1%81%D0%BA%D0%B8+%D0%BE%D0%BA%D0%BE%D0%BB%D0%BE%D0%B2%D1%80%D1%8A%D1%81%D1%82%D0%B5%D0%BD+%D0%BF%D1%8A%D1%82,+1700+%D0%A1%D0%BE%D1%84%D0%B8%D1%8F"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-mb-anthracite/30 transition-all duration-300 group mb-3"
                    >
                      <svg
                        className="w-5 h-5 text-mb-blue flex-shrink-0 mt-0.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-white text-sm font-medium mb-1">
                          {SITE_CONFIG.address.street}
                        </p>
                        <p className="text-mb-blue text-xs font-semibold group-hover:text-white transition-colors">
                          {t("nav.viewOnMap")} →
                        </p>
                      </div>
                    </a>

                    {/* Phone */}
                    <a
                      href={`tel:${SITE_CONFIG.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-mb-anthracite/30 transition-all duration-300 group"
                    >
                      <svg
                        className="w-5 h-5 text-mb-blue flex-shrink-0"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className="text-white text-sm font-medium group-hover:text-mb-blue transition-colors">
                        {SITE_CONFIG.phone}
                      </p>
                    </a>
                  </div>
                </div>

                {/* Language Switcher */}
                <Link
                  href={getLocalizedPath()}
                  className="flex items-center gap-3 text-mb-silver hover:text-white transition-all duration-300 uppercase text-sm font-medium py-3 px-4 rounded-lg hover:bg-mb-anthracite/50 animate-in slide-in-from-bottom"
                  style={{
                    animationDelay: "700ms",
                    animationFillMode: "backwards",
                  }}
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
                  <span>{otherLocale.toUpperCase()}</span>
                </Link>
              </div>

              {/* CTA Button at Bottom */}
              <div
                className="pb-safe animate-in slide-in-from-bottom duration-700"
                style={{
                  animationDelay: "800ms",
                  animationFillMode: "backwards",
                }}
              >
                <Link
                  href={`/${locale}/booking`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group relative bg-gradient-to-r from-mb-blue via-blue-600 to-mb-blue text-white w-full py-5 rounded-xl hover:shadow-2xl hover:shadow-mb-blue/50 transition-all duration-500 text-base font-bold uppercase tracking-wide flex items-center justify-center gap-3 overflow-hidden hover:scale-[1.02]"
                >
                  <svg
                    className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300"
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
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-mb-blue to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
