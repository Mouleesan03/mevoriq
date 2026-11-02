# MEVORIQ — Complete Brand Identity & Digital Design Guidelines

**Version:** 2.0 (Bright identity, see §0; 1.1 unified with `product-plan.md`)  
**Date:** 1 November 2026  
**Status:** Proposed brand system — logo kit v0.1 generated; hand refinement, domain and trademark are **not yet cleared**  
**Companion documents:** `docs/product-plan.md` (product, routes, data, API), `docs/sub-brand-guidelines.md`, `docs/decisions.md`  
**Product:** Global, digital-only business card and professional identity SaaS  
**Product stack:** Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Vercel  
**Business model:** Free-first at launch; future monetization to be announced transparently

---

## 0. v2.0 "Bright" identity (2 Nov 2026) — supersedes the visual sections below

The owner approved the **Bright** direction (design references: *Landing page — bright*, *Create your card — bright*). Where this section and later sections disagree on color, type, logo or component style, **this section wins**. Brand story, voice, positioning, product scope and legal sections are unchanged.

**Logo.** Rounded blue square (`#2448E8`, radius 9/30) with a single-stroke white **M** and a yellow (`#FFD54A`) connection dot top-right, followed by the lowercase wordmark **mevoriq** in Plus Jakarta Sans ExtraBold, tracking −3%. Files: `brand/logos/bright/` (symbol, white, monochrome, favicon, maskable) and `brand/icons/` (PNG sizes). In the app the wordmark is live text (`components/brand/logo.tsx`), so no outlined lockup file is needed; a hand-drawn outlined lockup should be produced before print use. The navy/mint kit is archived in `brand/archive/`.

**Palette.**

| Token | Name | HEX | Use |
|---|---|---|---|
| `ink` | Ink | `#12131A` | Text, dark chips, dark buttons |
| `blue` | Mevoriq Blue | `#2448E8` | Primary buttons, links, hero panels, chart series |
| `blue-deep` | Deep Blue | `#16289A` | Hover, text on sky chips |
| `yellow` | Sunny | `#FFD54A` | Logo dot, highlights, "Send" tile, badges |
| `coral` | Coral | `#FF6B57` | Accent tiles and decorative cards (text on it: ink) |
| `pink` | Blush | `#FFE3EA` | Soft panels, CTA band |
| `sky` | Sky | `#E3E9FF` | Focus halo, info chips |
| `cream` | Cream | `#FFF4CC` | Notices, early-access pill |
| `leaf` / `mint` / `mint-ink` | Leaf / Green / Green ink | `#DDF6EA` / `#2FD08A` / `#0B5C3B` | Success, "live" chips, confirmations |
| `fill` | Fill | `#F2F3F7` | Input backgrounds, step cards |
| `body` / `muted` | Body / Muted | `#3D3F4C` / `#5A5C6A` | Paragraphs / secondary text |
| `border` | Hairline | `#ECECF1` | Rings and dividers |

All text pairings were checked for WCAG AA: white on blue 6.6:1, `#DCE3FF` on blue 5.2:1, ink on coral 6.6:1, body on yellow 7.4:1, muted on white 6.6:1, muted on fill 6.0:1, green-ink on leaf 7.1:1.

**Type.** Plus Jakarta Sans (400–800) for everything; ExtraBold with −3% to −3.5% tracking for headings. Geist Mono for card addresses and code-like values. Both loaded with `next/font`.

**Shape and components.** Pill buttons (`h-11`/`h-14`), blue primary with a soft blue shadow; pill or 16px-radius inputs filled with `#F2F3F7`, focus = 2px inset blue + 5px sky halo; panels 24–44px radius; floating pill navigation; numbered step cards on `fill`; colored feature tiles (blue / yellow / coral) for marketing.

**Card templates.** Minimal White (white), Midnight Executive (`#141B33`), Editorial Studio (blush `#FFE3EA`, serif names), Aurora Gradient (blue → violet), Modern Corporate (sunny yellow). Accent presets per template stay limited to AA-safe combinations (`lib/cards/themes.ts`, covered by unit tests).

---

## 1. Brand overview

