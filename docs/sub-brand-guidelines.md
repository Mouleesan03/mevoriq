# Mevoriq Product Family — Sub-brand Guidelines

Version 1.1 · Nov 1, 2026 · extends `brand-guidelines.md` v1.1

## Overview

Mevoriq grows as one master brand with four endorsed product lines, led by **Mevoriq Meet**. This document extends the Mevoriq Brand Guidelines v1.0; anything not covered here follows that document.

Every new product is named "Mevoriq + plain English word". This keeps trademark clearance to one name, and every launch builds equity in the parent brand instead of splitting it.

| Product | What it does | Lead color | Tagline | Audience |
| --- | --- | --- | --- | --- |
| **Mevoriq** (master) | Digital business card and professional profile | Charcoal Navy + Connection Mint | Your identity. Every connection. | Everyone |
| **Mevoriq Meet** | Event and in-person contact exchange | Digital Indigo | Meet. Share. Connect. | Event attendees, communities |
| **Mevoriq Teams** | Company-managed, brand-consistent cards | Charcoal Navy | One company brand, every employee. | Organizations, HR, marketing |
| **Mevoriq Follow-up** | Reminders and organized new connections | Charcoal Navy on Cloud, Mint highlight | Make every connection count. | Freelancers, consultants, sales |
| **Mevoriq Global** | One card in multiple languages | Navy + Mint | Introduce yourself in every language. | International professionals |

All four extend existing roadmap items in section 8 of the master guidelines. None introduces NFC, a social feed, résumé generation or full CRM, which the master brand excludes.

## Shared sub-brand system

All sub-brands share one logo, one palette and one type system; they differ only in which existing color leads and how the mint connection line is drawn.

### Naming

- Format: **Mevoriq** + one plain English descriptor, title case (Mevoriq Meet, not MevoriqMeet or Mevoriq-Meet).
- Never invent a second coined name; never abbreviate to "M Meet" in public copy.
- In running text, use the full name on first mention, then the descriptor alone is acceptable inside the product ("Start a Meet session").

### Logo lockup

- Standard horizontal lockup (linked M symbol + Mevoriq wordmark), followed by a thin vertical divider and the descriptor.
- Descriptor: Inter SemiBold, cap height matched to the wordmark's x-height, color Muted Slate `#5B6B80` on light, `#B2C0D2` on dark.
- Divider: 1px, Soft Border `#E2E8F0`, height equal to the symbol; gap on each side equals the width of the wordmark's lowercase `e`.
- The symbol itself never changes per product. App icons use the standard navy rounded-square symbol with a small product badge in the lower right.
- Required exports per product: `mevoriq-<product>-horizontal.svg`, `-horizontal-dark.svg`, `-horizontal-monochrome.svg`, and `mevoriq-<product>-badge.svg`.

### Color leads

No new hex values are added. Each product reweights the master palette.

| Product | Lead (≈30%) | Highlight (≈10%) | Support (≈5%) | Primary CTA |
| --- | --- | --- | --- | --- |
| Meet | Digital Indigo `#5265E8` | Connection Mint `#34D399` | Charcoal Navy `#0F1B2D` | Indigo, white text |
| Teams | Charcoal Navy `#0F1B2D` | Connection Mint `#34D399` | Digital Indigo `#5265E8` | Navy, white text |
| Follow-up | Charcoal Navy `#0F1B2D` (on Cloud `#F6F8FB` surfaces) | Connection Mint `#34D399` | Digital Indigo `#5265E8` | Navy, white text |
| Global | Charcoal Navy `#0F1B2D` | Connection Mint `#34D399` | Digital Indigo `#5265E8` | Navy, white text |

The remaining ≈55% stays white or Cloud in every product. Mint is never used for white-on-mint text; check WCAG AA for every real pairing.

### Product tokens (CSS)

See `app/globals.css` (`[data-product="…"]` selectors).

### Signature motif

The mint connection line from the master brand is adapted once per product, so each is recognizable without a new symbol.

