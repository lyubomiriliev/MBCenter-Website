# Handover: Umami + Google Analytics 4 in a Next.js App Router site

You are being asked to install Google Analytics 4 (gtag.js) and Umami on a
Next.js site. Three `.tsx` files from a working reference implementation are
attached. **Read this whole document before writing any code.** It exists
because the reference implementation took several wrong turns before it worked,
and every wrong turn is documented below with the symptom it produced.

---

## 0. First: gather these facts before you write anything

Do not guess any of these. Ask the user, or verify in the repo.

| Fact | How to get it | Why it matters |
|---|---|---|
| GA4 Measurement ID (`G-XXXXXXXXXX`) | Ask the user. GA4 Admin → Data Streams → Web stream | Hardcoded into the component |
| Umami website ID (a UUID) | Ask the user. Umami dashboard → Settings → Websites → Edit → Website ID | Hardcoded into the component |
| Umami script URL | Ask. `https://cloud.umami.is/script.js` for Umami Cloud; a self-hosted instance uses its own domain, e.g. `https://analytics.example.com/script.js` | Wrong host = silent no-op |
| `output` mode in `next.config.js` | `cat next.config.*` | **This is the single most important fact.** See §1 |
| Is there a route group / locale segment layout? | `find app -name "layout.tsx"` | Determines where to mount |
| Are there pages *outside* the main layout? | `find app -name "page.tsx" -o -name "not-found.tsx"` | These need their own mount. See §4 |
| Is there a client-side redirect stub at `/`? | Read `app/page.tsx` | Classic missed-page trap. See §4 |

Run the equivalent of:

```bash
cat next.config.*                       # look for output: "export"
find app -name "layout.tsx" -o -name "not-found.tsx" -o -name "page.tsx" | head -40
grep -rn "next/script" app components   # is next/script used elsewhere?
```

---

## 1. THE BIG ONE: `output: "export"` breaks `next/script`

**Symptom we hit:** GA was "installed", the code looked right, the build passed,
and *zero* traffic ever appeared in GA4. Realtime showed nothing. No console
errors. Completely silent failure.

**Cause:** The reference site uses `output: "export"` (static HTML export). With
a static export, `next/script` with the default `strategy="afterInteractive"`
emits only a `<link rel="preload">` into the exported HTML. The actual executing
`<script>` tag is injected by the Next.js runtime — which, in a static export,
never runs that injection path. The tag is preloaded and then never executed.

**Fix:** Use plain `<script>` tags, not `next/script`. This is also literally
what Google's own install instructions tell you to paste.

```tsx
// CORRECT for output: "export"
<script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
<script dangerouslySetInnerHTML={{ __html: `...` }} />
```