**Brand name:** Mevoriq  
**Category:** Digital business cards, professional profiles, contact exchange, business identity management  
**Pronunciation:** Not yet standardized. Choose and document a single pronunciation before producing voice ads.  
**Proposed brand story:** “Me” stands for personal identity, “vor” suggests forward motion, and “iq” evokes smart technology. This is a creative interpretation of an invented word, **not** an established etymology.

**Brand purpose:** Make professional introductions and long-term connections easier for everyone.

**Mission:** Enable any person or organization to create, share and manage a beautiful, useful digital professional identity without technical barriers.

**Vision:** Become an accessible digital identity and contact-sharing layer for professionals and businesses worldwide.

**Brand promise:** One beautifully presented identity, ready to share from any device.

**Primary tagline:** **Your identity. Every connection.**

**Secondary campaign lines:**
- Connect beyond the card.
- Make every connection count.
- Meet. Share. Connect.
- Your professional presence, made simple.
- Share who you are — beautifully.

**Brand voice:** Clear, confident, welcoming, efficient and globally understandable. Avoid exaggerated AI claims, jargon, and promises that contact sharing alone guarantees business results.

### Brand positioning
For individuals, entrepreneurs, freelancers and organizations that want to make professional contact sharing effortless, Mevoriq is a mobile-first digital business card platform that combines personal profiles, permanent share links, QR codes, contact saving, and modern design in one streamlined experience.

### Audiences
1. Individual professionals and job seekers seeking a polished contact page.
2. Freelancers, creatives, consultants and small business owners.
3. Teams needing standardized, company-managed identities.
4. Event participants and professional communities exchanging contacts.

### What Mevoriq is not
- A résumé/CV generation product.
- A physical NFC card store.
- A social networking feed.
- A replacement for full CRM software at launch.

---

## 2. Logo explorations and recommendation

Four conceptual logo directions were generated. These are visual exploration images, **not production vector source files**. The selected mark must be reconstructed as an original, clean SVG/vector master, refined at small sizes, and checked for conflicts.

| Concept | Idea | Pros | Cautions |
|---|---|---|---|
| 01 — Connected Ribbon M | Flowing, intersecting M ribbons, mint and indigo | Distinctive energetic SaaS mark; recognizable app icon | Gradients can lose detail at 16px |
| 02 — Network M | Geometric M with three connected dots | Explicit connection symbolism; scalable | Connection lines must remain strong at small sizes |
| 03 — Identity Card M | Card/profile motif with M pathway | Clearly represents the product | Can look more like a generic contact app |
| 04 — Wordmark-First M | Minimal linked M; `iq` mint accent | Most minimal, flexible, polished for SaaS | Check visual similarity to other M marks |

**Recommendation:** Advance **Concept 04** as the lead candidate, with **Concept 02** as backup. Concept 04 balances a memorable app icon with a clear, compact wordmark and is easier to adapt across responsive websites, favicons and social avatars. This is a recommendation, not a finalized logo selection.

### Current mark (brand kit v0.1)
The kit in `brand/` implements a hybrid of Concept 04 and Concept 02: a single-stroke white **M** on a navy rounded square whose middle vertex is a mint **connection node**, plus a Manrope ExtraBold wordmark (tracking −3.5%, outlined) where only the dot of the `i` is mint. At 16px the node is dropped. These files are generated, not hand-drawn: refine curves and spacing in Figma/Illustrator before public launch.

**The logo is expected to change.** The application must never hard-code logo artwork. All logo and icon files live in `public/brand/` and are referenced only through `components/brand/` (`<Logo>`, `<LogoSymbol>`) and a single `lib/brand/config.ts`. Replacing the files with the same names (or editing that one config) must update the whole product.

