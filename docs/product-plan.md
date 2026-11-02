# Mevoriq — Master Product, Design & Engineering Plan

**Document version:** 1.1 (unified with `brand-guidelines.md`; see `decisions.md`)  
**Prepared:** 1 November 2026  
**Product name:** Mevoriq (proposed; domain and trademark not yet cleared — see `brand-guidelines.md` §13)  
**Source-of-truth split:** this document owns features, routes, data model, API and delivery; `brand-guidelines.md` owns colors, typography, logo and voice.  
**Market:** Global | **Audience:** Individuals + organizations | **Launch model:** Free-first | **Platform:** Responsive web/PWA | **Technology:** Next.js + Supabase  
**Excluded permanently from core strategy:** Physical cards, NFC hardware and NFC-related commerce.

> **Product thesis:** Build the most delightful way to introduce yourself professionally, exchange contacts and maintain useful connections—without forcing the recipient to install an app. Ship free, earn adoption and trust, and only later charge for optional advanced organizational and workflow value.

---

## 1. Executive decision

Launch a modern, multilingual, mobile-first digital business card platform where an individual can publish multiple context-specific identities, share a permanent QR/link, let visitors save a properly formatted vCard, and exchange details with explicit consent. Organizations can onboard people, maintain brand consistency, and manage company-owned cards. Initially **all released capabilities are free**, subject only to published fair-use and abuse-prevention limits. Billing code is **not required at day one**; implement feature flags/entitlement architecture so optional paid packages can be introduced later without breaking free cards or retroactively surprising founders/early users.

### Why this is not just another QR card generator

1. **Adaptive Cards / One Identity, Multiple Contexts:** one profile can produce context cards (work, speaking, freelance, event, creator) with tailored information and visibility. Users choose the card they share; do not infer sensitive context automatically.
2. **Meeting Mode:** focused screen with large scannable QR, customizable short introduction and optional contact-exchange prompt. Great on small phones at live events.
3. **Two-Way Contact Exchange:** visitor can save the owner's details instantly, optionally leave theirs, and explicitly consent to being contacted. No visitor account necessary.
4. **Follow-up Inbox:** captured contacts organized by manually selected tags, meeting context and notes; simple next-action reminder inside the app (not outbound email automation initially).
5. **Link Insights Without Creepy Tracking:** aggregated views, contact saves and clicked actions; no exact location or precise individual visitor profiling.
6. **Rich but Fast Design:** strong typography, premium motion, 12+ attractive preset appearances over time, high contrast and reduced-motion support.
7. **Team Identity System:** organizations create employee cards, centrally update branding, approve fields, and retain company-managed cards while employees keep their personal identities.
8. **Portable by Default:** permanent share links; vCard download; contacts CSV export; individual profile JSON export; honest deletion and retention controls.
9. **International from Day One:** Unicode names, country-aware phone input, time zones, localizable UI, RTL-ready layout, accessible design and multi-language profile variants in later phase.
10. **No-paywall launch:** differentiation is usability, quality and trust; the free offer is a strategy, not a claim that every future enterprise feature must be free forever.

### Explicit non-goals for v1

- No physical products or NFC.
- No full CRM, email marketing, automatic AI contact enrichment, facial recognition, QR tracking of named visitors, or surveillance analytics.
- No native mobile apps; deliver an installable PWA only when useful, with proper fallback.
- No unverified claims of GDPR/SOC 2 certification.
- No automatic public posting of private information; users control published fields.

---

## 2. Current market benchmark (checked November 2026)

The competitors below are a **capability benchmark, not proof that a feature is missing everywhere**. Plans and features change; verify before publishing public comparisons.

| Competitor | Publicly documented strengths | Observed constraint/market opening | Our decision |
|---|---|---|---|
| **Blinq** | Free card(s), QR, wallet and email signature; premium customization; enterprise/team tools and contact enrichment | Polished established competitor; differentiation cannot be QR alone | Prioritize speed, flexible identity contexts and honest free launch |
| **HiHello** | Business cards, card scanning, contact exchange, branding, team administration | Strong direct competitor, especially professional contact management | Differentiate with highly flexible visual templates + lightweight meeting workflow |
| **Wave Connect** | Free digital card, analytics, leads, wallet sharing; team workflows | Generous free plans exist in market | Free alone is not unique; combine free with superior UX and portability |
| **Popl** | Event lead capture, scanning, enterprise sales integrations | Extensive sales tooling may be overkill for individuals | Build simple exchange and follow-up before advanced CRM |
| **Uniqode** | QR/wallet, card management, team templates, multilingual cards, integrations | Free tier limited; team functionality commercialized | Make a generous team beta and target independent professionals/SMEs |
| **Haystack / V1CE / others** | Various combinations of scanning, branding, media, CRM, sharing | Design and packaging differ; market already full of commodity features | Win on delightful product experience, not inflated feature claims |

**Sources:**
- Blinq pricing: https://blinq.me/pricing
- Blinq free vs premium: https://support.blinq.me/en/articles/76397-free-vs-premium-what-s-included
- Uniqode plans: https://docs.uniqode.com/en/articles/17048919-plans-and-pricing-for-uniqode-cards
- Uniqode platform: https://www.uniqode.com/digital-business-card
- Feature benchmark (vendor-authored, treat as marketing): https://blinq.me/blog/best-digital-business-cards
- Independent cross-comparison (vendor-authored): https://www.clickcardapp.com/blog/best-digital-business-card-apps

### Feature positioning matrix

Legend: **Expected** = category baseline, **Emerging** = offered by some competitors, **Differentiator** = our proposed execution emphasis (not a uniqueness claim).

