import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { PatternBackground } from "@/components/sections/PatternBackground";
import { AnimatedText } from "@/components/animations/AnimatedText";
import { generateAlternateLinks } from "@/lib/seo";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({
  params: { locale },
}: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo.terms" });
  const alternateLinks = generateAlternateLinks(locale, "/terms");

  return {
    title: t("title"),
    description: t("description"),
    alternates: alternateLinks,
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: alternateLinks.canonical,
    },
  };
}

export default function TermsPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const t = useTranslations("terms");

  return (
    <PatternBackground className="py-16 md:py-24 bg-mb-black">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <AnimatedText className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            {t("title")}
          </h1>
          <div className="w-24 h-1 bg-mb-blue mx-auto"></div>
        </AnimatedText>

        <div className="bg-mb-anthracite rounded-card border border-mb-border p-8 md:p-12 prose prose-invert prose-lg max-w-none">
          <div className="text-mb-silver space-y-8 leading-relaxed">
            {/* Header */}
            <div className="text-center border-b border-mb-border pb-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                {t("header.title")}
              </h2>
              <p className="text-lg font-semibold text-mb-blue mb-2">
                {t("header.subtitle")}
              </p>
              <p className="text-sm">{t("header.uic")}</p>
              <p className="text-sm mt-2 whitespace-pre-line">
                {t("header.address")}
              </p>
            </div>

            {/* Chapter I */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.i.title")}
              </h3>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.i.art1.title")}
                </p>
                <p className="mb-4">{t("chapters.i.art1.content")}</p>
              </article>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.i.art2.title")}
                </p>
                <p className="mb-2">{t("chapters.i.art2.p1")}</p>
                <p>{t("chapters.i.art2.p2")}</p>
              </article>
            </section>

            {/* Chapter II */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.ii.title")}
              </h3>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.ii.art3.title")}
                </p>
                <p className="mb-2">{t("chapters.ii.art3.p1")}</p>
                <p className="mb-2">{t("chapters.ii.art3.p2")}</p>
                <p className="mb-2">{t("chapters.ii.art3.p3")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>{t("chapters.ii.art3.dataCategories.1")}</li>
                  <li>{t("chapters.ii.art3.dataCategories.2")}</li>
                  <li>{t("chapters.ii.art3.dataCategories.3")}</li>
                  <li>{t("chapters.ii.art3.dataCategories.4")}</li>
                  <li>{t("chapters.ii.art3.dataCategories.5")}</li>
                </ul>
                <p className="mb-2">{t("chapters.ii.art3.p4")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>{t("chapters.ii.art3.purposes.1")}</li>
                  <li>{t("chapters.ii.art3.purposes.2")}</li>
                  <li>{t("chapters.ii.art3.purposes.3")}</li>
                  <li>{t("chapters.ii.art3.purposes.4")}</li>
                  <li>{t("chapters.ii.art3.purposes.5")}</li>
                  <li>{t("chapters.ii.art3.purposes.6")}</li>
                </ul>
                <p>{t("chapters.ii.art3.p5")}</p>
              </article>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.ii.art4.title")}
                </p>
                <p className="mb-2">{t("chapters.ii.art4.p1")}</p>
                <p className="mb-2">{t("chapters.ii.art4.p2")}</p>
                <p className="mb-2">{t("chapters.ii.art4.p3")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>{t("chapters.ii.art4.rights.1")}</li>
                  <li>{t("chapters.ii.art4.rights.2")}</li>
                  <li>{t("chapters.ii.art4.rights.3")}</li>
                  <li>{t("chapters.ii.art4.rights.4")}</li>
                  <li>{t("chapters.ii.art4.rights.5")}</li>
                  <li>{t("chapters.ii.art4.rights.6")}</li>
                </ul>
                <p className="mb-2">{t("chapters.ii.art4.p4")}</p>
                <p className="mb-2">{t("chapters.ii.art4.p5")}</p>
                <p className="mb-2">{t("chapters.ii.art4.p6")}</p>
                <p className="mb-2">{t("chapters.ii.art4.p7")}</p>
                <p>{t("chapters.ii.art4.p8")}</p>
              </article>
            </section>

            {/* Chapter III */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.iii.title")}
              </h3>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.iii.art5.title")}
                </p>
                <p className="mb-2">{t("chapters.iii.art5.p1")}</p>
                <p className="mb-2">{t("chapters.iii.art5.p2")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>{t("chapters.iii.art5.warrantyPeriods.1")}</li>
                  <li>{t("chapters.iii.art5.warrantyPeriods.2")}</li>
                </ul>
                <p className="mb-2">{t("chapters.iii.art5.p3")}</p>
                <p className="mb-2">{t("chapters.iii.art5.p4")}</p>
                <p className="mb-2">{t("chapters.iii.art5.p5")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>{t("chapters.iii.art5.voidConditions.1")}</li>
                  <li>{t("chapters.iii.art5.voidConditions.2")}</li>
                  <li>{t("chapters.iii.art5.voidConditions.3")}</li>
                  <li>{t("chapters.iii.art5.voidConditions.4")}</li>
                  <li>{t("chapters.iii.art5.voidConditions.5")}</li>
                </ul>
                <p className="mb-2">{t("chapters.iii.art5.p6")}</p>
                <p className="mb-2">{t("chapters.iii.art5.p7")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>{t("chapters.iii.art5.exclusions.1")}</li>
                  <li>{t("chapters.iii.art5.exclusions.2")}</li>
                  <li>{t("chapters.iii.art5.exclusions.3")}</li>
                  <li>{t("chapters.iii.art5.exclusions.4")}</li>
                </ul>
                <p>{t("chapters.iii.art5.p8")}</p>
              </article>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.iii.art6.title")}
                </p>
                <p className="mb-2">{t("chapters.iii.art6.p1")}</p>
                <p className="mb-2">{t("chapters.iii.art6.p2")}</p>
                <p className="mb-2">{t("chapters.iii.art6.p3")}</p>
                <p className="mb-2">{t("chapters.iii.art6.p4")}</p>
                <p className="mb-2">{t("chapters.iii.art6.p5")}</p>
                <p className="mb-2">{t("chapters.iii.art6.p6")}</p>
                <p className="mb-2">{t("chapters.iii.art6.p7")}</p>
                <p>{t("chapters.iii.art6.p8")}</p>
              </article>
            </section>

            {/* Chapter IV */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.iv.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.iv.art7.title")}
                </p>
                <p className="mb-2">{t("chapters.iv.art7.p1")}</p>
                <p className="mb-2">{t("chapters.iv.art7.p2")}</p>
                <p>{t("chapters.iv.art7.p3")}</p>
              </article>
            </section>

            {/* Chapter V */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.v.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.v.art8.title")}
                </p>
                <p className="mb-2">{t("chapters.v.art8.p1")}</p>
                <p className="mb-2">{t("chapters.v.art8.p2")}</p>
                <p>{t("chapters.v.art8.p3")}</p>
              </article>
            </section>

            {/* Chapter VI */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.vi.title")}
              </h3>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.vi.art9.title")}
                </p>
                <p className="mb-2">{t("chapters.vi.art9.p1")}</p>
                <p>{t("chapters.vi.art9.p2")}</p>
              </article>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.vi.art10.title")}
                </p>
                <p>{t("chapters.vi.art10.content")}</p>
              </article>
            </section>

            {/* Chapter VII */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.vii.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.vii.art11.title")}
                </p>
                <p className="mb-2">{t("chapters.vii.art11.p1")}</p>
                <p className="mb-2">{t("chapters.vii.art11.p2")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{t("chapters.vii.art11.exclusions.1")}</li>
                  <li>{t("chapters.vii.art11.exclusions.2")}</li>
                  <li>{t("chapters.vii.art11.exclusions.3")}</li>
                  <li>{t("chapters.vii.art11.exclusions.4")}</li>
                </ul>
              </article>
            </section>

            {/* Chapter VIII */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.viii.title")}
              </h3>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.viii.art12.title")}
                </p>
                <p className="mb-2">{t("chapters.viii.art12.p1")}</p>
                <p>{t("chapters.viii.art12.p2")}</p>
              </article>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.viii.art13.title")}
                </p>
                <p>{t("chapters.viii.art13.content")}</p>
              </article>
            </section>

            {/* Chapter IX */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.ix.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.ix.art14.title")}
                </p>
                <p className="mb-2">{t("chapters.ix.art14.p1")}</p>
                <p>{t("chapters.ix.art14.p2")}</p>
              </article>
            </section>

            {/* Chapter X */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.x.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.x.art15.title")}
                </p>
                <p className="mb-2">{t("chapters.x.art15.p1")}</p>
                <p className="mb-2">{t("chapters.x.art15.p2")}</p>
                <p className="mb-2">{t("chapters.x.art15.p3")}</p>
                <p>{t("chapters.x.art15.p4")}</p>
              </article>
            </section>

            {/* Chapter XI */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xi.title")}
              </h3>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xi.art16.title")}
                </p>
                <p className="mb-2">{t("chapters.xi.art16.p1")}</p>
                <p className="mb-2">{t("chapters.xi.art16.p2")}</p>
                <p>{t("chapters.xi.art16.p3")}</p>
              </article>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xi.art17.title")}
                </p>
                <p className="mb-2">{t("chapters.xi.art17.p1")}</p>
                <p className="mb-2">{t("chapters.xi.art17.p2")}</p>
                <p>{t("chapters.xi.art17.p3")}</p>
              </article>
            </section>

            {/* Chapter XII */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xii.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xii.art18.title")}
                </p>
                <p className="mb-2">{t("chapters.xii.art18.p1")}</p>
                <p className="mb-2">{t("chapters.xii.art18.p2")}</p>
                <p className="mb-2">{t("chapters.xii.art18.p3")}</p>
                <p className="mb-2">{t("chapters.xii.art18.p4")}</p>
                <p className="mb-2">{t("chapters.xii.art18.p5")}</p>
                <p className="mb-2">{t("chapters.xii.art18.p6")}</p>
                <p>{t("chapters.xii.art18.p7")}</p>
              </article>
            </section>

            {/* Chapter XIII */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xiii.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xiii.art19.title")}
                </p>
                <p className="mb-2">{t("chapters.xiii.art19.p1")}</p>
                <p>{t("chapters.xiii.art19.p2")}</p>
              </article>
            </section>

            {/* Chapter XIV */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xiv.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xiv.art20.title")}
                </p>
                <p className="mb-2">{t("chapters.xiv.art20.p1")}</p>
                <p>{t("chapters.xiv.art20.p2")}</p>
              </article>
            </section>

            {/* Chapter XV */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xv.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xv.art21.title")}
                </p>
                <p className="mb-2">{t("chapters.xv.art21.p1")}</p>
                <p>{t("chapters.xv.art21.p2")}</p>
              </article>
            </section>

            {/* Chapter XVI */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xvi.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xvi.art22.title")}
                </p>
                <p className="mb-2">{t("chapters.xvi.art22.p1")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{t("chapters.xvi.art22.cases.1")}</li>
                  <li>{t("chapters.xvi.art22.cases.2")}</li>
                  <li>{t("chapters.xvi.art22.cases.3")}</li>
                  <li>{t("chapters.xvi.art22.cases.4")}</li>
                </ul>
              </article>
            </section>

            {/* Chapter XVII */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xvii.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xvii.art23.title")}
                </p>
                <p className="mb-2">{t("chapters.xvii.art23.p1")}</p>
                <p>{t("chapters.xvii.art23.p2")}</p>
              </article>
            </section>

            {/* Chapter XVIII */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xviii.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xviii.art24.title")}
                </p>
                <p className="mb-2">{t("chapters.xviii.art24.p1")}</p>
                <p>{t("chapters.xviii.art24.p2")}</p>
              </article>
            </section>

            {/* Chapter XIX */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xix.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xix.art25.title")}
                </p>
                <p className="mb-2">{t("chapters.xix.art25.p1")}</p>
                <p>{t("chapters.xix.art25.p2")}</p>
              </article>
            </section>

            {/* Chapter XX */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xx.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xx.art26.title")}
                </p>
                <p className="mb-2">{t("chapters.xx.art26.p1")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>{t("chapters.xx.art26.reasons.1")}</li>
                  <li>{t("chapters.xx.art26.reasons.2")}</li>
                  <li>{t("chapters.xx.art26.reasons.3")}</li>
                  <li>{t("chapters.xx.art26.reasons.4")}</li>
                </ul>
                <p>{t("chapters.xx.art26.p2")}</p>
              </article>
            </section>

            {/* Chapter XXI */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xxi.title")}
              </h3>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxi.art27.title")}
                </p>
                <p className="mb-2">{t("chapters.xxi.art27.p1")}</p>
                <p className="mb-2">{t("chapters.xxi.art27.p2")}</p>
                <p className="mb-2">{t("chapters.xxi.art27.p3")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>{t("chapters.xxi.art27.purposes.1")}</li>
                  <li>{t("chapters.xxi.art27.purposes.2")}</li>
                  <li>{t("chapters.xxi.art27.purposes.3")}</li>
                </ul>
              </article>
            </section>

            {/* Chapter XXII */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xxii.title")}
              </h3>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxii.art28.title")}
                </p>
                <p className="mb-2">{t("chapters.xxii.art28.p1")}</p>
                <p>{t("chapters.xxii.art28.p2")}</p>
              </article>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxii.art29.title")}
                </p>
                <p className="mb-2">{t("chapters.xxii.art29.p1")}</p>
                <p className="mb-2">{t("chapters.xxii.art29.p2")}</p>
                <p>{t("chapters.xxii.art29.p3")}</p>
              </article>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxii.art30.title")}
                </p>
                <p className="mb-2">{t("chapters.xxii.art30.p1")}</p>
                <p className="mb-2">{t("chapters.xxii.art30.p2")}</p>
                <p className="mb-2">{t("chapters.xxii.art30.p3")}</p>
                <p className="mb-2">{t("chapters.xxii.art30.p4")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>{t("chapters.xxii.art30.documents.1")}</li>
                  <li>{t("chapters.xxii.art30.documents.2")}</li>
                  <li>{t("chapters.xxii.art30.documents.3")}</li>
                </ul>
                <p>{t("chapters.xxii.art30.p5")}</p>
              </article>
            </section>

            {/* Chapter XXIII */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xxiii.title")}
              </h3>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxiii.art31.title")}
                </p>
                <p className="mb-2">{t("chapters.xxiii.art31.p1")}</p>
                <p>{t("chapters.xxiii.art31.p2")}</p>
              </article>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxiii.art32.title")}
                </p>
                <p className="mb-2">{t("chapters.xxiii.art32.p1")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>{t("chapters.xxiii.art32.reasons.1")}</li>
                  <li>{t("chapters.xxiii.art32.reasons.2")}</li>
                  <li>{t("chapters.xxiii.art32.reasons.3")}</li>
                  <li>{t("chapters.xxiii.art32.reasons.4")}</li>
                </ul>
                <p>{t("chapters.xxiii.art32.p2")}</p>
              </article>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxiii.art33.title")}
                </p>
                <p className="mb-2">{t("chapters.xxiii.art33.p1")}</p>
                <p className="mb-2">{t("chapters.xxiii.art33.p2")}</p>
                <p>{t("chapters.xxiii.art33.p3")}</p>
              </article>
            </section>

            {/* Chapter XXIV */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xxiv.title")}
              </h3>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxiv.art34.title")}
                </p>
                <p className="mb-2">{t("chapters.xxiv.art34.p1")}</p>
                <p className="mb-2">{t("chapters.xxiv.art34.p2")}</p>
                <p>{t("chapters.xxiv.art34.p3")}</p>
              </article>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxiv.art35.title")}
                </p>
                <p className="mb-2">{t("chapters.xxiv.art35.p1")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>{t("chapters.xxiv.art35.methods.1")}</li>
                  <li>{t("chapters.xxiv.art35.methods.2")}</li>
                  <li>{t("chapters.xxiv.art35.methods.3")}</li>
                </ul>
                <p className="mb-2">{t("chapters.xxiv.art35.p2")}</p>
                <p>{t("chapters.xxiv.art35.p3")}</p>
              </article>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxiv.art36.title")}
                </p>
                <p className="mb-2">{t("chapters.xxiv.art36.p1")}</p>
                <p className="mb-2">{t("chapters.xxiv.art36.p2")}</p>
                <p className="mb-2">{t("chapters.xxiv.art36.p3")}</p>
                <p>{t("chapters.xxiv.art36.p4")}</p>
              </article>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxiv.art37.title")}
                </p>
                <p className="mb-2">{t("chapters.xxiv.art37.p1")}</p>
                <p className="mb-2">{t("chapters.xxiv.art37.p2")}</p>
                <p>{t("chapters.xxiv.art37.p3")}</p>
              </article>
            </section>

            {/* Chapter XXV */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4 border-b border-mb-border pb-2">
                {t("chapters.xxv.title")}
              </h3>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxv.art38.title")}
                </p>
                <p className="mb-2">{t("chapters.xxv.art38.p1")}</p>
                <p className="mb-2">{t("chapters.xxv.art38.p2")}</p>
                <p>{t("chapters.xxv.art38.p3")}</p>
              </article>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxv.art39.title")}
                </p>
                <p className="mb-2">{t("chapters.xxv.art39.p1")}</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-2">
                  <li>{t("chapters.xxv.art39.reasons.1")}</li>
                  <li>{t("chapters.xxv.art39.reasons.2")}</li>
                  <li>{t("chapters.xxv.art39.reasons.3")}</li>
                  <li>{t("chapters.xxv.art39.reasons.4")}</li>
                  <li>{t("chapters.xxv.art39.reasons.5")}</li>
                </ul>
                <p>{t("chapters.xxv.art39.p2")}</p>
              </article>
              <article className="mb-6">
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxv.art40.title")}
                </p>
                <p className="mb-2">{t("chapters.xxv.art40.p1")}</p>
                <p className="mb-2">{t("chapters.xxv.art40.p2")}</p>
                <p>{t("chapters.xxv.art40.p3")}</p>
              </article>
              <article>
                <p className="font-semibold text-white mb-2">
                  {t("chapters.xxv.art41.title")}
                </p>
                <p className="mb-2">{t("chapters.xxv.art41.p1")}</p>
                <p className="mb-2">{t("chapters.xxv.art41.p2")}</p>
                <p>{t("chapters.xxv.art41.p3")}</p>
              </article>
            </section>

            {/* Footer info */}
            <div className="border-t border-mb-border pt-8 mt-12 text-center">
              <p className="font-semibold text-white mb-4">
                {t("footer.company")}
              </p>
              <p className="mb-2">{t("footer.phone")}</p>
              <p className="mb-2">{t("footer.email")}</p>
              <p className="mb-4">{t("footer.website")}</p>
              <p className="text-sm text-mb-silver">{t("footer.effectiveDate")}</p>
            </div>
          </div>
        </div>
      </div>
    </PatternBackground>
  );
}
