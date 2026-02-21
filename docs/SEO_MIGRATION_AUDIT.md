# SEO Migration Audit — WordPress → Next.js (mbcenter.bg)

**Old site:** https://mbcenter.bg/ (WordPress)  
**New site:** Next.js SSG static export, baseUrl: https://mbcenter.bg  
**Goal:** Preserve rankings, zero equity loss.

---

## Step 1 — Old Site (WordPress) Snapshot

*Full crawl must be done with Screaming Frog, Sitebulb, or similar. Below is a sample from the live homepage.*

### Observed URLs and structure (from homepage fetch)

| Old URL (WordPress) | Notes |
|--------------------|--------|
| https://mbcenter.bg/ | Root (Bulgarian) |
| https://mbcenter.bg/home/ | Home |
| https://mbcenter.bg/about-us/ | About |
| https://mbcenter.bg/contact-us/ | Contact |
| https://mbcenter.bg/ (services) | “Сервиз и софтуерни услуги” links to root |

**Page title (old):** “MB Center – Mercedes-Benz специализиран сервиз – Mercedes-Benz специализиран сервиз за Мерцедес в гр. София”

**Action:** Run a full crawl of https://mbcenter.bg/ (all links, sitemap, robots.txt) and export:
- All 200 URLs
- 301/302 redirects
- Titles, meta descriptions, H1/H2, canonicals, OG tags, JSON-LD, internal links, image alts.

---

## Step 2 — New Next.js Project SEO Signals

### Routes (public, indexable)

| Path | Locales | generateMetadata | Canonical / OG |
|------|---------|------------------|----------------|
| `/` | bg, en | ✅ (seo.home) | ✅ alternates + OG |
| `/about` | bg, en | ✅ | ✅ |
| `/services` | bg, en | ✅ | ✅ |
| `/gallery` | bg, en | ✅ | ✅ |
| `/career` | bg, en | ✅ | ✅ |
| `/contacts` | bg, en | ✅ | ✅ |
| `/booking` | bg, en | ✅ | ✅ |
| `/terms` | bg, en | ✅ | ✅ |

**Admin/mechanics (noindex or behind auth):** `/admin-login`, `/mb-admin/*`, `/mb-admin-mechanics/*` — exclude from sitemap and keep out of crawl or noindex.

### Current implementation

- **Canonical / alternates:** `generateAlternateLinks(locale, path)` in layout and pages; canonical and hreflang are set.
- **OG/Twitter:** Layout has OG and Twitter; pages extend with title/description/url.
- **Robots:** Layout sets `index: true, follow: true` and googleBot options.
- **JSON-LD:** `generateLocalBusinessSchema(locale)` — type `AutoRepair`; injected in `[locale]/layout.tsx`.

### Gaps to fix

1. **Sitemap vs next.config:** `next.config.js` has `trailingSlash: false`, but `public/sitemap.xml` uses trailing slashes (e.g. `/en/about/`). **Fix:** Sitemap URLs must use no trailing slash.
2. **x-default:** Sitemap uses `x-default` to `/en/`. Default locale in app is `bg`. **Fix:** Set `x-default` to `https://mbcenter.bg/bg` for the Bulgarian version.
3. **Terms in sitemap:** `/terms` has SEO copy but is not in sitemap. **Decision:** Add if you want it indexed; otherwise keep noindex or omit from sitemap.
4. **BreadcrumbList:** Not implemented. Add JSON-LD BreadcrumbList on inner pages.
5. **Service/FAQ schema:** Not implemented. Add per-service or FAQ JSON-LD if you have clear Q&A or service list.
6. **OG image:** Layout references `/og-image.jpg` — ensure file exists and is 1200×630.

---

## Step 3 — URL Comparison & 301 Redirect Map

**Assumed mapping (confirm with full WordPress crawl):**

| Old URL (WordPress) | New URL (Next.js) | Action |
|--------------------|-------------------|--------|
| https://mbcenter.bg/ | https://mbcenter.bg/bg | 301 to default locale |
| https://mbcenter.bg/home/ | https://mbcenter.bg/bg | 301 |
| https://mbcenter.bg/about-us/ | https://mbcenter.bg/bg/about | 301 |
| https://mbcenter.bg/contact-us/ | https://mbcenter.bg/bg/contacts | 301 |
| (any /services/ if exists) | https://mbcenter.bg/bg/services | 301 |
| (any /gallery/ if exists) | https://mbcenter.bg/bg/gallery | 301 |
| (any /career/ if exists) | https://mbcenter.bg/bg/career | 301 |
| (any /booking/ if exists) | https://mbcenter.bg/bg/booking | 301 |