```tsx
// WRONG for output: "export" — silently never fires
import Script from "next/script";
<Script src={`https://www.googletagmanager.com/gtag/js?id=${ID}`} strategy="afterInteractive" />
```

### Decision rule

- `output: "export"` in `next.config.js` → **plain `<script>` tags.** Use the
  attached components essentially as-is.
- No `output: "export"` (normal SSR / Vercel / `next start`) → plain `<script>`
  tags still work fine and are the safer default. `next/script` also works.
  **Prefer the plain tags anyway** so this failure mode can never come back if
  someone later flips on static export.

**If you decide to deviate from plain tags, you must verify the tag actually
fires in a production build — see §7. Do not assume.**

---

## 2. THE SECOND BIG ONE: gtag does not track client-side navigation

**Symptom we hit:** After fixing §1, GA recorded a page view when someone loaded
the site — and then nothing else. A user browsing five pages registered as one
page view. Session data was garbage.

**Cause:** GA4's "Enhanced Measurement" advertises a *Page changes based on
browser history events* toggle, and people assume it covers SPA routing. In this
app it did not. We verified directly: `pushState` fires on navigation, `gtag`
stays loaded in memory, and **no network hit is sent.** Enhanced Measurement did
not pick up App Router client-side navigations.

**Fix:** A dedicated client component that fires `page_view` on every route
change, driven by `usePathname()` + `useSearchParams()`.

### The double-counting trap that follows

Once you add that tracker, the initial page view is reported **twice** — once by
gtag's own automatic `config` page view, once by the tracker's first `useEffect`
run. This inflates your numbers ~2x on entry pages.

**Fix:** `gtag('config', ID, { send_page_view: false })` wherever the tracker
component is mounted, and let the tracker own 100% of page views.

This is why `GoogleAnalytics` takes a `sendPageView` prop:

| Situation | `sendPageView` | Who reports the view |
|---|---|---|
| Page is under a layout that mounts `<GoogleAnalyticsPageView />` | `false` (the default) | The tracker component |
| Standalone page with **no** tracker mounted (404, redirect stub) | `true` | gtag's own `config` call |

**Getting this backwards is the #1 way to silently corrupt the data.** Two
tracker mounts, or a tracker plus `sendPageView`, and every number is inflated.
Zero of either, and the page is invisible. Audit every mount point against the
table above before you finish.

---

## 3. Umami needs none of this

Umami's `script.js` patches `pushState`/`replaceState` itself, so it auto-tracks
client-side route changes. **Do not write a Umami page-view tracker component.**
If you do, you will double-count every navigation in Umami.

One `<Umami />` per rendered document is all it needs. It is cookieless and
needs no consent banner in most jurisdictions (confirm with the user if the site
is EU-facing and has a consent flow — GA4 usually does need consent handling,
Umami usually does not).

Umami is deliberately mounted alongside GA4 as a **cross-check**: when the two
disagree wildly, that is your signal something is misconfigured. Expect Umami to
report somewhat higher numbers than GA4 — ad blockers block
`googletagmanager.com` far more aggressively than they block Umami. A 10–30%
gap is normal. A 10x gap means something is broken.

---

## 4. Mount points: the "one page is missing" trap

**Symptom we hit:** After everything above was fixed, traffic still looked low,
and the bare domain `/` reported nothing.

**Cause:** The site's `/` is a client-side redirect stub (`router.replace('/bg')`).
The redirect never reloads the document, so if `/` has no tag of its own, the
visit is only captured after the redirect lands — and any bounce before that is
invisible. `/` is also *the* URL people type. Similarly, `not-found.tsx` sits
outside the locale layout and had no tag at all, so 404s were untracked.

**Rule: every page that can be a landing page must render the tag itself.**
Enumerate every entry point before you finish:

```bash
find app -name "page.tsx" -o -name "not-found.tsx" -o -name "layout.tsx" | sort
```

For each one, ask: *does this render inside a layout that already mounts
`<GoogleAnalytics />`?* If not, it needs its own mount.

### Reference layout of mounts

```
app/layout.tsx            ← root layout. NO tag here.
                            It wraps the locale layout, so mounting here would
                            double-mount. Leave a comment saying so, or the
                            next person "helpfully" adds it back.

app/page.tsx              ← "/" redirect stub. <GoogleAnalytics /> + <Umami />
                            sendPageView=false: the destination's tracker
                            reports the resulting view.

app/not-found.tsx         ← 404, outside the locale layout.
                            <GoogleAnalytics sendPageView /> + <Umami />
                            sendPageView=TRUE: no tracker is mounted here.

app/[locale]/layout.tsx   ← the main layout. <GoogleAnalytics /> + <Umami />
                            + <GoogleAnalyticsPageView /> wrapped in <Suspense>.
```

**Put an explanatory comment at the root layout's non-mount.** The reference repo
has one. Without it, someone adds `<GoogleAnalytics />` to the root layout six
months later and every pageview doubles with no obvious cause.

---

## 5. `useSearchParams()` requires a `<Suspense>` boundary

**Symptom:** Build fails with
`useSearchParams() should be wrapped in a suspense boundary at page "/..."`,
or the whole route silently opts out of static rendering.

**Fix:** Always wrap the tracker:

```tsx
<Suspense fallback={null}>
  <GoogleAnalyticsPageView />
</Suspense>
```

Never mount `<GoogleAnalyticsPageView />` bare. This is not optional and it is
not a warning you can ignore under `output: "export"`.

---

## 6. Writing the three files for the new site

Adapt the attached files. The **structure and comments are the valuable part** —
they encode the reasons above. Preserve the comments; a future reader who
deletes `send_page_view: false` because it "looks redundant" will re-break the
data.

Changes to make:
1. `GA_MEASUREMENT_ID` → the new site's `G-` ID.
2. `UMAMI_WEBSITE_ID` → the new site's UUID.
3. Umami `src` → the new site's Umami host if self-hosted.
4. Import paths / alias (`@/components/...`) → match the new repo's `tsconfig.json` paths.
5. If the new site has **no** i18n locale segment, the mount point is the single
   `app/layout.tsx` instead of `app/[locale]/layout.tsx` — and then the root
   layout DOES get the tag. Adjust the §4 comment accordingly so it isn't a lie.
6. If the new site has no `/` redirect stub, drop that mount.

### `components/analytics/GoogleAnalytics.tsx`

```tsx
export const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // ← replace

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
```

### `components/analytics/GoogleAnalyticsPageView.tsx`

```tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_MEASUREMENT_ID } from "./GoogleAnalytics";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sends a page_view on every route change, including the first render.
 *
 * This is required, not redundant: gtag's Enhanced Measurement does not report
 * this app's client-side navigations (verified — pushState fires, gtag stays
 * loaded, and no hit is sent), so without this only full document loads would
 * be counted. The paired <GoogleAnalytics /> config therefore sets
 * send_page_view: false to avoid double-counting the initial view.
 */