### Logo files and export specification
Prepare each selected mark as:
- `mevoriq-logo-horizontal-primary.svg`
- `mevoriq-logo-horizontal-dark.svg`
- `mevoriq-logo-horizontal-monochrome.svg`
- `mevoriq-logo-stacked.svg`
- `mevoriq-symbol.svg`
- `mevoriq-symbol-white.svg`
- `mevoriq-favicon.svg`
- `favicon-16.png`, `favicon-32.png`, `favicon-48.png`
- `apple-touch-icon-180.png`
- `pwa-icon-192.png`, `pwa-icon-512.png`
- `social-avatar-1024.png`
- SVG vector originals and PNG transparent exports at 1x/2x/4x.
- Also present in kit v0.1: `mevoriq-logo-stacked-dark.svg`, `mevoriq-symbol-monochrome.svg`, `pwa-icon-maskable-512.png`.

**Do not convert the displayed concept-board PNG into a final brand asset without rebuilding the actual logo.** Avoid exporting the concept sheet, labels and palette as part of the brand mark.

### Logo construction standards
- Primary: icon left, wordmark right, optical vertical alignment.
- Wordmark: custom geometric letterforms inspired by Manrope; final type treatment must be outlined for logo export.
- Symbol: clear enough to identify at 24 × 24 px.
- Exclusion zone: at least the height of the lowercase `e` around the lockup, or at least 25% of symbol height around the standalone icon.
- Minimum suggested widths: 120px for horizontal logo on web; 24px for symbol. Confirm after final vector refinement.
- Backgrounds: use dark-on-light or white-on-navy variants; use gradient mark only when contrast remains clear.
- Monochrome version: required for print, accessibility and single-color applications.

### Incorrect logo usage
Do not distort, rotate, alter proportions, apply unapproved shadows, use low-contrast combinations, change the spelling, add an unrelated symbol, or independently recolor individual letters outside approved variants.

---

## 3. Brand colors

**Recommended canonical palette:** choose the calmer premium navy/mint system from Concept 04. Concept-board color values vary across explorations and should **not** all be treated as final standards.

| Token | Name | HEX | Role |
|---|---|---|---|
| `brand.navy` | Charcoal Navy | `#0F1B2D` | Wordmark, deep backgrounds, primary identity |
| `brand.mint` | Connection Mint | `#34D399` | Signature accent and highlights |
| `brand.indigo` | Digital Indigo | `#5265E8` | Secondary digital accent; white text on it = 4.8:1 |
| `brand.mintInk` | Mint Ink | `#047857` | Mint-family **text/links** on light surfaces (5.5:1 on white) |
| `base.white` | White | `#FFFFFF` | Light surfaces and reverse logo |
| `base.canvas` | Cloud | `#F6F8FB` | App background |
| `base.text` | Slate Ink | `#172338` | Body text |
| `base.muted` | Muted Slate | `#5B6B80` | Supporting copy (5.1:1 on Cloud, 5.4:1 on white) |
| `base.border` | Soft Border | `#E2E8F0` | Divider and form borders |
| `state.success` | Success | `#15803D` | Confirmed actions |
| `state.warning` | Warning | `#B45309` | Important notices |
| `state.danger` | Danger | `#B91C1C` | Destructive actions |

### Color use
- Marketing: 55% light/white, 30% navy, 10% mint, 5% indigo.
- Dashboard: prioritize neutral surfaces and readability; use accents sparingly.
- Primary CTA: Navy or indigo with white text; avoid mint with white text without checking contrast.
- Mint works well as a highlight or with dark navy text (9.0:1).
- **Never use Connection Mint `#34D399` as text on white or Cloud (1.9:1).** Use Mint Ink `#047857` for mint-colored text.
- Always test WCAG AA contrast for real foreground/background combinations.

### Dark mode

| Token | Light | Dark | Note |
|---|---|---|---|
| Canvas | `#F6F8FB` | `#0B1422` | |
| Surface | `#FFFFFF` | `#152235` | |
| Text | `#172338` | `#F7FAFC` | 15.3:1 on dark surface |
| Muted | `#5B6B80` | `#B2C0D2` | 8.7:1 on dark surface |
| Border | `#E2E8F0` | `#293A51` | |
| Indigo (accent/primary) | `#5265E8` | `#8B9BFF` | Dark: use navy text on indigo buttons (6.8:1) |
| Mint | `#34D399` | `#34D399` | 8.3:1 on dark surface, usable as text in dark mode |
| Success | `#15803D` | `#4ADE80` | |
| Warning | `#B45309` | `#FBBF24` | |
| Danger | `#B91C1C` | `#F87171` | |

