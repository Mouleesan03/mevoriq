# Mevoriq — Decision Log

Records conflicts found between `product-plan.md` (formerly the "CardFlow" master plan), `brand-guidelines.md` and the brand kit, and how each was resolved, in date order.

**Rule:** colors, typography, logo and voice → `brand-guidelines.md`. Features, routes, data model, API and delivery → `product-plan.md`.

## D-001 · 1 Nov 2026 · Document unification (v1.1)

| # | Topic | Conflict | Decision |
|---|---|---|---|
| 1 | Product name | Plan used placeholder "CardFlow" and repo `cardflow/` | **Mevoriq** everywhere; repo `mevoriq/`. Clearance still pending. |
| 2 | Palette | Plan: `#4F46E5`, `#111827`, `#F7F9FC`, `#0B1020` … | Brand palette: Navy `#0F1B2D`, Mint `#34D399`, Indigo `#5265E8`, Cloud `#F6F8FB`, Slate Ink `#172338`. |
| 3 | Status colors | Plan success `#059669` (3.8:1) and warning `#D97706` (3.2:1) fail WCAG AA on white | Brand values `#15803D` / `#B45309` (5.0:1). Dark: `#4ADE80` / `#FBBF24` / `#F87171`. |
| 4 | Muted text | `#64748B` is 4.47:1 on Cloud (fails AA) | Changed to **`#5B6B80`** (5.1:1 on Cloud, 5.4:1 on white). |
| 5 | Mint as text | Mint on white is 1.9:1 | Added **Mint Ink `#047857`** (5.5:1) for mint-colored text; `#34D399` is for fills/highlights only on light surfaces. |
| 6 | Dark mode accents | Brand `.dark` block had no indigo/mint values | Dark indigo **`#8B9BFF`** (navy text on it, 6.8:1); mint unchanged (8.3:1 on dark surface). |
| 7 | Fonts | Plan: Geist or Inter. Brand: Manrope + Inter | **Manrope** (display) + **Inter** (UI), variable via `next/font`. |
| 8 | Dashboard route | Brand: `/dashboard`. Plan: `/app` | **`/app`**. |
| 9 | Template gallery | Brand `/templates`, plan `/explore/templates` **and** SEO `/business-card-templates` | One gallery at **`/templates`**; SEO URL redirects or links to it. |
| 10 | DB table names | Brand: `leads`, `card_fields`, `card_designs`, `card_events_daily`, `organization_invites` | Plan names win: `lead_exchanges`, `card_contacts`, `card_themes`, `card_event_daily`, `organization_invitations`. |
| 11 | "Free forever" | Plan pricing table said "$0 forever"; brand voice forbids "Free forever" | "Always-available free baseline"; public copy says "Starting free" / "Free during early access". |
| 12 | Permanent link vs slug changes | Brand doc implied slug = permanent URL | `card_slug_history` + redirects (plan CARD-05) keep old QR codes working. |
| 13 | Follow-up lead color | Overview: Mint · color table: Cloud · CSS: Navy | **Navy lead on Cloud surfaces, Mint highlight** (matches CSS). |
| 14 | Tailwind config | Kit shipped a v3 `theme.extend` snippet that overrode `rounded-sm…xl` | Tailwind v4 `@theme inline` in `mevoriq-tokens.css`; brand radii exposed as `rounded-brand-*` so shadcn radii stay intact. v3 snippet removed. |
| 15 | Web manifest | Missing `id`, `start_url`, `scope` | Added. |
| 16 | 1440px breakpoint | Not a Tailwind default | Custom `3xl: 1440px`. |
| 17 | Meeting Mode naming | "Mobile meeting mode" undefined in brand doc | Defined as plan SHARE-04; marketed as **Mevoriq Meet** only after event-tagged contacts ship. |
| 18 | Logo stability | Logo will change | Logo files only in `public/brand/`, referenced only via `components/brand/*` and `lib/brand/config.ts`. |

## Open (not decided here)

- Final hand-refined logo vectors; trademark/domain clearance for "Mevoriq" and "Mevoriq Meet".
- Pronunciation.
- Items in `product-plan.md` §19.

## D-002 · 1 Nov 2026 · First vertical slice implementation