| Product | Motif | Where it appears |
| --- | --- | --- |
| Meet | Pulse rings radiating from a QR code | Hero, scan screen, event posters |
| Teams | Grid of identical card outlines, one filled mint | Team pages, admin dashboard empty states |
| Follow-up | Line drawn from a card to a check mark, as a timeline | Inbox, reminder emails |
| Global | Line linking the same card shown in three scripts | Language settings, campaign visuals |

### Typography, icons and motion

Unchanged from the master guidelines: Manrope for headings, Inter for UI, Noto Sans subsets for non-Latin scripts, Lucide icons at 1.75–2px stroke, 150–250ms transitions respecting `prefers-reduced-motion`. Motifs animate once on entry and then stay still.

### Claims rule

A sub-brand name, page or campaign goes public only when its core feature is built and tested, per section 8 of `brand-guidelines.md` and the acceptance criteria in `product-plan.md` §13. Before that, use "coming soon" pages without dates.

## Mevoriq Meet (lead product)

Mevoriq Meet launches first because event networking shows a Mevoriq card to a new person at every exchange, which suits a free-first growth model.

### Positioning

For people at conferences, meetups and community events, Mevoriq Meet turns every QR scan into a saved contact tagged with where and when you met, so you leave with names you remember instead of a pocket of paper cards.

**Tagline:** Meet. Share. Connect.

**Supporting lines:**

- Leave the event with names, not paper.
- Remember where you met, not just who.
- One scan. Both of you connected.

### Core experience to brand

1. **Start a session:** the user names the event ("DevFest Colombo 2026") and their card enters meeting mode with a large QR.
2. **Scan and save:** the other person scans, saves the vCard, and can optionally share their details back.
3. **Tagged contacts:** every exchange is stored with the event name and date.
4. **After the event:** a summary screen lists everyone met at that event.

Only items 1–2 exist in the current roadmap ("mobile meeting mode"); 3–4 must be built before they are advertised.

### Visual identity

- **Lockup:** Mevoriq symbol + wordmark | Meet.
- **Lead color:** Digital Indigo `#5265E8` for the hero, session screen and CTAs; mint for the pulse rings; navy for text.
- **Motif:** two to three concentric mint pulse rings around the QR, 2px stroke at 40%, 25% and 10% opacity. Animates outward once when a session starts, then rests.
- **Session screen:** full-bleed indigo background, white QR panel with 20px radius, name and event in white Manrope, high screen brightness hint. QR always sits on white for scan reliability.
- **App badge:** indigo circle with a white outline, a mint center dot and a mint pulse ring, lower-right of the standard app icon.
- **Photography:** real hallway moments at events: two people, a phone between them, natural light, multicultural. No stock handshakes or stage keynote shots.

### Voice

Energetic, social and quick, but never hype. Short verbs, present tense.

| Do | Don't |
| --- | --- |
| "Scan to save my details." | "Revolutionize your networking!" |
| "You met 12 people at DevFest." | "You crushed it — 12 leads captured!" |
| "Starting free." | "Free forever." |

### Launch campaign: "Names, not paper"

- **Hero line:** Leave the event with names, not paper.
- **Visual:** a scattered pile of paper business cards on the left; on the right, one phone showing a clean, tagged contact list.
- **Event kit:** printable A6 table tent and lanyard insert, indigo, each with the attendee's own QR and the line "Scan to save my details."
- **Social series:** (1) the problem: lost paper cards; (2) 10-second demo of a scan; (3) "Where did we meet?" tagged contacts; (4) organizer spotlight.
- **Partner angle:** offer local meetup and community organizers a co-branded event page, "Powered by Mevoriq Meet".

## Mevoriq Teams

Mevoriq Teams sells control and consistency to the person who manages a company's brand, so it is the most restrained product in the family.

**Positioning:** For organizations that want every employee to share an on-brand, up-to-date card, Mevoriq Teams lets admins set brand presets once and manage every card from one place.

**Tagline:** One company brand, every employee.

**Supporting lines:** Your brand, on every introduction. · Update once, everywhere. · When people move on, your card doesn't leave with them.