On dark backgrounds always use the `-dark` / `-white` logo variants; the navy wordmark disappears on dark surfaces.

### Design tokens (CSS)

The canonical token file is `app/globals.css` (copied into `app/globals.css` in the application). It defines the raw `--mevoriq-*` brand tokens, light and dark values, the shadcn/ui semantic variables (`--background`, `--foreground`, `--primary`, `--ring`, …) mapped onto them, and a Tailwind v4 `@theme inline` block. Change colors there only; never hard-code hex values in components.

| Token | Value |
|---|---|
| `--mevoriq-radius-sm / md / lg / xl` | 8 / 12 / 20 / 28px (exposed to Tailwind as `rounded-brand-*`, so Tailwind's and shadcn's own `rounded-*` scale stays intact) |
| `--mevoriq-shadow-card` | `0 8px 28px rgb(15 27 45 / 6%)` |
| `--mevoriq-font-display` | Manrope |
| `--mevoriq-font-ui` | Inter |

---

## 4. Typography

- **Logo and marketing headings:** Manrope (or professionally customized geometric sans wordmark).
- **Product UI:** Inter.
- **Fallbacks:** system-ui, sans-serif.
- **Language coverage:** include appropriate Noto Sans script subsets (e.g. Noto Sans Tamil, Noto Sans Sinhala, Noto Sans Arabic) as fallbacks when building multilingual profiles; Manrope and Inter cover Latin/Cyrillic/Greek only. Do not rely on English-only typography.
- **Loading:** load Manrope and Inter as **variable fonts** through `next/font` so intermediate weights such as 650 render correctly.

| Style | Desktop | Mobile | Weight | Usage |
|---|---|---|---|---|
| Display | 56–72px | 36–44px | 700–800 | Landing hero |
| H1 | 40–48px | 30–36px | 700 | Section/page heading |
| H2 | 28–36px | 24–28px | 650–700 | Major section |
| H3 | 20–24px | 20px | 600–700 | Cards and modules |
| Body | 16px | 16px | 400–500 | General copy |
| Small | 14px | 14px | 400–500 | Support text |
| Label | 12–13px | 12–13px | 600 | UI metadata |

Use reasonable line heights, support 200% text zoom and prevent clipping on narrow screens.

---

## 5. Iconography, graphics and imagery

- Icons: Lucide icon family, consistent stroke around 1.75–2px.
- Shapes: rounded rectangles, gentle connecting paths, dots/joins and clear QR motifs.
- Illustration: minimal abstract connections rather than generic handshake stock visuals.
- Motion: 150–250ms for ordinary UI transitions; respect `prefers-reduced-motion`.
- Photography: authentic professionals, multicultural representation, actual product screens.
- Use actual screenshot mockups only after the frontend exists; never depict imagined product functionality as already shipped.

---

## 6. Website experience (Next.js)

### Marketing sitemap
- `/` — Home
- `/features` — Benefits and capabilities
- `/templates` — Template gallery (single canonical gallery; SEO page `/business-card-templates` redirects here)
- `/for-individuals` — Individual users
- `/for-teams` — Company/team users
- `/pricing` — Free-first policy and future plan messaging
- `/how-it-works` — Three-step onboarding
- `/blog` — Educational SEO content
- `/about` — Company background
- `/contact` — Support/contact
- `/privacy`, `/terms`, `/cookies` — Legal pages (analytics that set cookies or similar identifiers need a consent banner for EU/UK visitors; first-party cookieless aggregate counting is preferred)
- `/login`, `/signup`, `/forgot-password` — Authentication
- `/onboarding` — First-card wizard; `/app/...` — signed-in product (see `product-plan.md` §5 for the full route table)

### Home page structure
1. Header with symbol/wordmark, navigation, Login and **Create Free Card** CTA.
2. Hero: **Your identity. Every connection.** Supporting line: *Create a modern digital business card, share one permanent link or QR code, and make introductions effortless.*
3. Live interactive mobile card demo.
4. How it works: Create → Personalize → Share.
5. Features: custom design, QR link, vCard, link collection, basic contact exchange.
6. Template gallery with distinct individual and company styles.
7. Team section: shared brand control and membership.
8. Transparent free-launch section with no invented deadline.
9. FAQ and privacy/trust information.
10. CTA and footer.