| Capability | Category status | Our implementation | Target phase |
|---|---|---|---|
| Permanent public card URL | Expected | Canonical slug + stable immutable card ID | MVP |
| QR / QR image download | Expected | SVG + PNG, usable at print/display sizes | MVP |
| Save contact / vCard | Expected | Standards-aware vCard 3.0, validation on iOS/Android | MVP |
| No-app recipient access | Expected | Fast, SEO/noindex-selectable web card | MVP |
| Rich templates | Expected | Premium design system with designer-quality typography | MVP |
| Wallet passes | Expected among leaders | Consider only after core UX; requires operational integration | Later |
| Two-way exchange | Expected among leaders | No-login opt-in exchange with visible privacy rules | MVP |
| Analytics | Expected | Privacy-aware aggregated event tracking | MVP |
| Card scanner | Emerging/baseline for some | Not initially; assess demand and privacy risks | Later |
| Team branding | Expected for B2B | Admin presets, company ownership and field locks | Beta |
| Multiple context cards | Offered in portions of market | First-class workflow and presets per occasion | MVP |
| Meeting Mode | Varies | Full-screen QR + intro + contact exchange action | MVP |
| Context-aware follow-up dashboard | Emerging | Manual next-action and source tags | Beta |
| Export and data portability | Mixed | vCard, CSV leads and profile JSON | MVP/Beta |
| Truly generous free release | Varies | All shipped features free during beta | Launch strategy |

---

## 3. Personas and primary user jobs

| Persona | Job to be done | Most important outcome |
|---|---|---|
| Job seeker / graduate | Present contact info and professional links | Easy credible introduction |
| Freelancer / creative | Share work and capture enquiries | Portfolio clicks and qualified leads |
| Consultant / lawyer / service provider | Introduce expertise quickly | Trust and appointment/contact conversion |
| Sales representative | Exchange details at meetings/events | Leads remembered and followed up |
| Business owner / startup founder | Distribute consistent team identities | Brand continuity |
| HR/operations administrator | Onboard/offboard employee cards centrally | Compliance and low admin effort |
| Card recipient | Save or return contact in seconds | No download, no login, low friction |

### End-to-end journeys

**Individual:** landing > free registration > select card purpose > enter essentials > choose template > preview > publish > copy link / show QR > visitor saves contact > optional visitor exchanges contact > owner sees lead.

**Organization:** register > create org > set brand > invite members > assign default company cards > employee checks own permitted fields > publish/share > admin reviews organization usage > deactivates departing member's company card safely.

**Visitor:** open a secure HTTPS URL > view contact > one-tap Save Contact > optionally submit name/email/message with consent > success state > no account required.

---

## 4. Functional requirements — implementation-ready

Priority codes: **P0 launch essential**, **P1 beta enhancement**, **P2 future**. P0 must ship before the public MVP. Everything shipped during the free-first phase is free.

### 4.1 Authentication and onboarding

- **AUTH-01 P0:** email/password sign-up, verified email, secure password reset.
- **AUTH-02 P0:** Google OAuth; use established Supabase PKCE/SSR patterns.
- **AUTH-03 P0:** protect dashboard server-side and verify ownership on every mutation.
- **AUTH-04 P0:** optional display-name collection; no credit card request.
- **AUTH-05 P0:** guided first card with 4 steps: identity, contact, design, publish.
- **AUTH-06 P1:** account merge policy and multi-factor authentication options.
- **AUTH-07 P0:** account deletion request and export controls.

### 4.2 Cards and rendering

- **CARD-01 P0:** create/edit/duplicate/archive/delete draft cards; publish/unpublish.
- **CARD-02 P0:** fields: given/full name, phonetic name optional, pronouns optional, job title, organization, bio, profile image, company logo, cover image, location free text, primary phone, secondary phone, email, website, WhatsApp, services, social links and custom CTA.
- **CARD-03 P0:** different context cards: Professional, Personal, Freelancer, Event, Creator; initial user-selected label and theme; independent visibility settings.
- **CARD-04 P0:** polished public card rendered on server and mobile-responsive.
- **CARD-05 P0:** unique slug, e.g. `/u/alex-morgan`; cannot hijack reserved words. On change, preserve old URL through controlled redirect or disallow slug change for the MVP; permanent QR guarantee must hold.
- **CARD-06 P0:** draft preview secure by authenticated session or expiring signed preview token.
- **CARD-07 P0:** five customizable templates (Minimal, Executive, Creative, Editorial, Gradient), layout tokens and color choices.
- **CARD-08 P0:** image upload limits, format validation, image optimization, thumbnail derivatives, user deletion support.
- **CARD-09 P0:** social URL validation, prevent unsafe schemes, external-link safety.
- **CARD-10 P1:** multiple featured projects and gallery (maximum budget-controlled asset count).
- **CARD-11 P1:** accessibility and locale-aware name/phone/address presentation.
- **CARD-12 P2:** multiple locale-specific versions of one card.

### 4.3 Sharing and QR

- **SHARE-01 P0:** copy URL, Web Share API with clipboard fallback.
- **SHARE-02 P0:** generate QR from canonical HTTPS URL, SVG/PNG download; customizable colors with contrast validation.
- **SHARE-03 P0:** vCard 3.0 `.vcf` download with escaped delimiters, normalized line endings, fields mapped correctly; use contact photo only if compatibility and bandwidth permit.
- **SHARE-04 P0:** Meeting Mode: large QR, name, title, optional 20-word intro and close button. Branded as **Mevoriq Meet** only after event-tagged contacts (LEAD-05) ship.
- **SHARE-05 P1:** branded email signature generator (HTML/plain text with copying instructions).
- **SHARE-06 P2:** Apple/Google Wallet passes if user interviews justify operational cost.

### 4.4 Leads and relationship organization

