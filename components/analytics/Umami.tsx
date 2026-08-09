export const UMAMI_WEBSITE_ID = "177188c2-124e-415c-8896-78caab2a9060";

/**
 * Umami analytics script, mounted alongside <GoogleAnalytics /> to give a
 * cookieless, privacy-first source to compare GA4's numbers against.
 *
 * Unlike gtag, Umami's script auto-tracks client-side route changes (it
 * patches pushState/replaceState itself), so no separate page-view tracker
 * component is needed here.
 */
export function Umami() {
  return (
    <script
      defer
      src="https://cloud.umami.is/script.js"
      data-website-id={UMAMI_WEBSITE_ID}
    />
  );
}