### Landing page visual direction
- White/cloud background across most sections.
- Navy hero or navy highlighted features section.
- High-quality mobile card demos are focal points.
- Mint line/connection motifs used as brand signature.
- Rounded 16–24px surfaces, restrained shadows, no heavy parallax or slow intro animation.
- Maintain strong contrast, clear hierarchy and accessible motion.

### Responsive breakpoints (implementation guidance)
- 320–639px: single column, collapsed nav, full-width actions.
- 640–767px: compact two-column content when appropriate.
- 768–1023px: tablet layouts with intermediate navigation.
- 1024px+: full navigation, two-column editor and dashboard sidebar.
- 1440px+: cap reading width; avoid excessively stretched content. (1440px is not a default Tailwind breakpoint; it is added as a custom `3xl` breakpoint. Tailwind `2xl` = 1536px.)

Avoid relying exclusively on breakpoints; use fluid grids, `minmax`, `clamp`, and intrinsic sizing.

---

## 7. Application UI system

### Core user-facing screens
| Screen | Route |
|---|---|
| Dashboard overview | `/app` |
| My Cards (list/grid) | `/app/cards` |
| New Card onboarding wizard | `/onboarding`, `/app/cards/new` |
| Card Studio (details, links, appearance, visibility) + Live Preview | `/app/cards/[id]/edit` |
| Share (URL, copy, QR SVG/PNG, vCard, Meeting Mode) | `/app/cards/[id]/share` |
| Connections / lead inbox | `/app/connections` |
| Analytics (views, click events, saves where detectable) | `/app/analytics` |
| Account and security settings | `/app/settings` |
| Organization settings, members, roles, brand presets | `/app/team`, `/app/team/members`, `/app/team/brand` |
| Public card / Meeting Mode | `/u/[slug]`, `/u/[slug]/meeting` |

### Public digital card
**First screen:** profile image, name, job title, organization, succinct bio, Save Contact, and clear primary contact buttons.

**Additional blocks:** professional links, social channels, location, gallery or optional portfolio, organization information, lead exchange form, share QR.

**Interaction standards:**
- Opening a public card must not require login.
- QR code points to permanent HTTPS public URL.
- vCard generation supports correct contact names, international numbers and Unicode.
- Contact form requires clear collection notice and abuse controls.
- Keep visual identity customizable while enforcing accessible contrast and legibility.

### Dashboard layout
- Desktop: collapsible left navigation, top page tools, cards and metrics in main region.
- Mobile: concise header, tabs or bottom navigation for core areas; thumb-friendly primary actions.
- Use sheets/drawers for short actions and full pages for complex forms.
- Auto-save drafts when reliable; show save state and validation feedback.

### Components
`Button`, `Input`, `Select`, `Avatar`, `Card`, `Badge`, `Dialog`, `Sheet`, `Toast`, `Tabs`, `Sidebar`, `TemplateTile`, `CardPreview`, `QRPanel`, `ContactSaveButton`, `LeadForm`, `MemberTable`, `ThemePicker`, `AnalyticsCard`.

### Accessibility and performance
- Target WCAG 2.2 AA.
- Keyboard focus visible; no color-only status signals.
- Target p75 LCP ≤ 2.5s and CLS ≤ 0.1 on public cards.
- Optimize avatar/logo images, use caching, SSR/ISR where suitable.
- Respect reduced motion; test at 320px and with zoom.

---

## 8. Product feature messaging

### Free-first launch offer
**Current positioning:** “All launch features free while Mevoriq grows.”

Do not promise lifetime free access to features that may later become paid. Before monetization, publish a clear advance notice and grandfathering/migration policy. Never remove users' access to their own data without a reasonable export process.