export function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;

    const query = searchParams.toString();
    const page_path = query ? `${pathname}?${query}` : pathname;

    window.gtag("event", "page_view", {
      page_path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: GA_MEASUREMENT_ID,
    });
  }, [pathname, searchParams]);

  return null;
}
```

Note the `typeof window.gtag !== "function"` guard: the `async` gtag script may
not have loaded yet on first paint, and calling it would throw. It is a guard,
not a retry — if gtag is genuinely blocked, we simply record nothing, which is
correct.

### `components/analytics/Umami.tsx`

```tsx
export const UMAMI_WEBSITE_ID = "00000000-0000-0000-0000-000000000000"; // ← replace

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
      src="https://cloud.umami.is/script.js"   // ← self-hosted? change host
      data-website-id={UMAMI_WEBSITE_ID}
    />
  );
}
```

---

## 7. Verification — do not skip this, and do not verify in `next dev`

Everything in §1 and §2 passed code review and looked correct while being
completely broken at runtime. **Only a production build proves it works.**

```bash
npm run build
# static export:
npx serve out          # or: python3 -m http.server -d out 3000
# normal build:
npm run start
```

Then, in the browser on the production build:

1. **Tag is in the HTML.** View source (not devtools Elements — actual source)
   and confirm `googletagmanager.com/gtag/js?id=G-...` appears as a `<script src>`,
   **not** as `<link rel="preload">`. A preload link with no script tag is
   exactly the §1 failure.
   ```bash
   grep -o 'googletagmanager[^"]*' out/index.html
   grep -c 'rel="preload"[^>]*googletagmanager' out/index.html   # want 0 as the only occurrence
   ```
2. **Initial hit fires.** DevTools → Network → filter `collect`. Load a page.
   You should see **exactly one** request to `google-analytics.com/g/collect`
   with `en=page_view`. Two = the double-count bug from §2.
3. **Navigation fires.** Click through to another route *without* a full reload.
   A **new** `collect` request with `en=page_view` and the new `dpl`/`dl` must
   appear. Nothing = the §2 bug is still present.
4. **Umami fires.** Filter Network for `umami` or `/api/send`. One hit on load,
   one per client-side navigation. Two per navigation = you wrongly added a
   Umami tracker component (§3).
5. **Every entry point.** Repeat steps 2–3 on `/`, on a deep page, and on a
   deliberate 404 (`/this-does-not-exist`). Each must produce exactly one
   `page_view`.
6. **GA4 Realtime.** GA4 → Reports → Realtime. Your visit should appear within
   ~30s. Turn the ad blocker off for this test — a blocker suppresses gtag
   entirely and will make a working install look broken.

Report the actual results of steps 1–6 to the user. If a step fails, say which
one failed and what you saw, rather than reporting the install as done.

---

## 8. Quick failure → cause lookup

| Symptom | Cause | Section |
|---|---|---|
| No data at all, no errors, build fine | `next/script` + `output: "export"` | §1 |
| Only full page loads counted; SPA nav invisible | No page-view tracker | §2 |
| Every number ~2x | `send_page_view` true *and* tracker mounted; or tag mounted in both root and locale layout | §2, §4 |
| `/` reports nothing | Redirect stub has no tag of its own | §4 |
| 404s untracked | `not-found.tsx` is outside the layout | §4 |
| Build error about `useSearchParams` | Missing `<Suspense>` | §5 |
| Umami counts 2x per navigation | You wrote a Umami tracker; delete it | §3 |
| Umami ≫ GA4 by a little | Normal — ad blockers hit GA harder | §3 |
| Umami ≫ GA4 by 10x | GA is genuinely broken; go to §1 | §1 |
| Works in `next dev`, dead in prod | You verified in dev. Re-verify per §7 | §7 |

---

## 9. Summary of what to do

1. Read `next.config.*` and confirm whether `output: "export"` is set.
2. Ask the user for the GA4 ID, the Umami website ID, and the Umami host.
3. Create the three components above with those values and the comments intact.
4. Enumerate every `page.tsx` / `not-found.tsx` / `layout.tsx` and mount
   deliberately per §4, getting `sendPageView` right at each one.
5. Wrap the tracker in `<Suspense>`.
6. Build for production and verify all six checks in §7 in a real browser.
7. Report the verification results honestly, including anything you could not
   confirm.