| # | Topic | Decision |
|---|---|---|
| 1 | Framework | Next.js 16.4 (App Router, Turbopack, **Cache Components on**), React 19.3, Tailwind v4, shadcn/ui (Radix), zod 4. Signed-in pages and public cards render behind `<Suspense>`. |
| 2 | Data without Supabase | `lib/data/repository.ts` interface; `local-store.ts` JSON file for development only (refuses to run in production unless `MEVORIQ_ALLOW_LOCAL_STORE=1`). Supabase repository comes next, against `supabase/migrations/`. |
| 3 | Auth without Supabase | Demo sign-in (name + email) sets an httpOnly cookie holding an opaque user id. `requireUser()` guards every page and action; `proxy.ts` only does the optimistic redirect. Replace with Supabase SSR auth. |
| 4 | Forms | Server actions + zod with `useActionState` for this slice instead of React Hook Form; revisit if forms grow. |
| 5 | Soft 404 / redirect | Because pages stream, unknown cards return the not-found UI with `noindex` but HTTP 200, and former slugs redirect via a streamed 308 (meta refresh). Real 404/308 status codes need a fast slug check in `proxy.ts` once Supabase exists. |
| 6 | Profile photos | Not in this slice (no storage yet); cards show initials. |
| 7 | Brand icons | Lucide no longer ships brand logos (LinkedIn, Instagram, YouTube); generic icons are used for those link types. |

## D-003 · 2 Nov 2026 · UI rework and full feature model