- **LEAD-01 P0:** optional visitor form collecting name, email, phone (optional), company (optional) and note (optional), with prominent privacy notice.
- **LEAD-02 P0:** rate limiting, bot protection, input sanitization, spam classification, abuse reporting.
- **LEAD-03 P0:** private leads list for card owner; no unauthenticated lead retrieval.
- **LEAD-04 P0:** CSV export and delete lead; distinguish lead consent for owner follow-up from optional marketing consent.
- **LEAD-05 P1:** lead tags, meeting context, follow-up status, owner-only notes.
- **LEAD-06 P1:** in-app follow-up reminders (no automatic messaging).
- **LEAD-07 P1:** email notification of new lead with safe redaction; no sensitive fields in logs.
- **LEAD-08 P2:** explicit user-triggered CRM export and integrations.

### 4.5 Analytics

- **AN-01 P0:** aggregate page view, save-contact download, link-click and QR share/download actions.
- **AN-02 P0:** instrument unique visitors with short-lived, privacy-conscious deduplication; analytics should be labeled estimates and never sold as exact persons.
- **AN-03 P0:** daily aggregates; 7/30/90-day chart views.
- **AN-04 P0:** avoid raw precise geolocation, fingerprinting, secret tracking identifiers and personally identifying visitor analytics.
- **AN-05 P1:** per-card comparisons, top CTAs, team totals and CSV download.
- **AN-06 P0:** exclude owner previews and obvious bots where feasible; document limitations.

### 4.6 Organizations and teams

- **TEAM-01 P0/Beta:** create organization, unique slug, logo, description.
- **TEAM-02 P0/Beta:** owner/admin/manager/member roles and role matrix.
- **TEAM-03 P0/Beta:** invite via email, expiring single-use token, secure accept/decline.
- **TEAM-04 P0/Beta:** company-controlled card with separate `organization_id`; employee can edit only permitted fields.
- **TEAM-05 P1:** brand presets, color/font/CTA defaults and locked field policies.
- **TEAM-06 P1:** CSV invite and bulk card generation with safe validation/report.
- **TEAM-07 P0/Beta:** offboarding deactivates access and company card; personal cards remain personal.
- **TEAM-08 P1:** team analytics with permissioned aggregation.
- **TEAM-09 P2:** SSO, SCIM, departmental admins and external APIs.

### 4.7 Administrative capabilities

- **ADMIN-01 P0:** global user/card counts and abuse queue; verified platform admins only.
- **ADMIN-02 P0:** report cards for impersonation/spam; moderation case status.
- **ADMIN-03 P0:** audit administrative operations; support access needs explicit justification and time limits.
- **ADMIN-04 P0:** feature flags, maintenance mode and rate limits.
- **ADMIN-05 P1:** announcement banner, staged rollout and support knowledge base.

---

## 5. Design system — modern, premium and mobile-first

Visual identity follows `brand-guidelines.md` (Mevoriq Charcoal Navy, Connection Mint, Digital Indigo; Manrope + Inter). The values below are copied from it for convenience; if they ever disagree, the brand guidelines win.

**Personality:** modern SaaS product with editorial typography, soft depth, clean gradients, precise spacing and restrained micro-interactions. Avoid generic overdone glassmorphism and intrusive animations. Design should feel credible enough for lawyers and executives and customizable enough for creators.

### Visual tokens

| Token | Light | Dark |
|---|---|---|
| Canvas | `#F6F8FB` | `#0B1422` |
| Surface | `#FFFFFF` | `#152235` |
| Main text | `#172338` | `#F7FAFC` |
| Secondary text | `#5B6B80` | `#B2C0D2` |
| Brand / primary | Charcoal Navy `#0F1B2D` | `#F7FAFC` |
| Accent | Digital Indigo `#5265E8` | `#8B9BFF` |
| Signature highlight | Connection Mint `#34D399` (never as text on light) | `#34D399` |
| Mint text | Mint Ink `#047857` | `#34D399` |
| Success | `#15803D` | `#4ADE80` |
| Warning | `#B45309` | `#FBBF24` |
| Danger | `#B91C1C` | `#F87171` |
| Border | `#E2E8F0` | `#293A51` |

- **Font:** Manrope for headings/marketing display, Inter for UI, both variable via `next/font`, with a system fallback stack. Profiles can select from a small curated library; support Unicode for Tamil/Sinhala/Arabic scripts through appropriate fallbacks.
- **Spacing:** 4px baseline; card spacing steps 8/12/16/24/32.
- **Corners:** controls 12px, surfaces 16–24px, main card hero 24px.
- **Motion:** 150–250ms ease; honor `prefers-reduced-motion`.
- **Icons:** Lucide, consistent stroke weight.
- **Imagery:** high-quality user-provided photo and optional cover image; image aspect ratio and focal-point editing.
- **Accessibility:** WCAG 2.2 AA aspirational acceptance target, 44px tap targets where practical, clear focus-visible states, contrast verification, semantic HTML, screen-reader-friendly QR alternatives.

### Mobile responsive contract

| Width | Layout decisions |
|---|---|
| 320–374px | Single column, compact padding, fluid typography; never horizontal overflow |
| 375–599px | Public cards optimized first; bottom action area, full-screen editor preview toggle |
| 600–767px | Tablet-like single column or compact 2-column card gallery |
| 768–1023px | Collapsible dashboard rail, content + preview as space allows |
| 1024–1439px | Sidebar + main content; split editor and live preview |
| 1440px+ | Centered max-width dashboard, proportional panels, no oversized text |

**Public profile top section:** cover / company brand > photo > full name + role > concise bio > prominent **Save Contact** button > secondary Contact Exchange > social and custom actions > portfolio/links > optional footer. At small widths, important action(s) remain reachable without obscuring content.

### UI screens and routing

