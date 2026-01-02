"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { AnimatedText } from "@/components/animations/AnimatedText";
import { PatternBackground } from "@/components/sections/PatternBackground";

type CodingFeature = {
  title: string;
  features: string[];
};

type Generation = {
  id: string;
  name: string;
  models: string;
  system: string;
  image: string;
  categories: CodingFeature[];
};

type CodingByGenerationSectionProps = {
  title: string;
  subtitle: string;
  generations: Generation[];
};

export function CodingByGenerationSection({
  title,
  subtitle,
  generations,
}: CodingByGenerationSectionProps) {
  const t = useTranslations("services.codingGen");
  const [selectedGen, setSelectedGen] = useState(0);

  return (
    <PatternBackground className="py-32 bg-mb-black">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedText className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {title}
          </h2>
          <div className="w-24 h-1 bg-mb-blue mx-auto mb-8"></div>
          <p className="text-xl text-mb-silver max-w-3xl mx-auto">{subtitle}</p>
        </AnimatedText>

        {/* Generation Tabs */}
        <AnimatedSection from="bottom">
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {generations.map((gen, index) => (
              <button
                key={gen.id}
                onClick={() => setSelectedGen(index)}
                className={`px-6 py-3 rounded-button font-medium transition-all duration-300 ${
                  selectedGen === index
                    ? "bg-mb-blue text-white shadow-lg scale-105"
                    : "bg-mb-anthracite text-mb-silver hover:bg-mb-anthracite/70 border border-mb-border"
                }`}
              >
                <div className="text-sm font-bold">{gen.name}</div>
                <div className="text-xs opacity-80">{gen.system}</div>
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Content */}
        <div className="space-y-8">
          {generations.map((gen, index) => (
            <div
              key={gen.id}
              className={`transition-all duration-500 ${
                selectedGen === index ? "opacity-100 block" : "opacity-0 hidden"
              }`}
            >
              {selectedGen === index && (
                <>
                  {/* Header with Image */}
                  <AnimatedSection from="bottom">
                    <div className="bg-mb-anthracite rounded-card overflow-hidden border border-mb-border mb-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="relative h-80 lg:h-auto">
                          <Image
                            src={gen.image}
                            alt={gen.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-8 flex flex-col justify-center">
                          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {gen.name}
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-mb-blue rounded-full"></div>
                              <span className="text-mb-silver">
                                <span className="text-white font-semibold">
                                  {t("models")}:
                                </span>{" "}
                                {gen.models}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-mb-blue rounded-full"></div>
                              <span className="text-mb-silver">
                                <span className="text-white font-semibold">
                                  {t("system")}:
                                </span>{" "}
                                {gen.system}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {gen.categories.map((category, catIndex) => (
                      <AnimatedSection
                        key={catIndex}
                        from="bottom"
                        delay={catIndex * 0.05}
                      >
                        <div className="bg-mb-anthracite rounded-card border border-mb-border p-6 h-full hover:border-mb-blue transition-colors">
                          <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-mb-blue/20 rounded-lg flex items-center justify-center text-mb-blue">
                              ✓
                            </span>
                            {category.title}
                          </h4>
                          <ul className="space-y-2">
                            {category.features.map((feature, featIndex) => (
                              <li
                                key={featIndex}
                                className="flex items-center gap-3 text-mb-silver"
                              >
                                <svg
                                  className="w-5 h-5 text-mb-blue flex-shrink-0"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2.5"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm leading-relaxed">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </AnimatedSection>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </PatternBackground>
  );
}
