# Publishing Mevoriq (Supabase + Vercel)

Do these once, in order. Steps marked **you** need your accounts; nothing here needs a password shared in chat.

## 1. Database (Supabase) — you

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the whole of `supabase/migrations/20261102120000_mevoriq_schema.sql` and run it. It creates 15 tables, triggers, functions, RLS policies and the `card-media` storage bucket. (Details: `docs/database.md`.)
3. **Authentication → Providers**
   - **Email**: enabled; turn on "Confirm email". Magic links are used, so no passwords.
   - **Google**: enabled. Create an OAuth client in Google Cloud Console (type *Web application*), set its authorized redirect URI to the callback URL Supabase shows on this screen (`https://<project-ref>.supabase.co/auth/v1/callback`), then paste the client ID and secret here.
4. **Authentication → URL Configuration**
   - Site URL: `https://YOUR_DOMAIN`
   - Redirect URLs: `https://YOUR_DOMAIN/auth/callback` and `http://localhost:3001/auth/callback`
5. **Authentication → Emails → SMTP**: for real users, connect your own SMTP sender (Supabase's built-in sender is rate-limited and meant for testing).
6. Optional: **Integrations → Cron** → daily job `select public.cleanup_expired();`

## 2. Local check with Supabase — you, then Claude can verify

Add to `.env.local` (never commit this file):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
MEVORIQ_ADMIN_EMAILS=you@yourcompany.com
```

Restart the dev server. The login page switches to "Continue with Google" and "Email me a sign-in link".

## 3. Code on GitHub — you

Create a private GitHub repository and push this project (`.env.local` and `.data/` are git-ignored).

## 4. Hosting (Vercel) — you

1. vercel.com → **Add New → Project** → import the GitHub repository. Framework: Next.js (auto-detected).
2. **Environment Variables** (Production and Preview):
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_APP_URL` | `https://YOUR_DOMAIN` |
   | `NEXT_PUBLIC_SUPABASE_URL` | project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable key |
   | `SUPABASE_SECRET_KEY` | secret key (server only) |
   | `MEVORIQ_ADMIN_EMAILS` | your admin email(s) |
3. Deploy. Then **Settings → Domains** → add your domain and follow the DNS instructions.
4. Update Supabase Site URL / redirect URLs (step 1.4) if the domain changed.

The app refuses to use the local development store in production, so a missing Supabase variable fails loudly instead of losing data.

## 5. Smoke test after deploy

- [ ] Home, features, templates, pricing, teams, about, contact, legal pages load on phone and desktop
- [ ] Sign in with an email link; sign in with Google
- [ ] Create a card through onboarding; upload a photo; publish
- [ ] Open the public card on a phone; Save contact downloads a vCard; QR scans
- [ ] Share details back from another device; the contact appears in Contacts
- [ ] Insights count a view from another device (your own visits aren't counted)
- [ ] Create a team, invite a second email, accept, create a company card
- [ ] Report a card and resolve it in `/admin`; send a contact-form message and see it in `/admin`
- [ ] Settings: download my data; delete a test account

## 6. Wallet passes (optional) — you

The "Add to Apple Wallet / Google Wallet" buttons on a card's Share page appear only when that provider's keys are set.

**Apple Wallet** (needs an Apple Developer account):
1. developer.apple.com → Certificates, IDs & Profiles → Identifiers → **Pass Type IDs** → add one (e.g. `pass.io.mevoriq.card`).
2. Create a **Pass Type ID certificate** for it, download it, and export the certificate and private key as PEM (Keychain → export .p12, then `openssl pkcs12 -in pass.p12 -clcerts -nokeys -out cert.pem` and `-nocerts -out key.pem`).
3. Download Apple's **WWDR G4** intermediate certificate and convert it to PEM.
4. Set `APPLE_PASS_TYPE_ID`, `APPLE_TEAM_ID`, and `APPLE_PASS_CERT`, `APPLE_PASS_KEY`, `APPLE_WWDR_CERT` as base64 of each PEM file (`base64 -i cert.pem`), plus `APPLE_PASS_KEY_PASSPHRASE` if the key has one.

**Google Wallet**:
1. pay.google.com/business/console → **Google Wallet API** → note your **Issuer ID**.
2. Google Cloud: enable the Google Wallet API, create a **service account**, add a JSON key, and add the service account as a user in the Wallet console.
3. Set `GOOGLE_WALLET_ISSUER_ID`, `GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_WALLET_PRIVATE_KEY` (the key's `private_key`, `\n` line breaks are fine).
4. New issuers start in demo mode (only test accounts can save passes) until Google approves publishing access.

Before launch, swap the plain buttons for Apple's and Google's official "Add to Wallet" badges, as their brand guidelines require.

## Before a public launch

- Legal review of `/privacy`, `/terms`, `/cookies` (currently marked as drafts).
- Trademark and domain clearance for "Mevoriq" (`docs/brand-guidelines.md` §13).
- A designer-made outlined logo lockup for print.
