# 301 Redirect Map — WordPress → Next.js (mbcenter.bg)

Redirects are **implemented in the app** via `next.config.js` → `redirects()`, so they work on **any host** (including jump.bg) when the Next.js server runs.  
Below are equivalent configs for Vercel, Netlify, or Apache/cPanel if you ever need them.  
New site uses **no trailing slash** (`next.config`: `trailingSlash: false`).

## Format: OLD → NEW (301)

From crawl data (mbcenter.bg):

```
https://mbcenter.bg/              → https://mbcenter.bg/bg
https://mbcenter.bg/home/         → https://mbcenter.bg/bg
https://mbcenter.bg/home          → https://mbcenter.bg/bg
https://mbcenter.bg/about-us/     → https://mbcenter.bg/bg/about
https://mbcenter.bg/about-us      → https://mbcenter.bg/bg/about
https://mbcenter.bg/contact-us/    → https://mbcenter.bg/bg/contacts
https://mbcenter.bg/contact-us     → https://mbcenter.bg/bg/contacts
https://mbcenter.bg/terms/        → https://mbcenter.bg/bg/terms
https://mbcenter.bg/terms         → https://mbcenter.bg/bg/terms
https://mbcenter.bg/?page_id=3122 → https://mbcenter.bg/bg/contacts
```

**Note:** `?page_id=3122` is the contact page on WordPress; canonical was `contact-us/`. Redirect it to `/bg/contacts`.

## Vercel (vercel.json)

```json
{
  "redirects": [
    { "source": "/", "destination": "https://mbcenter.bg/bg", "permanent": true },
    { "source": "/home", "destination": "https://mbcenter.bg/bg", "permanent": true },
    { "source": "/home/", "destination": "https://mbcenter.bg/bg", "permanent": true },
    { "source": "/about-us", "destination": "https://mbcenter.bg/bg/about", "permanent": true },
    { "source": "/about-us/", "destination": "https://mbcenter.bg/bg/about", "permanent": true },
    { "source": "/contact-us", "destination": "https://mbcenter.bg/bg/contacts", "permanent": true },
    { "source": "/contact-us/", "destination": "https://mbcenter.bg/bg/contacts", "permanent": true },
    { "source": "/terms", "destination": "https://mbcenter.bg/bg/terms", "permanent": true },
    { "source": "/terms/", "destination": "https://mbcenter.bg/bg/terms", "permanent": true }
  ]
}
```

## jump.bg (Blogger Pro / cPanel — upload to public_html)

If you **upload the built folder** to **public_html** (static export), the Next.js server is not running, so **redirects in `next.config.js` do not run**. Use Apache instead.

**Use the project’s `.htaccess`:**  
File **`public/.htaccess`** is in the repo. With static export (`next build` with `output: 'export'`), the contents of `public/` are copied to the root of `out/`. So when you upload the **contents of `out/`** into public_html, **`.htaccess` is already in the root** and the 301 redirects will apply (if the server allows `.htaccess`).

- Build: `next build` (with **`output: 'export'`** in `next.config.js`) produces the **`out/`** folder.
- Upload: contents of **`out/`** into cPanel **public_html** (`.htaccess` is included for redirects).
- **Admin offer edit:** Edit uses query param (`/mb-admin/offers/edit?id=...`), so one static page handles any offer ID; no rebuild needed for new offers.

If you ever deploy by **running Node** (e.g. `next start` on the host), redirects in **`next.config.js`** will apply and you can ignore `.htaccess`.

## Netlify (_redirects)

```
/    /bg    301
/home    /bg    301
/home/   /bg    301
/about-us   /bg/about    301
/about-us/  /bg/about    301
/contact-us /bg/contacts 301
/contact-us/    /bg/contacts 301
/terms  /bg/terms 301
/terms/ /bg/terms 301
```

## Notes

- After crawling the full WordPress site, add one line per unique old URL.
- Preserve query strings if needed: configure your host to pass `:splat` or `?*` to destination.
- Prefer **one canonical new URL per old URL** (no chains of redirects).
