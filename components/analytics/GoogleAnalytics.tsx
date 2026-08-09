export const GA_MEASUREMENT_ID = "G-LLZSG5QGC9";

/**
 * Google tag (gtag.js).
 *
 * Rendered as plain <script> tags rather than via next/script: with
 * `output: "export"`, next/script's afterInteractive strategy emits only a
 * preload <link> into the static HTML and never injects the executing
 * <script>, so the tag silently never fires. Plain tags are also exactly what
 * Google's own install instructions specify.
 *
 * Enhanced Measurement does not report this app's client-side navigations, so
 * pages under a router mount <GoogleAnalyticsPageView /> and pass
 * sendPageView={false} to let that component own every page_view.
 */
type Props = {
  /**
   * Whether gtag itself sends the initial page_view.
   *
   * false wherever <GoogleAnalyticsPageView /> is mounted — that component
   * reports the first view too, so leaving this on double-counts it.
   * true on standalone pages with no router-driven tracker (the root "/"
   * redirect stub and the 404), where it is the only thing reporting.
   */
  sendPageView?: boolean;
};

export function GoogleAnalytics({ sendPageView = false }: Props) {
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: ${sendPageView} });
          `.trim(),
        }}
      />
    </>
  );
}