### Capabilities to emphasize
1. One link and downloadable QR.
2. Modern templates and live preview.
3. One-tap contact save via vCard.
4. Context-specific cards (work, freelance, event) when implemented.
5. Meeting Mode: a full-screen view with a large QR code, name, title and an optional 20-word intro for showing in person (`product-plan.md` SHARE-04). Marketed as **Mevoriq Meet** once event-tagged contacts are built (see `sub-brand-guidelines.md`).
6. Contact exchange and organized follow-ups when implemented.
7. Team-branded cards and controls when implemented.
8. Multilingual content when implemented.

**Do not advertise features as available until actually implemented and tested.**

---

## 9. Social media and campaign identity

### Social handles
Prefer consistent `@mevoriq` where genuinely available; otherwise use something like `@getmevoriq`. Availability unverified.

### Avatar
Use symbol-only navy rounded-square mark, with generous negative space and no tiny text.

### Covers and hero sizes
- Social square: 1080 × 1080
- Portrait social: 1080 × 1350
- Stories/reels cover: 1080 × 1920
- Open Graph image: 1200 × 630
- LinkedIn banner: 1584 × 396 (check current platform cropping at publication)
- Product Hunt/gallery visuals: use current platform specs before publishing.

### Post series
- Launch: “Your identity. Every connection.”
- Demo: Build your card in minutes.
- Problem/solution: Stop sending outdated contact information.
- Product: Your QR stays the same even when your details change.
- Teams: One company brand, every employee.
- Free-first: Try launch features at no cost.

### Marketing copy example
> **Meet Mevoriq.** A beautiful new way to share who you are. Build your professional digital card, send your link or QR code, and let others save your details in seconds. Starting free.

---

## 10. Application technology and implementation

### Approved baseline
- Next.js App Router + React + TypeScript
- Tailwind CSS + shadcn/ui + Lucide
- Supabase Auth + PostgreSQL + Storage
- Vercel deployment and preview environments
- Zod input validation
- Vitest unit tests + Playwright E2E
- Vercel Analytics or privacy-aware first-party analytics where appropriate

### Repository organization
The repository layout is defined in `product-plan.md` §15 and is the single source of truth. Brand-specific locations:

```text
public/brand/           logo + icon files (swap here when the logo changes)
components/brand/       <Logo>, <LogoSymbol>; the only components that reference logo files
lib/brand/config.ts     brand name, tagline, logo paths, theme color
app/globals.css         tokens from app/globals.css
brand/                  master brand kit (sources, all export sizes)
```

### Theme configuration
Define brand tokens globally, but let users customize public-card template palettes within accessible bounds. Platform logo, dashboard style and product navigation remain consistent.

### Database
The data model (table names, columns, constraints) is defined in `product-plan.md` §8 and is canonical. Core tables: `profiles`, `organizations`, `organization_members`, `organization_invitations`, `cards`, `card_contacts`, `card_links`, `card_media`, `card_themes`, `card_slug_history`, `lead_exchanges`, `lead_notes`, `card_event_daily`, `team_brand_profiles`, `abuse_reports`, `audit_logs`, `feature_flags`.

Use RLS and explicitly scoped public read projections. Public card endpoints must never leak user emails or private leads unless those fields are expressly marked public.

### Security basics
- Server-side session validation, RLS, role separation.
- Media upload controls, rate limits and signed URLs as appropriate.
- Spam and impersonation reporting.
- Avoid exposing Supabase service role credentials client-side.
- Public privacy policy, data export and deletion flows.
- Privacy-conscious analytics with retention settings.

---

## 11. SEO and messaging

**Home title suggestion:** `Mevoriq — Free Digital Business Cards & Professional Profiles`  
**Meta description:** `Create a modern digital business card with Mevoriq. Share one link or QR code, let people save your contact details, and build a professional identity online.`

### Priority keywords
- free digital business card
- digital business card maker
- QR code business card
- share contact details online
- online professional card
- digital business cards for teams
- professional contact page

### SEO requirements
- Semantically structured headings, unique metadata.
- XML sitemap, robots directives and canonical URLs.
- Open Graph and social previews for public cards, with explicit user visibility controls.
- Schema.org Organization/WebSite on public marketing pages where applicable.
- Avoid creating thin SEO landing pages or auto-indexing personal profiles against user preferences.