| # | Topic | Decision |
|---|---|---|
| 1 | Visual direction | Clean, light and minimal (owner's choice). White/Cloud surfaces, hairline dividers, pill buttons, 44px inputs. Manrope display set tight; Inter for UI; **IBM Plex Mono** for card addresses, because the permanent link is the product. |
| 2 | Signature element | The **flipping business card**: a real 3.5 × 2 in card whose back is the QR code. Used in the hero, dashboard, share page, card lists and at the top of every public card. Tap or Enter to flip; reduced motion skips the intro flip. |
| 3 | Navigation | Top tabs on desktop, bottom tab bar on mobile. Team and Admin live in the account menu on mobile. |
| 4 | Public card | Business card, then one "Save contact" button, then iOS-style grouped rows (call, email, WhatsApp, website), about, links, "Share your details", report link. Phone numbers are shown exactly as stored (E.164). |
| 5 | Meeting Mode | Restyled as the Mevoriq Meet session screen: full-bleed indigo, QR on white, mint pulse rings once. |
| 6 | Contact exchange | No-login form with required sharing consent and separate optional marketing consent; consent version stored; honeypot + per-device rate limits (in-memory, single instance). |
| 7 | Contacts inbox | Status (new, following up, done, archived), tags, private note, follow-up date, CSV export with formula-injection guard. |
| 8 | Insights | Daily counts per card and event type only (view, visitors est., saves, link clicks, shared back, QR downloads). Owner visits and bot user agents excluded; unique visitors via a 30-minute cookie. Single-series indigo bar chart validated with the dataviz checks; table fallback. |
| 9 | Photos and logos | Uploads checked by file signature, max 5 MB, re-encoded to 512px WebP with metadata stripped (sharp). Served from `/api/v1/media/[id]` with immutable caching. Server action body limit raised to 6 MB. |
| 10 | Teams | Roles owner/admin/manager/member. Invitations are single-use hashed tokens valid 7 days; the link is shown to the admin until email delivery exists, and only the invited email can accept. Locked fields (theme, company, website) are enforced on the server and re-applied to all company cards when the brand changes. Removing access unpublishes that person's company cards; personal cards are untouched. Admins see company-card contacts only if the org turns it on. |
| 11 | Platform admin | `MEVORIQ_ADMIN_EMAILS` env list. Reports queue (suspend, restore to draft, dismiss), feature flags (contact_exchange, teams, signups, maintenance_mode), audit log. Suspended cards can't be republished by owners. |
| 12 | Data layer | `lib/data/*` modules (cards, leads, analytics, media, orgs, profiles, admin) over one JSON store; `lib/data/access.ts` holds every authorization rule. `supabase/migrations/20261102000000_leads_teams_admin.sql` mirrors the model with RLS (not yet applied). |

## D-004 · 2 Nov 2026 · Bright identity across the whole app

| # | Topic | Decision |
|---|---|---|
| 1 | Direction | Owner chose the "Bright" mockups for the whole app. Brand guidelines §0 (v2.0) now overrides the earlier navy/mint visual rules. |
| 2 | Token strategy | Token names stay (`navy`, `indigo`, `mint`…) but now hold Bright values (ink, blue, green), plus new `yellow`, `coral`, `pink`, `sky`, `cream`, `leaf`, `fill`, `body`. Pages restyle through tokens instead of per-file color edits. |
| 3 | Fonts | Plus Jakarta Sans + Geist Mono replace Manrope, Inter and IBM Plex Mono. |
| 4 | Logo | New symbol files generated from the mockup's SVG; wordmark rendered as live text so it never needs outlining in the app. PNG icons regenerated with sharp. Navy kit archived. A designer-made outlined lockup is still needed for print. |
| 5 | Landing | Rebuilt to the mockup: floating pill nav, centered hero, interactive card fan (tap to deal a card forward), Scan/Send/Swap tiles, numbered step cards, alternating feature panels, template gallery, blue Teams panel, blush "Starting free" band. The flipping business card remains the signature inside the product. |
| 6 | Login | Split layout from the mockup with a live card preview that follows the typed name. |
| 7 | App | Floating pill header with ink active tab, floating bottom bar on mobile, 24–32px panel radii, filled inputs, blue primary buttons. Meeting Mode uses brand blue. Chart series color re-validated (`#2448E8`, all dataviz checks pass). |
| 8 | Templates | Template faces follow the mockup (Editorial = blush, Modern Corporate = yellow, Midnight = `#141B33`, Aurora = blue→violet). Existing cards keep their template; old accents fall back to each template's first preset. |

## D-005 · 2 Nov 2026 · Marketing site completed, scroll motion, English examples

| # | Topic | Decision |
|---|---|---|
| 1 | Example people | All sample names and examples are English and fictional (Emma Carter, James Walker, Olivia Hayes, Sophie Bennett, Daniel Brooks, Ryan Mitchell). Phone examples use the UK drama range (+44 7700 900xxx); location example "London, United Kingdom". Defined once in `lib/marketing/fan.ts`. |
| 2 | New pages | `/features`, `/templates` (live template + accent playground), `/pricing` (free early access, no future prices published), `/teams`, `/about`, `/contact` (form saved to the admin console), `/privacy`, `/terms`, `/cookies` (marked as drafts pending legal review), custom 404, `sitemap.xml`, `robots.txt`. |
| 3 | Home additions | "Your details, your rules" trust section, FAQ accordion, links to Features/Templates/Teams, four-column footer. |
| 4 | Scroll motion | Every marketing section reveals as it enters the viewport (fade/slide/tilt with stagger), a reading-progress bar sits at the top, the hero card fan spreads and lifts as you scroll, and "How it works" is a pinned scroll story where the card flips to its QR side and lands in a phone's contacts. All motion is off with `prefers-reduced-motion`, and content stays visible without JavaScript. |
| 5 | Copy | Wording reviewed for plain, consistent language. Unverifiable promises removed (reply times, "unlimited"). "Coming next" names only work in progress, never as available. |
| 6 | Contact messages | Stored in the local store (`messages`), rate-limited with a honeypot, listed in `/admin` with a done/new toggle. Needs a `contact_messages` table when Supabase is connected. |

## D-006 · 2 Nov 2026 · Responsive overhaul (mobile first)

| # | Topic | Decision |
|---|---|---|
| 1 | Layout system | New utilities in `app/globals.css`: `container-page` (1200px max, 20/24/32px gutters), `section-y` (64/88/112px), `text-display`, `text-h2`, `text-h3`, `text-lead`, `no-scrollbar`. Pages use these instead of one-off sizes. |
| 2 | Hero | Replaced the oversized centered card fan with a split hero: left-aligned copy, two CTAs, three trust points, and a compact card deck (auto-cycling templates with tap-able dots, gentle scroll tilt). Fits above the fold on desktop; about one screen of copy on phones. |
| 3 | Navigation | Marketing header is a compact bar with a full-screen menu on phones (portal-rendered, Escape to close, scroll lock, inert when closed); "Get started" CTA always visible. Footer collapses to two columns. |
| 4 | Sections | Section headings with eyebrow labels; share tiles shrink on phones; templates become a swipeable row on phones; teams/trust/FAQ/CTA band paddings and radii scale down; "Made for" audience marquee (paused with reduced motion). |
| 5 | App | Smaller page titles on phones, horizontally scrollable filter chips, stat tiles on the dashboard, and the editor's save bar floats above the mobile bottom navigation (CSS variable `--bottom-nav`). |
| 6 | Overflow | `overflow-x: clip` on html/body; reveal slide distance reduced. Verified with an automated audit of 25 routes × 320/375/768/1024/1440 px: no horizontal scrolling, no clipped text, tap targets ≥ 44px for controls. |

## D-007 · 2 Nov 2026 · Production readiness: Supabase, auth, publish

| # | Topic | Decision |
|---|---|---|
| 1 | Schema | One consolidated migration (`20261102120000_mevoriq_schema.sql`) replaces the two unapplied drafts and matches the app's models exactly. Card contacts/links/theme are validated JSON on the card row (atomic edits with `version`). Verified on PGlite (real Postgres in WebAssembly) with Supabase stubs. Documented in `docs/database.md`. |
| 2 | Access model | Server uses the Supabase secret key; every permission is checked in `lib/data/access.ts` (shared by both backends). RLS enabled on all tables as defense in depth; anonymous clients have no table access. |
| 3 | Backends | `lib/data/*.ts` facades pick `lib/data/supabase/*` when Supabase env vars are set, otherwise `lib/data/local/*` (development). The local store refuses to run in production. |
| 4 | Auth | Supabase email magic link + Google OAuth (`lib/actions/auth.ts`, `app/auth/callback`). `proxy.ts` refreshes the session cookie and guards protected routes. Profiles are created by a database trigger on sign-up. Sign-in emails are rate-limited. |
| 5 | Media | Supabase Storage bucket `card-media` (public read, server-only writes, WebP ≤ 5 MB); `/api/v1/media/[id]` redirects to the CDN URL. |
| 6 | Rate limiting | Shared Postgres limiter (`hit_rate_limit`) in production so limits hold across serverless instances; fails open if the limiter itself errors. |
| 7 | Publish extras | Site and per-card Open Graph images, error boundaries (`error.tsx`, `global-error.tsx`), security headers (HSTS, frame-ancestors none, nosniff, referrer and permissions policies). |
| 8 | Not verified yet | The Supabase code paths are type-checked and built but not yet run against a live project (no keys were available). Verify with `docs/deploy.md` §2 and §5. |

## D-008 · 2 Nov 2026 · Event Mode and recap (Mevoriq Meet, first slice)

Why: competitor review (myqr.lk) showed card features are a commodity; Mevoriq's edge is what happens after the meeting.

| # | Topic | Decision |
|---|---|---|
| 1 | Behaviour | A person starts an event (name only) at `/app/events`. While it is live, every contact shared back from any of their cards is linked to it (`leads.event_id`) and tagged with the event's slug (`#devfest-colombo-2026`). One live event at a time; starting another ends the first. |
| 2 | Safety net | An event left open stops tagging after 18 hours, so next week's contacts are not mislabelled. |
| 3 | Recap | `/app/events/[id]`: who you met and when, notes left, opt-ins, and three next steps: put every new contact on tomorrow's follow-up list, export a per-event CSV (`/api/v1/exports/leads?event=`), and open them in Contacts by tag. |
| 4 | Privacy | Nothing about the event is shown on public cards or Meeting Mode; visitors are not told where the owner is. Events are personal (not shared with org admins). |
| 5 | Navigation | Events joins the main nav. Mobile bottom bar: Home, Cards, Contacts, Events, Insights (Team and Settings move to the account menu). The desktop top bar now starts at 1024px; below that the bottom bar is used, because seven tabs no longer fit at 768px. |
| 6 | Schema | New migration `20261102130000_event_mode.sql` (table `network_events`, `leads.event_id`, owner-read RLS). Verified on PGlite, including the one-open-event index. |

## D-009 · 2 Nov 2026 · Follow-ups, QR source labels, reply card, verified badge

| # | Topic | Decision |
|---|---|---|
| 1 | Follow-up reminders | Home shows "Follow up today" (open contacts with a follow-up date today or earlier, oldest first) with a one-tap Done. Contacts has a "Follow up due" filter (`?due=1`). Email digests wait for an email provider. |
| 2 | QR source labels | Five fixed labels (print, event badge, email signature, slides, social bio) in `lib/cards/sources.ts`. Each card's Share page offers a QR and link per label (`?s=badge`). The public card reports the label with its view; Insights shows "Where scans come from". Counts only, in `card_source_daily` (migration `20261102140000_qr_sources.sql`). |
| 3 | Reply card | Public cards link to `/r/[slug]` ("Make your own free card", and after sharing details). It stores only the slug in a 7-day cookie. After sign-up, Home and the Share page offer "Send your card back to …", which adds the new person as a contact on that card (name, email, card link; no marketing opt-in). |
| 4 | Verified badge | Shown on a public card when its website or contact email is on the same domain as the owner's sign-in email (proved by magic link or Google). Free mail providers never qualify. Computed when the card is shown, so it disappears if either side changes (`lib/cards/verified.ts`). |
| 5 | UI fixes | Marketing header shows its links from 1024px (menu below), so "Log in" no longer wraps at 768px. Home share tiles: larger QR, readable overlapping initials, link pill wraps instead of truncating. QR codes use the Bright ink colour. |

## D-010 · 2 Nov 2026 · Wallet passes, company sign-up, UI polish

| # | Topic | Decision |
|---|---|---|
| 1 | Wallet passes | A card's owner can add their live card to Apple Wallet (signed `.pkpass`, Generic style, via `passkit-generator`) or Google Wallet (signed "Save to Google Wallet" JWT with the class and object inline). Both show name, title, company and the card QR. Route: `/api/v1/cards/[id]/wallet/{apple,google}` (owner only, live cards only). Buttons appear only when that provider's keys are set (`docs/deploy.md` §6). Tested with self-signed certificates and a generated key; not yet tested with real Apple/Google accounts. `passkit-generator` pulls in `joi`, which has open advisories; we only pass server-built values to it. |
| 2 | Company sign-up | New accounts choose "Just me" or "My company". Company: register the business (name, optional website) and become its owner, then make your own card with company details prefilled, then invite employees. Home nudges owners to invite their team until someone joins. Marketing "Register your company" links go to `/login?next=/onboarding?for=business`. |
| 3 | UI polish | Floating headers get a fade backdrop so content no longer shows above them. Home share tiles: QR sits inside its quiet zone, compact on phones. New home section "Made for conferences, meetups and sales calls" and updated Features page. Phone numbers display grouped (`formatPhone`). Contacts show follow-up and tags on phones. One "Make your own" link per public card, now part of the reply loop. |

## D-012 · 2 Nov 2026 · Mesh-gradient hero, dark footer, installable app (PWA)

| # | Topic | Decision |
|---|---|---|
| 1 | Hero | The line ribbon is replaced by a slanted, slowly flowing mesh gradient in the Bright colours (`components/marketing/hero-gradient.tsx`, WebGL simplex noise at half resolution; CSS gradient fallback; pauses off-screen; still frame for reduced motion). Desktop: a slanted panel behind the card deck, running under the translucent header. Phones: a slanted band behind the deck. |
| 2 | Footer | Dark ink footer with a "Create your free card" button and Product / Company / Legal links. Bottom line: "© {year} Mevoriq. All rights reserved. · A product of Infonits · Made with ♥ for every connection". The year comes from a cached function (`lib/year.ts`) so pages still prerender. |
| 3 | Installable app | `app/manifest.ts` (standalone, opens `/app`, white theme, maskable icon, shortcuts for Share, Contacts, Events), Apple web-app meta, `viewport-fit=cover` with safe-area padding on headers, the public card, Meeting Mode and the mobile menu. |
| 4 | Offline | `public/sw.js` (registered in production builds only): build assets cache-first; public pages (cards, Meeting Mode, marketing) network-first with an offline copy; signed-in pages are never cached and fall back to `/offline`. Home asks the worker to keep the owner's live cards and Meeting Mode ready, so the QR opens without signal. |
| 5 | Install prompt | Phones see "Add Mevoriq to your home screen" on Home: the browser's install prompt where supported, Safari's Share → Add to Home Screen steps on iPhone. Dismissal is remembered on the device. |
| 6 | Mobile-first Home | "Show my QR" is the main full-width action, with Share and Copy link beneath. Meeting Mode opens inside the app and closes back to Home (`?from=app`), instead of a new browser tab. Card previews are capped at 440–460px on tablets. |
| 7 | Not verified | The in-app preview browser refuses service workers, so install and offline behaviour were checked by script (headers, manifest, worker syntax, cache rules), not on a phone. Check with Chrome DevTools → Application / Lighthouse on the deployed site. |
