# Adding Google Analytics (GA4) to a Next.js App Router site

Notes from wiring GA4 into mbcenter-web (Next 14 App Router, `output: "export"`,
next-intl locale routing). Written so the next site takes ten minutes instead of
an afternoon.

---

## The one thing that will waste your time

**`next/script` does not work with `output: "export"`.**

The obvious approach — `<Script strategy="afterInteractive">` — is what most
tutorials and Google's Next.js guide show. With static export it silently fails:
the exported HTML gets only

```html
<link rel="preload" href="https://www.googletagmanager.com/gtag/js?id=G-XXXX" as="script"/>
```

and **never** the executing `<script>` tag. A preload downloads nothing on its
own and executes nothing. `window.gtag` stays `undefined`, no hit is ever sent,
and GA keeps showing "No data received in the last 48 hours."

It fails *silently* — no console error, no build warning.

**Fix: use plain `<script>` tags.** That is also literally what Google's own
install instructions tell you to paste.

```tsx
<script async src={`https://www.googletagmanager.com/gtag/js?id=${ID}`} />
<script dangerouslySetInnerHTML={{ __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${ID}', { send_page_view: false });
`}} />
```

> If the site is a normal SSR/Node Next.js app (no `output: "export"`),
> `next/script` is fine. This trap is specific to static export.

---

## The second thing: SPA navigations are not counted

App Router `<Link>` navigations use `history.pushState` — the document never
reloads, so the inline `gtag('config', ...)` runs exactly **once per browser
session**, on first load. Every internal navigation after that is invisible.

People assume GA4 Enhanced Measurement handles this because the GA UI lists a
"page changes based on browser history events" setting. **Verified on this site:
it did not fire.** `pushState` ran, `gtag` was still a live function, and zero
hits were sent. Do not rely on it.

**Fix: send `page_view` yourself on every route change**, and turn off gtag's
automatic one so the first view isn't counted twice.

```tsx
"use client";
export function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const q = searchParams.toString();
    window.gtag("event", "page_view", {
      page_path: q ? `${pathname}?${q}` : pathname,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA_MEASUREMENT_ID,
    });
  }, [pathname, searchParams]);
  return null;
}
```

`useSearchParams` **must** be wrapped in `<Suspense>` or the build fails.

---

## The rule that keeps it consistent

Exactly one of these owns the initial page view on any given page:

| Page type | Mount | `send_page_view` |
|---|---|---|
| Has a router tracker (normal pages) | `<GoogleAnalytics />` + `<GoogleAnalyticsPageView />` | `false` |
| Standalone, no router (404) | `<GoogleAnalytics sendPageView />` | `true` |
| Redirect stub (`/` → `/bg`) | `<GoogleAnalytics />` | `false` |

The redirect stub is subtle: `/` client-redirects via `router.replace('/bg')`,
which does **not** reload the document. So `/` must load the tag (otherwise the
bare-domain visit is lost entirely), but must **not** report a view itself —
`/bg`'s tracker reports the resulting view. Set it to `true` and every apex-domain
visit counts twice.

---

## Only the root layout may render `<html>`/`<body>`

`app/[locale]/layout.tsx` and `app/not-found.tsx` used to render their own
`<html>`/`<body>`, nested inside `app/layout.tsx`'s `<html>`/`<body>`. That's
invalid DOM (`<html>` as a child of `<body>`) and crashes hydration — React
throws "Hydration failed because the initial UI does not match what was
rendered on the server" plus "You are mounting a new html/body component when
a previous one has not first unmounted."

Both now return a fragment instead. Next.js hoists `<meta>`/`<script>`/`<link>`
tags rendered anywhere in the Server Component tree into the real `<head>`
automatically, so `GoogleAnalytics`, the OG meta tags, and the JSON-LD script
still land in `<head>` without needing their own `<html>` wrapper. Since
`app/layout.tsx` hardcodes `lang="bg"` on the single `<html>`, per-locale
`lang` is now set client-side by `components/layout/HtmlLangSetter.tsx`.

Mount the tag in the locale layout + the specific standalone pages, not the
root layout — if both `app/layout.tsx` and `app/[locale]/layout.tsx` mount it,
locale pages get **two** `config` calls, because the root layout wraps the
locale layout.

---

## How to actually verify it (do not skip this)

**Grepping the built HTML for the measurement ID proves nothing.** Next.js
serializes the whole component tree into the page as RSC payload
(`self.__next_f.push(...)`), so the ID and even the full snippet text appear as
inert *data* whether or not any script executes. This produced a confident
"56/56 pages have the tag" that was completely wrong — the tag was firing on zero
of them.

Even an HTML parser counting `<script>` elements is fooled, because the RSC
payload lives inside `<script>` tags too.

**Only a real browser settles it.** Minimal check:

```js
const { chromium } = require('playwright');
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
p.on('request', r => { if (r.url().includes('/g/collect')) console.log('HIT', r.url()); });
await p.goto('http://localhost:PORT/bg/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(6000);
console.log(await p.evaluate(() => ({
  gtag: typeof window.gtag,               // want "function"
  dl: (window.dataLayer || []).length,    // want > 0
})));
```

What you want to see: a request to `googletagmanager.com/gtag/js?id=G-XXXX`, then
hits to `google-analytics.com/g/collect` with `en=page_view` and the right `dp=`.

Testing gotchas that cost me several wrong conclusions:

- **Confirm you're testing the right site.** `serve` silently fails to bind if the
  port is taken and *another project's server answers*. I measured an unrelated
  site for several rounds. Always assert something identifying
  (`curl -s localhost:PORT/ | grep "Your Site Name"`) before trusting a result.
- **`waitUntil: 'networkidle'` times out** on pages with video/animation, so you
  read state before hydration and see a false zero. Use `'domcontentloaded'` plus
  an explicit wait.
- **Counting `/g/collect` requests is flaky** — GA batches and delays them. Read
  `window.dataLayer` instead; it's synchronous and deterministic.
- **Don't wrap `dataLayer.push` to spy on it** — gtag.js *replaces* `push` when it
  loads, detaching your wrapper. Read the resulting array afterwards.
- `net::ERR_ABORTED` on a `/g/collect` request when the test closes is just the
  beacon being cut off at teardown, not a bug.

---

## Files in this repo

- `components/analytics/GoogleAnalytics.tsx` — the tag; `sendPageView` prop
- `components/analytics/GoogleAnalyticsPageView.tsx` — route-change tracker
- `components/layout/HtmlLangSetter.tsx` — sets `<html lang>` client-side per locale
- `app/[locale]/layout.tsx` — tag hoisted to `<head>`, tracker under Suspense; no own `<html>`
- `app/not-found.tsx` — `<GoogleAnalytics sendPageView />`; no own `<html>`
- `app/page.tsx` — `/` redirect stub, `<GoogleAnalytics />`

---

## Not done here

**No cookie-consent gating.** The tag loads unconditionally on first visit, which
sets GA cookies before consent — a GDPR/ЗЗЛД exposure for an EU/BG site. The clean
fix is Google Consent Mode v2: default `analytics_storage: 'denied'`, flip on
acceptance. Worth doing before the next launch.

## Trivia

`G-XXXXXXX` (measurement ID) and `GT-XXXXXXX` (Google tag / container ID) that GA
shows together are **two IDs for the same tag**. Install the `G-` snippet only —
adding both double-counts everything.