| Route | Screen | Key elements | Status |
|---|---|---|---|
| `/` | Marketing homepage | Hero, animated but lightweight live demo, sample cards, FAQ, create CTA | P0 |
| `/templates` | Gallery | Category tabs, live theme previews | P0 |
| `/features` | Features | Sharing, meeting mode, teams, privacy | P0 |
| `/pricing` | Launch pricing | Free-now message, honest future policy | P0 |
| `/login`, `/signup`, `/forgot-password` | Auth | Accessible forms and OAuth | P0 |
| `/onboarding` | First card wizard | Identity > details > design > publish | P0 |
| `/app` | Home dashboard | Published cards, QR action, stats, activity | P0 |
| `/app/cards` | Card library | Context tags, grid/list, duplicate/create | P0 |
| `/app/cards/new` | New card | Purpose and template choice | P0 |
| `/app/cards/[id]/edit` | Designer | Form panels, draggable reorder where accessible, preview | P0 |
| `/app/cards/[id]/share` | Share center | QR, copy URL, vCard, meeting mode | P0 |
| `/app/connections` | Contact inbox | Leads, basic filters, export | P0 |
| `/app/analytics` | Insights | Views, saves, clicks, date filters | P0 |
| `/app/settings` | Settings | Profile, auth, privacy, export/delete | P0 |
| `/app/team` | Team dashboard | Team cards and membership | Beta |
| `/app/team/brand` | Team design | Locked brand settings and templates | P1 |
| `/app/team/members` | People | Invite, deactivate, assigned cards | Beta |
| `/u/[slug]` | Published card | Mobile-first profile | P0 |
| `/u/[slug]/meeting` | Meeting mode | Full-screen scannable QR | P0 |
| `/admin` | Private console | Reports, support, feature flags | P0 |

**Editor UX:** auto-save drafts with visible save state and debounce; keyboard-operable reorder alternative; split desktop live preview; mobile full-screen preview toggle; confirmation before publishing/unpublishing; keep stable changes when network drops and surface conflicts rather than overwriting silently.

**Five initial design themes:** Minimal White, Midnight Executive, Editorial Studio, Aurora Gradient, Modern Corporate. Design via reusable block components and theme JSON rather than HTML templates per design.

---

## 6. Domain architecture / permissions

### Identity ownership model

- Every user has one personal account and may own multiple personal cards.
- `organization_id = null` indicates a personal card; non-null indicates an organization-managed card.
- An individual may be a member of multiple organizations.
- Organization owner/admin manage company cards and employees; individual members edit permitted profile fields.
- Personal card information is never automatically copied into a company card without explicit action.
- A departed employee must lose access to the company card without losing access to personal cards.
- Public visitors only read published, public-safe fields from a dedicated server projection.

### Roles matrix

| Action | Visitor | Individual | Team Member | Team Admin | Platform Admin |
|---|---:|---:|---:|---:|---:|
| View published card | Yes | Yes | Yes | Yes | Yes |
| Exchange contact | Yes | Yes | Yes | Yes | Yes |
| Edit owned personal card | No | Yes | Yes | Yes | Only with justified support process |
| Edit assigned company card | No | No | Allowed fields | Yes | Only with justified support process |
| Invite team members | No | No | No | Yes | No by default |
| Set org brand | No | No | No | Yes | No by default |
| View private leads | No | Own cards | Assigned cards | Org-scoped when enabled | No by default |
| View platform abuse queue | No | No | No | No | Yes |

---

## 7. Technology and infrastructure

### Stack (lock for MVP)

- **Frontend/API:** Next.js App Router + TypeScript, React Server Components for read-heavy public content, Server Actions only for suitable authenticated mutations, Route Handlers for downloads/webhooks.
- **UI:** Tailwind CSS + shadcn/ui + Radix primitives + Lucide icons; Framer Motion/Motion only sparingly.
- **Authentication:** Supabase Auth with email and Google sign-in, cookie-based SSR and PKCE according to current Supabase guide.
- **Database:** Supabase PostgreSQL, managed migrations, indexed ownership columns, RLS on all exposed tables.
- **Storage:** Supabase Storage; public optimized card photos/logos in appropriately managed public buckets; private files in private buckets using authorized signed access.
- **Hosting:** Vercel, preview/staging/production environments, CDN and revalidation.
- **Forms:** React Hook Form + Zod; server-side validation always.
- **QR:** a reliable maintained QR library, SVG output as preferred; optional PNG conversion.
- **vCard:** server-generated standards-compatible vCard with defensive escaping.
- **Charts:** lightweight Recharts or equivalent for authenticated dashboard only.
- **Transactional mail:** Resend or equivalent provider with domain authentication.
- **Analytics/errors:** privacy-conscious first-party event aggregation + Sentry or equivalent for error monitoring, with PII scrubbing.
- **Testing:** Vitest + React Testing Library + Playwright + Supabase pgTAP/RLS tests.
- **Internationalization:** next-intl or equivalent, locale dictionaries, initial English UI; plan Spanish, French, Tamil and Sinhala based on demand.
- **Background tasks:** database scheduled jobs/approved queues where necessary; no synchronous bulk work in page requests.
- **Billing:** Not deployed at launch. Add independent subscription provider adapter when monetization is validated.

**Official technical references:**
- Supabase Next.js quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase SSR Auth: https://supabase.com/docs/guides/auth/server-side
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage CDN: https://supabase.com/docs/guides/storage/cdn/smart-cdn

### Performance and egress strategy

1. Optimize/compress uploaded photos on ingestion and limit dimensions and file size; verify file signature, not extension only.
2. Cache immutable optimized image variants with long TTL and content-hashed filenames; never regenerate signed public image URLs per page request.
3. Statically render or cache public profile responses where possible; revalidate on publish/edit, but ensure unpublished cards are removed rapidly.
4. Avoid per-view database writes; queue/batch analytics aggregation with rate limits and bot filtering.
5. Lazy-load below-fold media and dashboard charts; keep public pages low JavaScript.
6. Use image budget targets (e.g., typical profile < 500KB total transferred on repeat navigation, test and revise).
7. Monitor Supabase storage egress, database bandwidth and Vercel function usage with alerts.
8. Set up project cost budgets, storage quotas and anti-abuse throttling from day one.
9. Avoid excessive Realtime subscriptions for dashboards; use refresh/polling for non-critical analytics.
10. Paginate contact lists and team rosters; never load all records on initial render.

