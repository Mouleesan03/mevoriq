# Mevoriq Brand Kit — Bright (v2.0, 2 Nov 2026)

Status: **proposed**; name, domain and trademark still need clearance (see ../docs/brand-guidelines.md §13).

- `logos/bright/` — symbol (blue), symbol-white, symbol-monochrome, favicon (heavier stroke), maskable (full-bleed).
- `icons/` — favicon-16/32/48, apple-touch-icon-180, pwa-icon-192/512 (+ maskable), social-avatar-1024. Generated from the SVGs with sharp.
- `code/` — head icon tags and web manifest. Live design tokens are in `../app/globals.css`.
- `archive/` — the earlier navy/mint kit (v1.1), kept for reference only.

The wordmark ("mevoriq", Plus Jakarta Sans ExtraBold, −3% tracking) is rendered as text by `components/brand/logo.tsx`.
Before print or partner use, have a designer produce an outlined horizontal lockup.

## In the app

The app serves copies of these files from `public/brand/` and only references them through
`components/brand/` and `lib/brand/config.ts`. To change the logo: export new files with the same names,
replace them in `public/brand/` (and here), and nothing else needs to change.
