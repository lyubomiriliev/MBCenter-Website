# Next.js SEO checklist (vs old site issues)

Addresses the crawl issues from the old mbcenter.bg site so the new site keeps or improves rankings.

## Done on the new site

- **One H1 per page:** Home, about, services, contacts, booking use VideoHero/ImageHero with `<h1>`. Terms page has its own H1. No duplicate H1.
- **Heading order:** Sections use H2 after hero H1; no H1→H4 skips in main pages.
- **Meta & canonical:** Every public page has `generateMetadata` with title, description, and `generateAlternateLinks` (canonical + hreflang).
- **Titles:** SEO titles in `messages/*.json` under `seo.*.title` are under ~70 chars. Keep new copy within that.
- **Redirects:** See `REDIRECT_MAP.md`. All crawled old URLs (/, /home, /about-us, /contact-us, /terms, ?page_id=3122) redirect to the new locale paths.

## To maintain / improve

1. **Images**
   - Hero backgrounds (VideoHero/ImageHero, CTABand, WhereToFindUs patterns): `alt=""` is correct (decorative).
   - Content images: use short, descriptive `alt` (e.g. car model, service name). Avoid generic "image" or wrong context (e.g. car photo not "Viber").
2. **Meta descriptions**
   - Every indexable page must have a unique, non-empty `description` in `generateMetadata` (from `seo.*.description`). Already set for home, about, services, gallery, career, contacts, booking, terms.
3. **Internal links**
   - Prefer descriptive anchor text; avoid "click here" or empty links. Nav and CTAs already use clear labels.
4. **Canonical**
   - Do not override or duplicate. Rely on `generateAlternateLinks`; ensure no invalid or relative canonicals in HTML.
5. **Sitemap**
   - `public/sitemap.xml`: includes home, about, services, gallery, career, contacts, booking, terms (bg + en). Update `lastmod` when you change key pages.
6. **Optional: CSP**
   - Old site flagged “Content-Security-Policy missing”. To add on Next.js, set `Content-Security-Policy` in `next.config.js` `headers`. Start with a report-only or relaxed policy; strict CSP can break inline scripts and third-party widgets (e.g. maps, chat).

## Quick checks before launch

- [ ] All redirects from `REDIRECT_MAP.md` applied on host (Vercel/Netlify).
- [ ] `/?page_id=3122` redirects to `/bg/contacts` if your host supports query redirects.
- [ ] No new public page without title/description/canonical.
- [ ] New content images have descriptive `alt`; decorative images use `alt=""`.
