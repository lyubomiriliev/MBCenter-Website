import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";
import { getSiteConfig } from "@/lib/constants";

export function WhereToFindUs() {
  const t = useTranslations();
  const locale = useLocale();
  const config = getSiteConfig(locale);

  return (
    <section className="py-20 sm:pt-20 bg-mb-black relative overflow-hidden">
      {/* Background Pattern with Overlay */}
      <div className="absolute inset-0 opacity-5">
        <Image
          src="/assets/images/star-pattern-bg.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      {/* Gradient Accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-mb-blue/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <AnimatedText className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
            {t("home.whereToFind.title")}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-mb-silver max-w-2xl mx-auto mb-3 sm:mb-4">
            {t("home.whereToFind.subtitle")}
          </p>
          <div className="w-24 h-1 bg-mb-blue mx-auto"></div>
        </AnimatedText>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Address */}
          <AnimatedSection delay={0.1} from="left">
            <div className="group relative h-full">
              {/* Card Background with Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-mb-blue/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative h-full bg-mb-anthracite/80 backdrop-blur-sm border border-mb-border hover:border-mb-blue rounded-2xl p-4 sm:p-6 transition-all duration-500 group-hover:transform group-hover:scale-105">
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-mb-blue/20 to-mb-blue/5 border-2 border-mb-blue/30 flex items-center justify-center group-hover:border-mb-blue group-hover:shadow-lg group-hover:shadow-mb-blue/30 transition-all duration-500">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-mb-blue"
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
                </div>

                {/* Content */}
                <div className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 text-center">
                  {t("home.whereToFind.addressTitle")}
                </div>
                <div className="text-mb-silver leading-relaxed text-center space-y-0.5">
                  <p className="text-sm sm:text-base">
                    {config.address.street}
                  </p>
                  <p className="text-sm sm:text-base">
                    {config.address.city}, {config.address.country}
                  </p>
                </div>

                {/* View on Map Link */}
                <div className="mt-4 text-center">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${config.address.street}, ${config.address.city}, ${config.address.country}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("home.whereToFind.viewMap")}
                    className="inline-flex items-center gap-2 text-mb-blue hover:text-white transition-colors text-sm font-medium group/link"
                  >
                    {t("home.whereToFind.viewMap")}
                    <svg
                      className="w-4 h-4 group-hover/link:translate-x-1 transition-transform"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Phone */}
          <AnimatedSection delay={0.2} from="bottom">
            <div className="group relative h-full">
              {/* Card Background with Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-mb-blue/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative h-full bg-mb-anthracite/80 backdrop-blur-sm border border-mb-border hover:border-mb-blue rounded-2xl p-4 sm:p-6 transition-all duration-500 group-hover:transform group-hover:scale-105">
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-mb-blue/20 to-mb-blue/5 border-2 border-mb-blue/30 flex items-center justify-center group-hover:border-mb-blue group-hover:shadow-lg group-hover:shadow-mb-blue/30 transition-all duration-500">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-mb-blue"
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
                </div>

                {/* Content */}
                <div className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 text-center">
                  {t("home.whereToFind.phoneTitle")}
                </div>
                <div className="text-center">
                  <a
                    href={`tel:${config.phone.replace(/\s/g, "")}`}
                    aria-label={`${t("home.whereToFind.phoneTitle")}: ${
                      config.phone
                    }`}
                    className="text-base sm:text-lg text-mb-blue hover:text-white transition-colors font-medium inline-block"
                  >
                    {config.phone}
                  </a>
                </div>

                {/* Working Hours */}
                <div className="mt-4 pt-4 border-t border-mb-border/50 text-center">
                  <p className="text-xs text-mb-silver/80 mb-1">
                    {t("home.whereToFind.hoursLabel")}
                  </p>
                  <p className="text-xs sm:text-sm text-mb-silver">
                    {config.hours.weekdays}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Email */}
          <AnimatedSection delay={0.3} from="right">
            <div className="group relative h-full">
              {/* Card Background with Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-mb-blue/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative h-full bg-mb-anthracite/80 backdrop-blur-sm border border-mb-border hover:border-mb-blue rounded-2xl p-4 sm:p-6 transition-all duration-500 group-hover:transform group-hover:scale-105">
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-mb-blue/20 to-mb-blue/5 border-2 border-mb-blue/30 flex items-center justify-center group-hover:border-mb-blue group-hover:shadow-lg group-hover:shadow-mb-blue/30 transition-all duration-500">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-mb-blue"
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
                </div>

                {/* Content */}
                <div className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 text-center">
                  {t("home.whereToFind.emailTitle")}
                </div>
                <div className="text-center">
                  <a
                    href={`mailto:${config.email}`}
                    aria-label={`${t("home.whereToFind.emailTitle")}: ${
                      config.email
                    }`}
                    className="text-sm sm:text-base text-mb-blue hover:text-white transition-colors font-medium inline-block break-all"
                  >
                    {config.email}
                  </a>
                </div>

                {/* Social Links */}
                <div className="mt-4 pt-4 border-t border-mb-border/50">
                  <p className="text-xs text-mb-silver/80 mb-2 text-center">
                    {t("home.whereToFind.followUs")}
                  </p>
                  <div className="flex justify-center gap-3">
                    <a
                      href={config.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="w-10 h-10 rounded-full bg-mb-blue/10 border border-mb-blue/30 flex items-center justify-center hover:bg-mb-blue hover:border-mb-blue transition-all duration-300 group/social"
                    >
                      <svg
                        className="w-5 h-5 text-mb-blue group-hover/social:text-white transition-colors"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a
                      href={config.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="w-10 h-10 rounded-full bg-mb-blue/10 border border-mb-blue/30 flex items-center justify-center hover:bg-mb-blue hover:border-mb-blue transition-all duration-300 group/social"
                    >
                      <svg
                        className="w-5 h-5 text-mb-blue group-hover/social:text-white transition-colors"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