**Trailing slash:** New site has `trailingSlash: false`. Redirects should point to URLs **without** trailing slash (e.g. `/bg/about`).

**Where to implement 301s:** Static export does not run Next.js `redirects()`. Configure redirects on:
- **Vercel:** `vercel.json` or Dashboard Redirects
- **Netlify:** `_redirects` or `netlify.toml`
- **Nginx/Apache:** server config using the same map

See `docs/REDIRECT_MAP.md` for the exact list to paste into your host.

---

## Step 4 — SEO Preservation Rules Checklist

| Rule | Status |
|------|--------|
| URL structure matches or redirects from old | ⚠️ Redirect map required |
| Titles keep primary keywords (Mercedes-Benz, София, сервиз) | ✅ seo.* in messages |
| Unique meta descriptions per page | ✅ |
| One H1 per page | ✅ Verify in components |
| Strong internal linking | ✅ Nav + CTAs |
| Important keywords in visible content | ✅ Preserve in copy |
| No orphan pages | ✅ All in nav or linked |
| Sitemap = canonical 200 only | ⚠️ Fix trailing slash + x-default |
| Robots.txt allows important pages | ✅ Allow: / |
| Word count maintained/improved for key pages | Manual check per URL |

---

## Step 5 — Structured Data (JSON-LD)

### Already present

- **LocalBusiness / AutoRepair** in `lib/seo.ts` — name, url, telephone, address, openingHours, sameAs.

### Recommended additions

1. **BreadcrumbList** (per page)
   - Home → About / Services / Contacts / etc.
2. **WebPage** (optional) — same as canonical URL, name from title.
3. **Service** (optional) — for /services if you list discrete services with names and descriptions.

**BreadcrumbList example (BG About):**

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Начало", "item": "https://mbcenter.bg/bg" },
    { "@type": "ListItem", "position": 2, "name": "За нас", "item": "https://mbcenter.bg/bg/about" }
  ]
}
```

**AutomotiveBusiness** (optional, if you want to stress auto repair):

- In `lib/seo.ts`, you can add `"@type": ["AutoRepair", "AutomotiveBusiness"]` or a second graph with `AutomotiveBusiness` and same core fields.

---

## Step 6 — Performance (Next.js)

| Check | Status |
|-------|--------|
| Static generation | ✅ SSG / static export |
| Images | Use next/image where possible |
| Fonts | Inter with display: swap ✅ |
| Viewport meta | Set by Next.js |
| No blocking JS for core content | Ensure critical path is minimal |

---

## Step 7 — Priority Fix List

### Critical

1. **Configure 301 redirects** from every old WordPress URL to the correct new URL (no trailing slash). Use `docs/REDIRECT_MAP.md`.
2. **Sitemap:** Remove trailing slashes from all `<loc>` and set x-default to `https://mbcenter.bg/bg`.
3. **Root domain:** Ensure https://mbcenter.bg/ 301s to https://mbcenter.bg/bg (or your chosen default locale).

### Medium

4. Add **BreadcrumbList** JSON-LD on all main content pages.
5. Add **terms** to sitemap if you want it indexed (and ensure no duplicate canonicals).
6. Verify **og-image** exists at `/public/og-image.jpg` (1200×630).

### Low

7. Add **Service** or **FAQ** schema where it fits (e.g. /services).
8. Consider **AutomotiveBusiness** in addition to AutoRepair in `lib/seo.ts`.
9. After launch, run a full crawl of the new site and fix any missing meta, duplicate titles, or broken links.

---

## Files to Create/Update

- `docs/REDIRECT_MAP.md` — 301 map for host config.
- `public/sitemap.xml` — no trailing slash; x-default → bg.
- `lib/seo.ts` — optional BreadcrumbList helper and AutomotiveBusiness.
- Page components — inject BreadcrumbList where needed (or via layout).

---

*Run a full crawl of both old and new sites before and after launch to validate redirects, indexability, and meta.*