---

## 8. Database schema blueprint

Every table has `id uuid` primary key unless composite noted, `created_at timestamptz` and where mutable `updated_at timestamptz`. All timestamps are UTC.

| Table | Critical fields / constraints |
|---|---|
| `profiles` | `id` FK auth.users, `display_name`, `locale`, `status` |
| `organizations` | `id`, `name`, `slug unique`, `owner_id`, `status` |
| `organization_members` | `organization_id`, `user_id`, `role`, `status`, unique organization+user |
| `organization_invitations` | `organization_id`, `email`, `role`, `token_hash`, `expires_at`, `accepted_at` |
| `cards` | `id`, `owner_user_id`, `organization_id nullable`, `slug unique`, `name`, `headline`, `bio`, `status`, `theme_id`, `published_at`, `version` |
| `card_contacts` | `card_id`, `email`, `phone_e164`, `whatsapp_e164`, `website`, `company`, `location_text`, `visibility_settings` |
| `card_links` | `id`, `card_id`, `kind`, `label`, `url`, `position`, `is_visible` |
| `card_media` | `id`, `card_id`, `asset_type`, `storage_key`, `alt_text`, `is_public` |
| `card_themes` | `id`, `card_id`, `template_key`, `tokens_jsonb`, `blocks_jsonb` |
| `card_slug_history` | `old_slug unique`, `card_id`, `redirect_status` for stable legacy share links |
| `lead_exchanges` | `id`, `card_id`, `name`, `email`, `phone`, `company`, `message`, `consent_version`, `consent_at`, `status` |
| `lead_notes` | `id`, `lead_id`, `owner_user_id`, `note`, `followup_at` |
| `card_event_daily` | `card_id`, `event_date`, `event_type`, `count`, unique combined key |
| `team_brand_profiles` | `organization_id`, `brand_name`, `logo_key`, `tokens_jsonb`, `locked_fields_jsonb` |
| `abuse_reports` | `id`, `card_id`, `reason`, `reporter_email nullable`, `state` |
| `audit_logs` | `actor_id`, `organization_id nullable`, `entity_type`, `entity_id`, `action`, `metadata_redacted` |
| `feature_flags` | `key unique`, `enabled`, `rollout_config` |
| `plan_entitlements` | `plan_key`, `feature_key`, `value_jsonb` (future-ready) |
| `subscriptions` | `billing_account_id`, `provider`, `provider_subscription_id`, `state` (not needed until monetization) |
| `webhook_events` | `provider`, `provider_event_id unique`, `processed_at`, `result` (future) |

### Constraints and data handling

- Require card owner; ensure `organization_id` cross-references actual membership and authority through transactional application logic/RLS.
- Unique public slug; reserve `admin`, `app`, `login`, `pricing`, `api`, `u` and offensive/impersonating handles.
- Strict visibility whitelist; never expose private leads/contact-exchange data through public card reads.
- Index `cards(owner_user_id,status)`, `cards(organization_id,status)`, `organization_members(user_id)`, `lead_exchanges(card_id,created_at)` and analytics lookups.
- `updated_at` trigger and optimistic concurrency (`version`) for editors.
- Store consent text version and timestamp; implement deletion/export and configurable retention rules.
- Audit logs must redact secrets and lead message contents.
- Never put a Supabase secret/service role key into browser bundles.

### Public-card read strategy

Serve only published cards via a server-side function/view/validated handler that constructs a whitelisted DTO. A public URL should resolve by slug, verify published/active state, select visible fields, and render SEO metadata based on opt-in indexing preferences. Unpublished cards return 404 or 410 and are purged/revalidated from cache.

### Example public DTO

```json
{
  "slug": "alex-morgan",
  "name": "Alex Morgan",
  "headline": "Creative Director",
  "company": "Northstar Studio",
  "bio": "Building memorable brands.",
  "theme": "midnight-executive",
  "contacts": {
    "email": "alex@example.com",
    "phone": "+14155550100",
    "website": "https://example.com"
  },
  "links": [
    {"kind": "portfolio", "label": "My work", "url": "https://example.com/work"}
  ]
}
```

---

## 9. API / server contracts

Use `app/api/v1/...` route handlers for public resources, file downloads, lead submissions and special system operations; use typed server functions or Supabase CRUD behind authenticated boundaries for ordinary mutations. Do not duplicate a generic CRUD API unless a concrete integration needs it.

| Method | Path | Auth | Behaviour |
|---|---|---|---|
| `GET` | `/api/v1/public/cards/[slug]` | No | Whitelisted published-card data only |
| `GET` | `/api/v1/public/cards/[slug]/vcard` | No | Contact file; proper vCard MIME/download headers |
| `GET` | `/api/v1/public/cards/[slug]/qr` | No | SVG/PNG QR with validated canonical URL |
| `POST` | `/api/v1/public/cards/[slug]/exchange` | No | Rate-limited form + consent |
| `GET` | `/api/v1/cards` | Yes | Own/authorized cards |
| `POST` | `/api/v1/cards` | Yes | Draft with ownership derived from session |
| `PATCH` | `/api/v1/cards/[id]` | Yes | Validated authorized update and version conflict |
| `POST` | `/api/v1/cards/[id]/publish` | Yes | Complete validation; cache revalidation |
| `POST` | `/api/v1/cards/[id]/unpublish` | Yes | Revoke public view and cache revalidation |
| `POST` | `/api/v1/organizations` | Yes | Create organization with owner |
| `POST` | `/api/v1/organizations/[id]/invite` | Admin | Invite member |
| `GET` | `/api/v1/analytics/cards/[id]` | Owner/admin | Aggregated daily counts |
| `GET` | `/api/v1/exports/leads` | Owner/admin | Safe CSV export |
| `POST` | `/api/v1/reports` | No | Rate-limited report card |

