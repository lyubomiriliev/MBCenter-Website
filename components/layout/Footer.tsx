"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-mb-black via-mb-anthracite to-mb-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,173,239,0.3) 1px, transparent 1px),
                               linear-gradient(to bottom, rgba(0,173,239,0.3) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        {/* Glowing Orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-mb-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-mb-blue/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="group">
              <Image
                src="/assets/logos/mbc-logo-white.png"
                alt="MB Center Sofia"
                width={200}
                height={67}
                className="h-16 w-auto mb-6 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-mb-silver text-sm leading-relaxed max-w-md mb-6">
              {t("footer.about")}
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href={SITE_CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                aria-label="Facebook"
              >
                <div className="w-12 h-12 rounded-full bg-mb-anthracite border border-mb-border flex items-center justify-center text-mb-silver hover:border-mb-blue hover:text-mb-blue transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,173,239,0.3)]">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
              </a>
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                aria-label="Instagram"
              >
                <div className="w-12 h-12 rounded-full bg-mb-anthracite border border-mb-border flex items-center justify-center text-mb-silver hover:border-mb-blue hover:text-mb-blue transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,173,239,0.3)]">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-1 h-4 bg-mb-blue"></span>
              {t("footer.quickLinks")}
            </h4>
            <ul className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={`/${locale}${item.href}`}
                    className="text-mb-silver hover:text-mb-blue transition-colors text-sm inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-mb-blue transition-all duration-300 group-hover:w-4"></span>
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="w-1 h-4 bg-mb-blue"></span>
              {t("footer.contact")}
            </h4>
            <ul className="space-y-4 text-mb-silver text-sm">
              <li className="group">
                <a
                  href={`tel:${SITE_CONFIG.phone}`}
                  className="flex items-start gap-3 hover:text-mb-blue transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-mb-blue/10 flex items-center justify-center group-hover:bg-mb-blue/20 transition-colors">
                    <svg
                      className="w-4 h-4 text-mb-blue"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span>{SITE_CONFIG.phone}</span>
                </a>
              </li>
              <li className="group">
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-start gap-3 hover:text-mb-blue transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-mb-blue/10 flex items-center justify-center group-hover:bg-mb-blue/20 transition-colors">
                    <svg
                      className="w-4 h-4 text-mb-blue"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>{SITE_CONFIG.email}</span>
                </a>
              </li>
              <li className="group">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-mb-blue/10 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-mb-blue"
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
                  </div>
                  <div>
                    <p>{SITE_CONFIG.address.street}</p>
                    <p>
                      {SITE_CONFIG.address.postalCode}{" "}
                      {SITE_CONFIG.address.city}
                    </p>
                  </div>
                </div>
              </li>
              <li className="pt-2">
                <div className="font-semibold text-white mb-2 uppercase text-xs tracking-wider">
                  {t("footer.hours")}
                </div>
                <div>{SITE_CONFIG.hours.weekdays}</div>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-mb-blue/10 pt-8 mb-8">
          <p className="text-mb-silver text-xs leading-relaxed max-w-4xl">
            {t("footer.disclaimer")}
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-mb-blue/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-mb-silver text-sm">
              © {currentYear} {SITE_CONFIG.name}. {t("footer.rights")}.
            </p>
            <Link
              href={`/${locale}/terms`}
              className="text-mb-silver hover:text-mb-blue transition-colors text-sm underline"
            >
              {t("footer.terms")}
            </Link>
          </div>
          <div className="flex items-center gap-2 text-mb-silver text-xs">
            <p>
              Website created by{" "}
              <span className="text-mb-blue cursor-pointer font-bold">
                Lyubomir.Dev
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-mb-blue/50 to-transparent"></div>
    </footer>
  );
}