---

## 12. Launch design assets and production checklist

### Design deliverables
- [ ] Select and refine logo concept
- [ ] Rebuild original final SVG/logo source
- [ ] Produce primary, reversed, mono and icon-only marks
- [ ] Test symbol at favicon sizes
- [ ] Approve final colors and accessibility combinations
- [ ] Approve typographic scale
- [ ] Finalize desktop/mobile website Figma screens
- [ ] Finalize public card templates
- [ ] Finalize dashboard component library
- [ ] Build export-ready social media kit
- [ ] Produce favicon/PWA assets
- [ ] Finalize brand voice and product copy

### Product release gates
- [ ] Accessible mobile navigation and forms
- [ ] Create/edit/publish card end-to-end
- [ ] Permanent QR URL and functioning vCard
- [ ] Supabase RLS allow/deny testing
- [ ] Responsive coverage on real devices
- [ ] Abuse reporting and privacy controls
- [ ] Accurate free launch terms
- [ ] Error handling, backups, logging and monitoring

---

## 13. Domain and legal clearance

The creative name **Mevoriq** is not yet verified as available, unique in every territory, or free from conflicting trademarks. Domain availability and trademark registration are separate questions.

**Preferred domain candidate:** `mevoriq.com`  
**Alternatives to investigate:** `mevoriq.app`, `getmevoriq.com`, `usemevoriq.com`, `mevoriq.io`, `mevoriq.co`.

**Required before launch:**
1. Check current `.com`/TLD registration through a live registrar or registry RDAP.
2. Search WIPO and relevant national trademark databases for exact and phonetic matches.
3. Check app stores, software repositories, social handles and relevant companies.
4. Seek professional trademark advice before significant paid branding or launch activity.
5. Register relevant domains and protect naming consistently.

No domain in this document is represented as confirmed available.

---

## 14. Immediate execution plan

### Day 1–2: Decide brand
- Select Concept 04 or Concept 02.
- Verify name and domain rights.
- Set one canonical palette and typography standard.

### Day 3–4: Finalize vectors
- Recreate logo in Figma/Illustrator as clean paths.
- Test favicon, mobile header, dark/light, small print and monochrome.
- Export SVG and transparent PNG variants.

### Day 5–7: Product design system
- Implement Tailwind tokens and shadcn theme.
- Build common buttons, fields, cards, navigation and typography.
- Create marketing hero and public card preview.

### Day 8–14: Website and product screens
- Build responsive marketing home, templates and features pages.
- Build signup and onboarding.
- Build card create/edit/public view and responsive sharing UI.
- Verify accessibility and QA on mobile/tablet/desktop.

---

## 15. Final decisions to lock

| Decision | Current recommendation | Status |
|---|---|---|
| Brand | Mevoriq | Proposed, clearance pending |
| Primary tagline | Your identity. Every connection. | Proposed |
| Logo | Linked M + mint node symbol, Manrope wordmark (kit v0.1 in `brand/`) | Generated; hand refinement pending; swappable by design |
| Alternate logo | Concept 02 Network M | Backup |
| Main color | Charcoal Navy `#0F1B2D` | Proposed |
| Accent | Connection Mint `#34D399` | Proposed |
| Auxiliary accent | Digital Indigo `#5265E8` | Proposed |
| Fonts | Manrope (display) + Inter (UI), variable, via `next/font` | Proposed |
| Muted text | `#5B6B80` (was `#64748B`, failed AA on Cloud) | Changed in v1.1 |
| Mint text | Mint Ink `#047857` | Added in v1.1 |
| Product | Digital business cards for individuals + teams | Confirmed concept |
| Launch | Free-first, web-only, global | Confirmed strategy |
| NFC | None | Excluded |
| Technology | Next.js + Supabase + Vercel | Confirmed direction |

**This file is the brand and visual implementation companion to `docs/product-plan.md`.** It is the single source of truth for colors, typography, logo and presentation rules; `product-plan.md` is the single source of truth for features, routes, data model and API. Conflicts resolved between the two are recorded in `docs/decisions.md`. Update this file after final logo refinement.