**API conventions:** JSON for data, `application/octet-stream` or standard content type for files, structured validation errors, 401/403/404/409/422/429, pagination cursors, per-route rate limits and request IDs. Never rely on client-provided user ownership. Protect mutation actions against CSRF via robust origin/session controls.

---

## 10. Free-first business model and future pricing

### Launch policy

**At launch: all publicly released features are free.** This includes cards, templates, QR, vCards, contact exchange, basic analytics and pilot team management. No payment details and no countdown trial. Publish reasonable usage/fair-use limits for automated traffic, storage, email sends, anti-spam and large team allocations; these are capacity safeguards, not hidden upgrade prompts.

**Recommended public wording:** “Free during our early-access phase. We'll always keep a useful free card available. Optional paid tools may be introduced later; we'll announce what changes in advance.” Avoid promises such as “every feature free forever” if future plans are contemplated.

### Founding user promise

- Published free cards and their canonical URLs stay usable under the published free baseline.
- No retroactive charges without explicit opt-in.
- Users keep export/delete controls and have advance notice before any changes to quotas or entitlements.
- Choose a clearly defined founding cohort policy (e.g., early adopters retain core individual features); publish it before invite campaign rather than improvising later.
- Downgrade must not silently delete contacts/cards. Keep storage/retention rules clear and legally reviewed.

### Future optional tiers (hypotheses; validate with customers)

| Package | Indicative future price | Value, NOT basic QR sharing |
|---|---|---|
| **Free Core** | $0 — always-available free baseline (do not market as "free forever") | 1–3 active cards, QR, vCard, essential templates, sharing and basic profile management |
| **Creator Pro** | $3–5/mo | Expanded brand customization, multiple active variants, deep analytics, project/gallery blocks, extra exports |
| **Teams** | $2–4/user/mo | Managed company cards, centralized branding, onboarding/offboarding, team insights, company support |
| **Enterprise** | Quote | SSO/SCIM, audit exports, procurement, SLA, organization controls and integrations |

These prices are **not launch prices**, and no account should be auto-migrated to paid. First run willingness-to-pay interviews and measure regular active sharing, retained teams, visitor conversions and cloud cost per card.

### Monetization gates

Do **not** add billing until at least: (a) 1,000 verified registered users, (b) a cohort of consistently active card sharers, (c) 5+ organizations actively administering their cards, (d) qualitative validation that future paid organizational features solve recurring work, and (e) measured unit economics and support burden. Targets are hypotheses, not forecasts.

### Global payments note

Legal seller country affects payment gateway eligibility. Verify supported merchant countries, compliance and tax model before selecting Stripe, Paddle, Lemon Squeezy or another merchant of record. Do not build billing into launch critical path.

---

## 11. SEO, acquisition and growth

**SEO goals:** rank for free digital business card, digital business card maker, digital business card with QR, professional QR contact card, electronic business card, free digital visiting card, digital business cards for teams, digital card for freelancers.

### Suggested landing pages

- `/digital-business-card`
- `/free-digital-business-card`
- `/qr-code-business-card`
- `/digital-business-card-maker`
- `/digital-business-card-for-teams`
- `/digital-business-card-for-freelancers`
- `/business-card-templates` (301 redirect to the canonical `/templates` gallery, or an SEO intro page that links to it; never a duplicate gallery)
- `/compare/blinq-alternative` (only with maintained honest comparisons)
- `/compare/hihello-alternative` (same requirement)

**Implementation:** App Router metadata, canonical URLs, robots controls, XML sitemaps, FAQ structured data where eligible, organization data, strong performance, multilingual hreflang when localized, proper Open Graph previews for public cards. Default newly published personal profiles to **noindex until explicit choice**, given the sensitivity of contact details; indexed pages require clear opt-in. Prevent thin doorway pages and spam profiles from polluting search.

**Growth loops:** beautiful cards with small optional platform attribution; template gallery social demos; public card > visitor discovers creator; QR-based conference introductions; invite-a-colleague; agency partners and startup communities. Instrument attribution without invasive tracking.

---

## 12. Security, privacy, trust and abuse

- Supabase RLS + grants + test SQL for every exposed table, including negative cross-tenant tests.
- Password/OAuth sessions secured through current Supabase SSR patterns; cookie flags and session renewal tested.
- Signed invitation tokens stored hashed, expiring and single use.
- File upload scan/signature/type checks, restricted size and content policies; block executable content and dangerous URL schemes.
- Limit public profile fetch patterns, contact exchange and QR generation to prevent bot abuse.
- Protect against fake profiles/impersonation with reporting, takedown policy and transparent moderation.
- Data minimization: collect only fields necessary for cards, leads and service operations.
- Separate explicit consent for submitting a contact to card owner and subscribing to any marketing messages.
- Provide privacy policies, access/export, deletion, secure storage and documented retention; implement region-specific requirements with counsel before launch.
- Avoid precise geographic analytics or non-consensual tracking. Count views carefully and disclose measurement caveats.
- Audit security-sensitive actions; secrets stored in environment controls; periodic dependency/security scans.
- Backups, restore drill, incident response runbook, uptime/error alerts and account recovery.
- A customer's deletion must also apply to relevant storage objects, leads and cached public data subject to retention requirements.
- Production CSP, security headers, anti-clickjacking, safe external `rel` values and link validation.

---

## 13. Quality and acceptance criteria

