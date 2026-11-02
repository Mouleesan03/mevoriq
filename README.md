# Mevoriq

Digital business cards and professional profiles. **Your identity. Every connection.**

Source of truth: [`docs/product-plan.md`](docs/product-plan.md) (features, routes, data, API) and [`docs/brand-guidelines.md`](docs/brand-guidelines.md) (colors, type, logo, voice). Resolved conflicts: [`docs/decisions.md`](docs/decisions.md).

## Run it

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_APP_URL to the dev URL
npm run dev                  # http://localhost:3001 if port 3000 is busy
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Unit tests (vCard, validation, template contrast) |
| `npm run typecheck` / `npm run lint` | Static checks |

## Status

Everything below works end to end on a **local development store** (`.data/`, git-ignored) with **demo sign-in** (name + email, no password):

- **Marketing site**: home (card fan, pinned scroll story, FAQ), features, templates playground, pricing, teams, about, contact, privacy, terms, cookies, 404, sitemap and robots — with scroll-reveal motion
- Demo login with live card preview, 4-step onboarding
- **Cards**: dashboard, card library, editor with live phone preview, photo upload, slug history, five accessible templates, share page (QR SVG/PNG, vCard, Meeting Mode)
- **Public card** `/u/[slug]`: Save contact, contact rows, links, share-your-details form, report link; Meeting Mode `/u/[slug]/meeting`
- **Contacts** inbox with status, tags, notes, follow-up dates, CSV export
- **Insights**: privacy-friendly daily counts, 7/30/90 days, per card
- **Settings**: profile and photo, download my data (JSON), delete account
- **Teams**: create a team, invite by link, roles, brand presets with locked fields, company cards, offboarding
- **Admin** (`/admin`, emails in `MEVORIQ_ADMIN_EMAILS`): reports and suspensions, feature flags, audit log

Runs on Supabase (Postgres, Auth with email link + Google, Storage) when its environment variables are set, and on a local development store otherwise. Database: `docs/database.md`. Publishing: `docs/deploy.md`.

Not yet: email delivery for invitations and new-contact alerts, wallet passes, real 404/308 status codes for streamed pages.

## Changing the logo

The logo is expected to change. Logo and icon files live only in `public/brand/` and are referenced only through `components/brand/logo.tsx` and `lib/brand/config.ts`. Export new files with the same names (masters are in `brand/`), replace them in `public/brand/`, and the whole app updates.

## Layout

```text
app/              routes (marketing, auth, onboarding, app dashboard, public cards, API)
components/       brand/, cards/, card-editor/, site/, ui/ (shadcn)
lib/              brand/, cards/, data/ (repository + local store), auth/, validation/, vcard/, qr/
supabase/         migrations (schema + RLS)
brand/            master brand kit (logos, icons, tokens, sources)
docs/             product plan, brand + sub-brand guidelines, decisions
tests/unit/       vitest
```