- **Lockup:** Mevoriq symbol + wordmark | Teams.
- **Visual:** navy-dominant pages, generous white space, a grid of identical card outlines with one filled in mint. Screens show the admin brand-preset panel and member table, only once built.
- **Photography:** real workplaces and teams of mixed roles and ages; no posed boardroom stock.
- **Voice:** calm, precise, admin-friendly. Talk about consistency, control, offboarding and time saved; avoid hype and any revenue promises.
- **Proof points to collect:** time to roll out cards for a team, number of cards updated with one preset change.

## Mevoriq Follow-up

Mevoriq Follow-up is positioned as a gentle memory aid for new connections, never as a CRM, to stay inside the master brand's scope.

**Positioning:** For freelancers and consultants who meet people but lose track afterward, Mevoriq Follow-up reminds you who you met and when to reach out, right where your card already lives.

**Tagline:** Make every connection count.

**Supporting lines:** A nudge, not a pipeline. · "You met Amara at DevFest 3 days ago." · Follow up while it's still fresh.

- **Lockup:** Mevoriq symbol + wordmark | Follow-up.
- **Visual:** light, calm Cloud surfaces; the mint line drawn from a card to a check mark as a simple timeline. Reminder emails use the same line as a top border.
- **Voice:** warm and low-pressure. Say "reach out" and "reconnect", not "close", "convert" or "leads" in consumer-facing copy.
- **Guardrail:** no deal stages, pipelines or forecasts in marketing visuals; if users need those, point to CRM export rather than building them.

## Mevoriq Global

Mevoriq Global shows inclusivity rather than claiming it: the same card, correctly typeset, in the viewer's language.

**Positioning:** For professionals who work across borders, Mevoriq Global lets one card present itself in several languages, so every introduction feels local.

**Tagline:** Introduce yourself in every language.

**Supporting lines:** One card. Every language. · Your name, written right. · Be understood on the first scan.

- **Lockup:** Mevoriq symbol + wordmark | Global.
- **Visual:** the same card shown side by side in three scripts (for example Latin, Sinhala and Japanese), linked by the mint connection line. Each script uses its proper Noto Sans subset; never fake a script with transliteration.
- **Copy:** source copy in simple global English, then professionally reviewed translations; no machine-translated campaign headlines.
- **Voice:** welcoming and respectful; avoid flag icons for languages and avoid cultural stereotypes in imagery.

## Launch sequence and checklist

Launch order follows build readiness, Meet first; each product goes public only when its feature passes testing.

1. **Mevoriq Meet:** builds on meeting mode and QR, the closest to existing scope.
2. **Mevoriq Teams:** needs organization settings, roles and brand presets.
3. **Mevoriq Global:** needs multilingual card content and font subsets.
4. **Mevoriq Follow-up:** needs contact exchange and reminders; most scope risk.

### Design deliverables

- [ ] Approve naming format and the four descriptors
- [ ] Build descriptor lockups (light, dark, mono) after the master logo is finalized
- [ ] Design four app badges and test at 24px
- [ ] Add product tokens to the Tailwind theme
- [ ] Design Meet session screen and pulse-ring motif
- [ ] Produce Meet event kit (A6 table tent, lanyard insert)
- [ ] Produce "Names, not paper" social set at 1080 × 1080 and 1080 × 1350
- [ ] Write voice do/don't tables for Teams, Follow-up and Global

### Before any public use

- [ ] Include descriptor names in the Mevoriq trademark search (for example "Mevoriq Meet")
- [ ] Check handles such as `@mevoriqmeet`; availability is unverified
- [ ] Confirm each advertised feature is built and tested

### Decisions to lock

| Decision | Recommendation | Status |
| --- | --- | --- |
| Brand architecture | Master brand + endorsed descriptors | Proposed |
| Lead new product | Mevoriq Meet | Proposed |
| Meet tagline | Meet. Share. Connect. | Proposed |
| Meet campaign | Names, not paper | Proposed |
| New colors | None; reweight master palette | Proposed |