| ID | Acceptance test |
|---|---|
| AC-01 | New verified user can publish a minimal card in <=3 minutes during usability testing (target, not guarantee) |
| AC-02 | Anonymous recipient can open card, save vCard and use contact links without registering |
| AC-03 | QR can be scanned across current iOS/Android camera apps and points to HTTPS canonical URL |
| AC-04 | Updating a published card does not change permanent QR destination |
| AC-05 | Published card displays 320px–1920px without horizontal scrolling or clipped CTAs |
| AC-06 | Draft/unpublished/deactivated card does not reveal private contents or appear in SEO |
| AC-07 | Visitor's contact exchange is only retrievable by authorized owner/team role |
| AC-08 | RLS test suite proves users cannot read/update another tenant's non-public data |
| AC-09 | Team member can edit allowed fields but cannot override company-locked branding |
| AC-10 | Employee offboarding revokes company-card access but leaves private personal cards intact |
| AC-11 | Export and deletion flows are end-to-end tested; data behavior matches published policies |
| AC-12 | Rate limiting prevents practical form spam and abusive repeated QR/image requests |
| AC-13 | Public card page target Core Web Vitals: LCP <=2.5s, CLS <=0.1, INP <=200ms at p75 where measured |
| AC-14 | Keyboard navigation, visible focus and reduced-motion behavior pass accessibility audit |
| AC-15 | Image upload failure, session expiry, offline interruption and editor conflicts have clear recoverable states |
| AC-16 | Basic daily analytics reconciles with sampled event logs, without leaking visitor identity |
| AC-17 | Card SEO, sitemap/noindex settings and metadata are verified for opted-in profiles |
| AC-18 | Free pricing statement matches actual shipped entitlement configuration |

**Automated test stack:** typecheck + lint + unit tests on pull request; Playwright user journeys on preview; Supabase RLS tests against isolated test database; Lighthouse CI on public card sample; dependency/container scanning on release.

---

## 14. Delivery timeline and sprint plan

Assume 2 full-stack developers, 1 part-time UI/UX designer and 1 part-time QA/product owner. Illustrative time only: **10–14 weeks for a quality public beta**, depending on team capabilities and design iteration.

| Sprint | Weeks | Deliverables | Exit gate |
|---|---:|---|---|
| 0 — Validate & foundation | 1–2 | 12–20 interviews, Figma screens, naming, Next.js setup, Supabase migrations, auth and CI | Approved PRD + functioning staging |
| 1 — Profiles | 3–4 | Profile, card schema, creation wizard, public profiles, first templates | Personal card publishes |
| 2 — Sharing | 5–6 | QR, vCard, meeting mode, link controls, preview, image pipeline | Visitor can save and share |
| 3 — Connections | 7–8 | Lead exchange, privacy, analytics, CSV export, abuse/rate limiting | End-to-end contact exchange works |
| 4 — Team beta | 9–10 | Organization onboarding, invites, company cards, branding and offboarding | 3 test teams manage cards safely |
| 5 — Polish & launch | 11–12 | SEO, docs, onboarding refinement, accessibility, monitoring, security review, launch | All P0 acceptance tests green |
| Buffer & user testing | 13–14 | Fix usability defects, performance regressions and real beta issues | Public beta sign-off |

### Prioritized engineering tickets

| Ticket | Description | Priority | Dependencies |
|---|---|---|---|
| DB-001 | Initialize Next.js App Router TypeScript Tailwind | P0 | None |
| DB-002 | Provision Supabase Auth, migrations, RLS testing harness | P0 | DB-001 |
| DB-003 | Email/Google login, onboarding, dashboard shell | P0 | DB-002 |
| DB-004 | Card tables + typed validation + ownership policies | P0 | DB-002 |
| DB-005 | Create/edit/publish/unpublish + slug locking/history | P0 | DB-003/004 |
| DB-006 | Reusable public-card renderer and 5 themes | P0 | DB-005 |
| DB-007 | QR SVG/PNG + vCard v3 downloads | P0 | DB-006 |
| DB-008 | Mobile card editor + live preview + autosave | P0 | DB-005/006 |
| DB-009 | Contact exchange API and spam protections | P0 | DB-006 |
| DB-010 | Owner lead inbox + CSV export + deletions | P0 | DB-009 |
| DB-011 | Aggregate analytics and dashboard | P0 | DB-006/007/009 |
| DB-012 | Organization and memberships + RLS tests | P0/Beta | DB-002/004 |
| DB-013 | Company card permissions + onboarding/offboarding | P0/Beta | DB-012 |
| DB-014 | Privacy/export/delete/report abuse | P0 | DB-002/004/009 |
| DB-015 | SEO, marketing pages, docs, template gallery | P0 | DB-006 |
| DB-016 | E2E flows, browser matrix, accessibility and launch gates | P0 | DB-003–015 |
| DB-017 | Advanced lead follow-up status and team reports | P1 | Beta feedback |
| DB-018 | Billing abstraction and optional paid tiers | Future | Monetization validation |

### Definition of Done for every ticket

1. TypeScript strict typecheck/lint passes; no client-secret leakage.
2. Server-side validation and authorization implemented for every mutation.
3. Relevant RLS allow/deny tests added where DB permissions change.
4. Keyboard/mobile/accessibility behavior considered.
5. Error/loading/empty states included.
6. Unit/integration/e2e coverage appropriate to risk.
7. Relevant docs, changelog, analytics events and rollback notes updated.
8. Reviewed and deployed to staging before production.

---

## 15. Repository layout

```text
mevoriq/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── features/page.tsx
│   │   ├── pricing/page.tsx
│   │   └── templates/page.tsx
│   ├── (auth)/login/page.tsx
│   ├── (auth)/signup/page.tsx
│   ├── (app)/app/
│   │   ├── page.tsx
│   │   ├── cards/page.tsx
│   │   ├── cards/[id]/edit/page.tsx
│   │   ├── cards/[id]/share/page.tsx
│   │   ├── connections/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── team/page.tsx
│   │   └── settings/page.tsx
│   ├── u/[slug]/page.tsx
│   ├── u/[slug]/meeting/page.tsx
│   └── api/v1/
├── components/
│   ├── brand/          # Logo, LogoSymbol — only place that references logo files
│   ├── ui/
│   ├── cards/
│   ├── card-editor/
│   ├── themes/
│   ├── dashboard/
│   └── forms/
├── features/
│   ├── cards/
│   ├── contacts/
│   ├── organizations/
│   ├── analytics/
│   └── identity/
├── lib/
│   ├── brand/config.ts  # brand name, tagline, logo paths
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── authorization/
│   ├── validations/
│   ├── events/
│   ├── qr/
│   └── vcard/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── tests/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
│   ├── brand/          # logo + icon files (swap here when the logo changes)
│   └── assets/
├── docs/
│   ├── product-plan.md
│   ├── brand-guidelines.md
│   ├── sub-brand-guidelines.md
│   ├── decisions.md
│   ├── design-system.md
│   ├── api.md
│   ├── data-model.md
│   └── security.md
└── README.md
```

