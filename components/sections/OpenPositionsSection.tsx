"use client";

import { useTranslations } from "next-intl";

type OpenPositionsSectionProps = {
  title: string;
  positions: string[];
  applyText: string;
};

export function OpenPositionsSection({
  title,
  positions,
  applyText,
}: OpenPositionsSectionProps) {
  const t = useTranslations("career.positions");

  const handleApplyClick = (position: string) => {
    // Scroll to form section
    const formSection = document.getElementById("career-application-form");
    if (formSection) {
      // Calculate offset to account for any fixed headers
      const offset = 80; // Adjust this value based on your header height
      const elementPosition = formSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Set the position in URL hash for form to read
      window.history.pushState(null, "", `#position=${position}`);
      // Trigger a custom event to notify the form
      window.dispatchEvent(
        new CustomEvent("positionSelected", { detail: position })
      );
    }
  };

  return (
    <section className="py-24 bg-mb-black">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white mb-12 text-center tracking-tight">
          {title}
        </h2>
        <div className="space-y-6">
          {positions.map((position) => (
            <div
              key={position}
              className="bg-mb-anthracite p-8 rounded-card border border-mb-border hover:shadow-card transition-shadow"
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                {t(position)}
              </h3>
              <button
                onClick={() => handleApplyClick(position)}
                className="inline-flex items-center gap-2 text-mb-blue hover:text-white transition-colors font-medium cursor-pointer"
              >
                {applyText}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
