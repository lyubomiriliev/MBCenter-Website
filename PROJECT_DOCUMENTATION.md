# MB Center Sofia - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Structure](#architecture--structure)
4. [Internationalization (i18n)](#internationalization-i18n)
5. [Styling & Design System](#styling--design-system)
6. [Component Architecture](#component-architecture)
7. [Routing & Pages](#routing--pages)
8. [Forms & Integrations](#forms--integrations)
9. [Animations & Interactions](#animations--interactions)
10. [SEO & Metadata](#seo--metadata)
11. [Build & Deployment](#build--deployment)
12. [File Structure](#file-structure)
13. [Configuration Files](#configuration-files)
14. [Dependencies](#dependencies)

---

## Project Overview

**MB Center Sofia** is a modern, multilingual website for a Mercedes-Benz service center located in Sofia, Bulgaria. The website is built as a static site using Next.js 14 with the App Router, featuring full internationalization support for Bulgarian (default) and English languages.

### Key Characteristics
- **Static Site Generation**: Exported as static HTML/CSS/JS files
- **Bilingual Support**: Bulgarian (bg) as default, English (en) as secondary
- **Modern UI/UX**: Premium Mercedes-Benz brand aesthetic with smooth animations
- **Mobile-First**: Responsive design with mobile menu and touch-optimized interactions
- **Performance Optimized**: Static export for fast loading, optimized images, smooth scrolling

---

## Technology Stack

### Core Framework
- **Next.js 14.2.21** (App Router)
  - Static export mode (`output: 'export'`)
  - Server Components and Client Components
  - Image optimization (unoptimized for static export)
  - Metadata API for SEO

### React Ecosystem
- **React 18.3.1**
- **React DOM 18.3.1**
- **TypeScript 5.x** - Full type safety

### Internationalization
- **next-intl 3.24.1** - Complete i18n solution
  - Server-side translations
  - Client-side translations
  - Locale routing
  - Message formatting

### Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **PostCSS 8.x** - CSS processing
- **Autoprefixer** - Vendor prefixing
- **Custom CSS Variables** - Theme system

### Animation & Interactions
- **GSAP 3.14.2** - Advanced animations
  - ScrollTrigger plugin for scroll-based animations
- **Lenis 1.3.17** - Smooth scrolling library
  - Integrated with GSAP ScrollTrigger

### Forms
- **React Hook Form 7.54.2** - Form state management
- **Formspree** - Form submission service (contact and career forms)

### Development Tools
- **ESLint 8.x** - Code linting (Next.js config)
- **TypeScript** - Type checking
- **Node.js** - Runtime environment

---

## Architecture & Structure

### Next.js App Router Structure

The project uses Next.js 14 App Router with the following structure:

```
app/
├── layout.tsx              # Root layout (minimal, redirects to locale)
├── page.tsx                # Root page (redirects to default locale)
├── HomePageContent.tsx     # Client component for homepage content
├── globals.css            # Global styles and CSS variables
└── [locale]/              # Locale-based routing
    ├── layout.tsx         # Locale-specific layout with i18n
    ├── page.tsx           # Homepage
    ├── about/
    ├── booking/
    ├── career/
    ├── contacts/
    ├── gallery/
    ├── services/
    └── terms/
```

### Key Architectural Patterns

1. **Server Components by Default**
   - Pages are Server Components unless marked with `"use client"`
   - Metadata generation happens on the server
   - Translations loaded server-side

2. **Client Components for Interactivity**
   - Components requiring hooks, state, or browser APIs use `"use client"`
   - Examples: Header, forms, animations, smooth scroll

3. **Static Generation**
   - All pages are statically generated at build time
   - `generateStaticParams()` used for locale routes
   - No runtime server required

4. **Component Composition**
   - Reusable section components in `components/sections/`
   - Layout components in `components/layout/`
   - Form components in `components/forms/`
   - Animation utilities in `components/animations/`

---

## Internationalization (i18n)

### Configuration

**File**: `routing.ts`
- Defines supported locales: `['en', 'bg']`
- Default locale: `'bg'` (Bulgarian)
- Uses `next-intl` routing utilities

**File**: `i18n.ts`
- Server-side i18n configuration
- Validates incoming locale
- Loads messages from JSON files

### Message Files

**Location**: `messages/`
- `en.json` - English translations (61KB, 1196 lines)
- `bg.json` - Bulgarian translations (99KB, 1196 lines)

### Translation Structure

Messages are organized by namespace:
```json
{
  "nav": { ... },
  "home": { ... },
  "services": { ... },
  "forms": { ... },
  "seo": { ... }
}
```

### Usage Patterns

**Server Components:**
```typescript
import { getTranslations } from "next-intl/server";
const t = await getTranslations("namespace");
```

**Client Components:**
```typescript
import { useTranslations } from "next-intl";
const t = useTranslations("namespace");
```

### Locale Routing

- URLs: `/{locale}/page` (e.g., `/bg/services`, `/en/services`)
- Root redirects to default locale (`/bg`)
- Language switcher in Header component
- Locale preserved in navigation

---

## Styling & Design System

### Tailwind Configuration

**File**: `tailwind.config.js`

#### Custom Colors (Mercedes-Benz Brand Palette)
- `mb-black`: `#000000` - Primary background
- `mb-anthracite`: `#1a1a1a` - Secondary background
- `mb-surface`: `#0a0a0a` - Dark surface
- `mb-silver`: `#c0c0c0` - Text/secondary
- `mb-chrome`: `#e8e8e8` - Light text
- `mb-blue`: `#00adef` - Brand accent (Mercedes blue)
- `mb-border`: `#2a2a2a` - Borders

#### Custom Utilities
- `borderRadius.card`: `0.75rem`
- `borderRadius.button`: `0.5rem`
- `boxShadow.subtle`: Subtle shadow
- `boxShadow.card`: Card shadow
- `spacing.section`: `8rem` (section padding)
- `spacing.section-sm`: `4rem` (small section padding)

### Global Styles

**File**: `app/globals.css`

#### CSS Variables
```css
--color-mb-black: #000000;
--color-mb-anthracite: #1a1a1a;
--color-mb-surface: #0a0a0a;
--color-mb-silver: #c0c0c0;
--color-mb-chrome: #e8e8e8;
--color-mb-blue: #00adef;
--color-mb-border: #2a2a2a;
```

#### Custom Animations
- `fade-in` - Fade in effect
- `slide-in-from-top` - Slide from top
- `slide-in-from-bottom` - Slide from bottom
- Custom scrollbar styling
- Selection styling (Mercedes blue)

#### Typography
- **Font**: Inter (Google Fonts)
- Supports Latin and Cyrillic subsets
- Font variable: `--font-inter`

### Design Principles

1. **Dark Theme**: Black/dark backgrounds with light text
2. **Premium Aesthetic**: Mercedes-Benz brand colors and styling
3. **Smooth Transitions**: 300ms transitions on interactive elements
4. **Responsive**: Mobile-first approach with breakpoints
5. **Accessibility**: Focus states, semantic HTML, ARIA labels

---

## Component Architecture

### Component Organization

```
components/
├── animations/          # Animation utilities
│   ├── AnimatedSection.tsx
│   └── AnimatedText.tsx
├── forms/              # Form components
│   ├── ContactForm.tsx
│   └── CareerApplicationForm.tsx
├── layout/             # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── SmoothScroll.tsx
│   └── StickyBookingCTA.tsx
├── sections/           # Page sections (30+ components)
│   ├── VideoHero.tsx
│   ├── ServicesSection.tsx
│   ├── EVSection.tsx
│   ├── WhyChooseUs.tsx
│   └── ... (30+ more)
└── ui/                 # UI primitives
    └── Modal.tsx
```

### Key Components

#### Layout Components

**Header.tsx**
- Fixed navigation with scroll-based show/hide
- Mobile menu with full-screen overlay
- Language switcher
- Booking CTA button
- Responsive design

**Footer.tsx**
- Site information
- Navigation links
- Contact information
- Social media links
- Legal links

**SmoothScroll.tsx**
- Initializes Lenis smooth scrolling
- Integrates with GSAP ScrollTrigger
- Client component

**StickyBookingCTA.tsx**
- Fixed floating button
- Appears after scrolling 300px
- Links to booking page

#### Section Components (30+)

Key sections include:
- `VideoHero` - Hero section with video background
- `ServicesSection` - Service cards grid
- `EVSection` - Electric vehicle services
- `WhyChooseUs` - Value propositions
- `WhereToFindUs` - Location and contact info
- `ParallaxDivider` - Parallax image sections
- `CTABand` - Call-to-action bands
- `GalleryGrid` - Image gallery
- And many more...

#### Form Components

**ContactForm.tsx**
- React Hook Form integration
- Formspree submission
- Honeypot spam protection
- Validation
- Success/error states

**CareerApplicationForm.tsx**
- Similar structure to ContactForm
- Career-specific fields
- File upload support (if needed)

---

## Routing & Pages

### Page Structure

All pages are located under `app/[locale]/`:

1. **Homepage** (`page.tsx`)
   - VideoHero
   - WhereToFindUs
   - ServicesSection
   - WhyChooseUs
   - ParallaxDivider
   - EVSection
   - CTABand

2. **About** (`about/page.tsx`)
   - About story and information

3. **Services** (`services/page.tsx`)
   - Detailed services listing

4. **Gallery** (`gallery/page.tsx`)
   - Image gallery grid

5. **Booking** (`booking/page.tsx`)
   - Booking information and Google Calendar integration

6. **Career** (`career/page.tsx`)
   - Career opportunities and application form

7. **Contacts** (`contacts/page.tsx`)
   - Contact form and location information

8. **Terms** (`terms/page.tsx`)
   - Terms and conditions

### Navigation

**File**: `lib/constants.ts`

Navigation items defined:
```typescript
export const NAV_ITEMS = [
  { href: "/", labelKey: "nav.home" },
  { href: "/services", labelKey: "nav.services" },
  { href: "/gallery", labelKey: "nav.gallery" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/contacts", labelKey: "nav.contacts" },
] as const;
```

### URL Structure

- Root: `/` → redirects to `/bg`
- Homepage: `/{locale}/` (e.g., `/bg/`, `/en/`)
- Pages: `/{locale}/page-name` (e.g., `/bg/services`, `/en/about`)
- Trailing slashes enabled (`trailingSlash: true`)

---

## Forms & Integrations

### Form Handling

**Library**: React Hook Form 7.54.2

**Features**:
- Type-safe form handling
- Validation
- Error states
- Loading states

### Form Submission

**Service**: Formspree

**Configuration** (in `lib/constants.ts`):
```typescript
formspree: {
  contactFormId: "YOUR_FORMSPREE_ID",
  careerFormId: "YOUR_FORMSPREE_CAREER_ID",
}
```

**Implementation**:
- POST requests to `https://formspree.io/f/{formId}`
- JSON payload
- Honeypot spam protection
- Success/error handling

### External Integrations

1. **Google Calendar**
   - Booking link integration
   - URL in `SITE_CONFIG.booking.googleCalendar`

2. **Google Maps**
   - Embedded map in contacts page
   - Location coordinates

3. **Social Media**
   - Facebook: `https://www.facebook.com/mbcenterbg`
   - Instagram: `https://www.instagram.com/mbcenter.bg/`

---

## Animations & Interactions

### Smooth Scrolling

**Library**: Lenis 1.3.17

**Configuration**:
- Duration: 1.2s
- Custom easing function
- Integrated with GSAP ScrollTrigger
- Touch multiplier: 2x
- Wheel multiplier: 1x

**Implementation**: `components/layout/SmoothScroll.tsx`

### GSAP Animations

**Library**: GSAP 3.14.2 with ScrollTrigger

**Usage**:
- Scroll-triggered animations
- Parallax effects
- Section reveals
- Scroll-based video playback

### CSS Animations

**Custom Keyframes** (in `globals.css`):
- `fade-in`
- `slide-in-from-top`
- `slide-in-from-bottom`

**Utility Classes**:
- `animate-in` - Base animation class
- `fade-in` - Fade animation
- `slide-in-from-top` - Slide from top
- `slide-in-from-bottom` - Slide from bottom

### Interactive Elements

- Hover effects on buttons and links
- Mobile menu animations
- Scroll-based header show/hide
- Sticky booking CTA
- Form validation feedback

---

## SEO & Metadata

### Metadata Generation

**File**: `lib/seo.ts`

**Functions**:
- `generateLocalBusinessSchema()` - Schema.org structured data
- `generateAlternateLinks()` - Hreflang tags for i18n

### Page Metadata

Each page generates metadata using:
- `generateMetadata()` function
- Translations from `seo.*` namespace
- Open Graph tags
- Twitter Card tags
- Canonical URLs
- Alternate language links

### Structured Data

**Schema.org Types**:
- `AutoRepair` - Local business schema
- Includes: name, address, phone, hours, social links

### SEO Features

- Dynamic meta titles and descriptions
- Open Graph images
- Canonical URLs
- Hreflang tags for language alternates
- Robots meta tags
- Sitemap generation (static export)
- Robots.txt

---

## Build & Deployment

### Build Configuration

**File**: `next.config.js`

```javascript
{
  output: 'export',        // Static export
  trailingSlash: true,      // URLs end with /
  images: {
    unoptimized: true,      // Required for static export
  }
}
```

### Build Process

1. **Development**: `npm run dev`
   - Next.js dev server
   - Hot reload
   - TypeScript checking

2. **Build**: `npm run build`
   - Static site generation
   - All pages pre-rendered
   - Output to `out/` directory

3. **Export**: Automatic with build
   - Generates static HTML/CSS/JS
   - All assets optimized
   - Ready for any static hosting

### Deployment

**Static Hosting Options**:
- Vercel (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static file server

**Output Directory**: `out/`

### Environment

- **Node.js**: Required for build
- **No Runtime**: Static files only
- **No Server**: Can be served from CDN

---

## File Structure

```
mbcenter-web/
├── app/                      # Next.js App Router
│   ├── [locale]/            # Locale-based routes
│   │   ├── layout.tsx       # Locale layout
│   │   ├── page.tsx         # Homepage
│   │   ├── about/
│   │   ├── booking/
│   │   ├── career/
│   │   ├── contacts/
│   │   ├── gallery/
│   │   ├── services/
│   │   └── terms/
│   ├── layout.tsx            # Root layout
│   ├── page.tsx             # Root page
│   ├── HomePageContent.tsx  # Homepage client component
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── animations/         # Animation utilities
│   ├── forms/              # Form components
│   ├── layout/             # Layout components
│   ├── sections/           # Page sections (30+)
│   └── ui/                 # UI primitives
├── lib/                    # Utilities
│   ├── constants.ts        # Site configuration
│   └── seo.ts              # SEO utilities
├── messages/               # i18n translations
│   ├── en.json            # English (61KB)
│   └── bg.json            # Bulgarian (99KB)
├── public/                 # Static assets
│   └── assets/
│       ├── images/         # Images (74 files)
│       ├── logos/          # Logos (9 files)
│       └── videos/         # Videos (8 files)
├── types/                  # TypeScript types
│   └── index.ts
├── out/                    # Build output (generated)
├── node_modules/           # Dependencies
├── .eslintrc.json         # ESLint config
├── .gitignore             # Git ignore rules
├── i18n.ts                # i18n configuration
├── next.config.js         # Next.js config
├── package.json           # Dependencies
├── postcss.config.mjs     # PostCSS config
├── routing.ts             # i18n routing config
├── tailwind.config.js     # Tailwind config
└── tsconfig.json          # TypeScript config
```

---

## Configuration Files

### TypeScript (`tsconfig.json`)

- **Strict mode**: Enabled
- **Module**: ESNext
- **JSX**: Preserve (Next.js handles)
- **Paths**: `@/*` maps to root
- **Target**: Modern ES

### ESLint (`.eslintrc.json`)

- **Extends**: `next/core-web-vitals`
- Next.js recommended rules
- React best practices

### PostCSS (`postcss.config.mjs`)

- **Plugins**:
  - `tailwindcss` - Tailwind processing
  - `autoprefixer` - Vendor prefixes

### Next.js (`next.config.js`)

- Static export mode
- Trailing slashes
- Unoptimized images (static export requirement)
- next-intl plugin integration

### Tailwind (`tailwind.config.js`)

- Content paths: `pages/`, `components/`, `app/`
- Custom theme extensions
- Brand color palette
- Custom utilities

### Routing (`routing.ts`)

- Locales: `['en', 'bg']`
- Default: `'bg'`
- Navigation utilities exported

### i18n (`i18n.ts`)

- Server-side configuration
- Locale validation
- Message loading

---

## Dependencies

### Production Dependencies

```json
{
  "autoprefixer": "^10.4.23",
  "gsap": "^3.14.2",
  "lenis": "^1.3.17",
  "next": "^14.2.21",
  "next-intl": "^3.24.1",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-hook-form": "^7.54.2"
}
```

### Development Dependencies

```json
{
  "@types/node": "^22",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "eslint": "^8",
  "eslint-config-next": "14.2.21",
  "postcss": "^8",
  "tailwindcss": "^3.4.17",
  "typescript": "^5"
}
```

### Key Dependency Purposes

- **next**: Core framework
- **next-intl**: Internationalization
- **react/react-dom**: UI library
- **tailwindcss**: Styling
- **gsap**: Animations
- **lenis**: Smooth scrolling
- **react-hook-form**: Form handling
- **typescript**: Type safety

---

## Site Configuration

### Constants (`lib/constants.ts`)

**SITE_CONFIG** includes:
- Business name
- Base URL: `https://mbcenter.bg`
- Phone: `+359 883 788 873`
- Email: `contact@mbcenter.bg`
- Address (Bulgarian and English)
- Working hours
- Social media links
- Google Calendar booking link
- Formspree form IDs

**Separate configs** for `bg` and `en` locales with localized address and hours.

---

## Development Workflow

### Scripts

```json
{
  "dev": "next dev",      // Development server
  "build": "next build",  // Production build
  "start": "next start",  // Production server (not used for static)
  "lint": "next lint"     // Lint code
}
```

### Development Process

1. **Start Dev Server**: `npm run dev`
2. **Make Changes**: Edit files in `app/`, `components/`, etc.
3. **Hot Reload**: Changes reflect automatically
4. **Type Checking**: TypeScript validates types
5. **Linting**: ESLint checks code quality

### Build Process

1. **Run Build**: `npm run build`
2. **Static Generation**: All pages pre-rendered
3. **Output**: Generated in `out/` directory
4. **Deploy**: Upload `out/` contents to hosting

---

## Key Patterns & Conventions

### Component Patterns

1. **Server Components by Default**
   - Use Server Components unless interactivity needed
   - Mark with `"use client"` when required

2. **Translation Pattern**
   - Server: `getTranslations()` from `next-intl/server`
   - Client: `useTranslations()` from `next-intl`
   - Use namespace for organization

3. **Locale Handling**
   - Always pass `locale` prop to components needing it
   - Use `useLocale()` hook in client components
   - Generate localized paths with `/{locale}/path`

4. **Image Optimization**
   - Use Next.js `Image` component
   - Images in `public/assets/`
   - Unoptimized for static export

### Code Style

- **TypeScript**: Strict mode enabled
- **Components**: Functional components with TypeScript
- **Styling**: Tailwind utility classes
- **Naming**: PascalCase for components, camelCase for functions
- **File Structure**: Co-locate related files

### Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus states visible
- Alt text for images

---

## Assets

### Images

**Location**: `public/assets/images/`
- **74 image files** total
- Formats: `.jpg`, `.webp`, `.png`, `.avif`
- Categories:
  - Service images
  - Vehicle images
  - Equipment images
  - Gallery images
  - Pattern backgrounds

### Videos

**Location**: `public/assets/videos/`
- **8 video files** (`.mp4`)
- Used in hero sections and scroll animations
- Examples: `glc-video.mp4`, `gt53-video.mp4`

### Logos

**Location**: `public/assets/logos/`
- **9 logo files**
- Formats: `.svg`, `.png`
- Variants: English, Bulgarian, white, colored

### Favicons

- `favicon.ico`
- `favicon-32x32.webp`
- Configured in root layout metadata

---

## Future Considerations

### Potential Enhancements

1. **CMS Integration**: Content management for easier updates
2. **Blog**: News and updates section
3. **Online Booking**: Direct calendar integration
4. **Customer Portal**: Account management
5. **Analytics**: Google Analytics or similar
6. **Performance**: Further optimization
7. **Testing**: Unit and integration tests
8. **PWA**: Progressive Web App features

### Known Limitations

1. **Static Export**: No server-side features
2. **Formspree**: External dependency for forms
3. **Image Optimization**: Disabled for static export
4. **No API Routes**: Static site only

---

## Summary

This is a **modern, production-ready Next.js static website** for a Mercedes-Benz service center, featuring:

- ✅ Full bilingual support (Bulgarian/English)
- ✅ Premium Mercedes-Benz brand design
- ✅ Smooth animations and interactions
- ✅ Mobile-responsive design
- ✅ SEO optimized
- ✅ Static site generation for fast performance
- ✅ Type-safe with TypeScript
- ✅ Well-organized component architecture
- ✅ Form handling with validation
- ✅ Modern development workflow

The codebase follows Next.js 14 best practices, uses modern React patterns, and is structured for maintainability and scalability.