### Example environment variables (names only)

```dotenv
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
RESEND_API_KEY=
MAIL_FROM=
SENTRY_DSN=
```

Keep environment secrets out of Git, browser payloads and error logs. Use separate staging and production projects.

---

## 16. Release metrics and product learning

### North star

**Weekly meaningful connections per active published card**, where a meaningful connection is a verified Save Contact action or voluntarily submitted contact exchange. Clearly label estimates; don't pretend a download guarantees the address book was saved.

### Supporting metrics

- Signup-to-first-published-card completion; median time to publish.
- Weekly cards actively shared, QR views and unique sessions (approximate).
- Contact-download intent, exchange-form conversion, link-click rates.
- 7/30/90-day retention and returning card editors.
- Organizations with >=3 active cards, team member activation and churn.
- Cost per 1,000 public-card views, image egress per active card, email spend, support time.
- Privacy requests, account abuse reports and incident resolution times.

### Experiment backlog

1. Landing hero: “Digital business card free” versus “Your professional identity in one link.”
2. Onboarding: 4-step wizard versus a single screen.
3. Share CTA: “Save Contact” versus “Add to Contacts.”
4. Lead exchange: short form versus progressive form.
5. Template selection: before profile entry versus after essentials.
6. Meeting Mode: QR-first versus QR + prompt.
7. Free user referral invitation after first share versus after first exchanged lead.

---

## 17. Immediate execution checklist (first 14 days)

### Days 1–2: confirm product + brand

- [ ] Pick working brand and check trademark/domain conflicts.
- [ ] Record primary segments and agree on five hero features.
- [ ] Finalize “free-now, fair-use, paid-later” public promise.
- [ ] Set up project board, repos, staging/prod rules and ownership.

### Days 3–4: Figma UI system

- [ ] Create responsive wireframes: landing, onboarding, editor, public card, share, connections, analytics and team admin.
- [ ] Approve design tokens, 5 public themes and mobile interaction patterns.
- [ ] Run a quick usability check on 3–5 representative users.

### Days 5–7: technical foundation

- [ ] Scaffold Next.js App Router + Tailwind + shadcn/ui.
- [ ] Create Supabase staging project, SQL migrations and RLS tests.
- [ ] Configure Google OAuth, email, redirect allowlist and transactional domain.
- [ ] Create card DTO, Zod schemas and authorization helpers.
- [ ] Implement public page skeleton and dummy preview data.

### Days 8–10: first vertical slice

- [ ] Build profile onboarding and minimal card save/edit.
- [ ] Implement draft/publish and canonical public slug.
- [ ] Render one complete responsive template.
- [ ] Generate functioning QR SVG and vCard output.

### Days 11–14: validation milestone

- [ ] Test first complete card flow on real Android and iPhone devices.
- [ ] Verify cross-user access denial and mobile layout.
- [ ] Show prototype to 10 potential users and 3 small companies.
- [ ] Prioritize issues and approve next sprint.

### Launch go/no-go

Do not publish publicly until authentication, ownership/tenancy security, contact exchange consent, basic abuse controls, vCard validity, editor reliability, device compatibility, uptime alerts and backup recovery are tested.

---

## 18. Instructions to the development agent

> Implement this document as the **source of truth** for a modern, fast, free-first global digital business card SaaS. Use Next.js App Router, strict TypeScript, Tailwind/shadcn, Supabase Auth/Postgres/Storage and secure RLS policies. Prioritize mobile-first card rendering, premium design and three-minute onboarding. Start with Sprint 0 and Sprint 1; do not scaffold billing or NFC features. Create migrations and automated cross-tenant authorization tests before implementing team features. Prefer small, reviewable commits; maintain production-safe env management, error states, analytics privacy and code documentation. On any ambiguity, choose secure defaults, limit scope and document decisions. Do not claim functionality is complete without passing the acceptance criteria.

### First command-level milestone

1. Initialize Next.js TypeScript project and base design system.
2. Commit Supabase schema migrations and authentication SSR integration.
3. Implement `/onboarding`, `/app/cards`, and `/u/[slug]` vertical slice.
4. Add QR and vCard functionality.
5. Validate on mobile and execute RLS/e2e tests.
6. Prepare a reviewed staging deployment.

---

## 19. Open decisions to settle before the paid launch

1. Mevoriq trademark and domain clearance (name chosen; clearance pending).
2. Which features founding users retain after optional paid tiers launch; publish specifics early.
3. Organization team size fair-use ceiling and storage/analytics quotas.
4. Exact personal profile indexability default and consent language.
5. Supported marketing languages and launch locales.
6. Legal seller entity, payment provider eligibility and taxation model.
7. Whether team admins can see individual employee leads by default (recommended: no, unless explicitly enabled with clear notice).
8. Data retention intervals for abandoned accounts, analytics and leads.
9. Email notification volumes and transactional deliverability safeguards.
10. Customer support and abuse moderation staffing for a global launch.

**Summary:** Build the card-sharing fundamentals extremely well, add context cards and meeting mode as distinctive experiences, give early users honest free access, and reserve future monetization for recurring professional/team value—not basic visibility or contact saving.
