import type { Metadata } from "next";
import Link from "next/link";
import { CountingPreference } from "@/components/marketing/counting-preference";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Cookies", description: "The few first-party cookies Mevoriq uses, why, and how to control them." };

const cookies = [
  { name: "sb-…-auth-token", purpose: "Keeps you signed in securely (set by our sign-in provider, Supabase, on our domain).", lasts: "Until you log out, refreshed while you use Mevoriq", type: "Strictly necessary" },
  { name: "mevoriq_org", purpose: "Remembers which team you last opened.", lasts: "30 days", type: "Strictly necessary" },
  { name: "mevoriq_reply_to", purpose: "After you tap “Make your own card”, remembers which card to send yours back to. Holds only that card’s address.", lasts: "7 days", type: "Functional" },
  { name: "mv_seen_…", purpose: "Counts a visitor once per 30 minutes on a card, so view totals aren’t inflated. Contains no personal data and isn’t shared.", lasts: "30 minutes", type: "Anonymous audience measurement" },
  { name: "mv_optout", purpose: "Remembers that you turned the counting cookie off.", lasts: "12 months", type: "Strictly necessary" },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie policy"
      updated="2 November 2026"
      intro={<p>Mevoriq uses a handful of first-party cookies. There are no advertising cookies, no third-party trackers and no cross-site tracking, which is why we don’t show a cookie banner.</p>}
      sections={[
        {
          id: "list",
          title: "Cookies we use",
          body: (
            <div className="overflow-x-auto rounded-[14px] bg-fill">
              <table className="w-full text-left text-[15px]">
                <thead>
                  <tr className="text-ink"><th className="px-5 py-3.5 font-semibold">Cookie</th><th className="px-5 py-3.5 font-semibold">Purpose</th><th className="px-5 py-3.5 font-semibold">Lasts</th></tr>
                </thead>
                <tbody>
                  {cookies.map((c) => (
                    <tr key={c.name} className="border-t border-white align-top">
                      <td className="px-5 py-3.5 font-mono text-[13px] text-ink">{c.name}<span className="mt-1 block font-sans text-xs text-muted-foreground">{c.type}</span></td>
                      <td className="px-5 py-3.5">{c.purpose}</td>
                      <td className="px-5 py-3.5">{c.lasts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        },
        {
          id: "why",
          title: "Why no consent banner",
          body: (
            <>
              <p>Strictly necessary cookies don’t need consent under the EU ePrivacy rules, the UK PECR or similar laws. The counting cookie is first-party, anonymous, short-lived and used only to produce aggregate totals, which regulators such as France’s CNIL treat as exempt audience measurement.</p>
              <p>Even so, you can turn it off below, and we never set it when your browser sends Global Privacy Control.</p>
            </>
          ),
        },
        {
          id: "control",
          title: "Your control",
          body: (
            <>
              <CountingPreference />
              <p>You can also block or delete cookies in your browser. Blocking the sign-in cookie will log you out; blocking the counting cookie only makes view totals slightly less precise.</p>
            </>
          ),
        },
        {
          id: "others",
          title: "Other sites",
          body: <p>If you choose Sign in with Google, or add a card to Apple Wallet or Google Wallet, those companies may set their own cookies on their sites under their own policies. Links on people’s cards go to sites we don’t control.</p>,
        },
        { id: "changes", title: "Changes", body: <p>If we ever add cookies that aren’t essential, we’ll update this page first and ask for your consent where the law requires it. See also our <Link href="/privacy" className="font-semibold text-blue hover:underline">privacy policy</Link>.</p> },
      ]}
    />
  );
}
