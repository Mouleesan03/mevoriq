import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Privacy", description: "What Mevoriq collects, why, who processes it, and the rights you have wherever you live." };

const a = "font-semibold text-blue hover:underline";

const providers = [
  { name: "Supabase", role: "Database, sign-in and photo storage", where: "Region chosen for the project; support access may be global" },
  { name: "Vercel", role: "Hosting and content delivery", where: "Global edge network" },
  { name: "Google", role: "Sign in with Google (if you choose it); Google Wallet (if you add a pass)", where: "Global" },
  { name: "Apple", role: "Apple Wallet (if you add a pass)", where: "Global" },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="2 November 2026"
      intro={
        <p>
          Mevoriq is made by Infonits. We collect as little as we can, use it only to run Mevoriq, and never sell it. This policy applies wherever you are, and the section on your rights explains what
          extra protections your local law gives you.
        </p>
      }
      sections={[
        {
          id: "who",
          title: "Who we are",
          body: (
            <>
              <p>Infonits (“we”, “us”) provides Mevoriq and is responsible for the personal data described here (the “controller” under laws such as the GDPR).</p>
              <p>
                <strong>Contacts that visitors share with a card owner</strong> belong to that card owner. For those details, the card owner decides how they’re used and we process them on the owner’s behalf. If
                you shared your details with someone, ask them first about how they use them; we’ll help if they don’t respond.
              </p>
              <p>Questions about privacy: <Link href="/contact" className={a}>contact us</Link> and choose “Privacy”.</p>
            </>
          ),
        },
        {
          id: "what",
          title: "What we collect",
          body: (
            <>
              <p><strong>Account:</strong> your name and email address. If you sign in with Google, we receive your name and email from Google, nothing else.</p>
              <p><strong>Cards:</strong> what you choose to put on a card, such as job title, phone number, links and photo. A published card is visible to anyone with its link or QR code.</p>
              <p><strong>Contacts shared with you:</strong> name, email and any optional phone, company or note a visitor enters, with the time they agreed and the consent text they saw. Your own notes, tags, follow-up dates and events on those contacts.</p>
              <p><strong>Teams:</strong> organization name, brand settings, members’ roles, invitations and an activity log of admin actions.</p>
              <p><strong>Usage counts:</strong> daily totals per card (views, saves, link clicks, QR downloads, and which labelled QR was used). These are numbers, not records of individual visitors.</p>
              <p><strong>Security data:</strong> a one-way hash of your IP address, kept for up to an hour, to stop spam and abuse.</p>
              <p><strong>Messages and reports:</strong> what you send through the contact form or a card report.</p>
            </>
          ),
        },
        {
          id: "not",
          title: "What we don’t do",
          body: (
            <ul>
              <li>We don’t record visitors’ names, IP addresses, locations or devices in analytics.</li>
              <li>We don’t use advertising trackers, fingerprinting or third-party analytics.</li>
              <li>We don’t sell personal data or share it for cross-context behavioural advertising.</li>
              <li>We don’t make decisions about you using automated processing that has legal or similarly significant effects.</li>
            </ul>
          ),
        },
        {
          id: "why",
          title: "Why we use it (legal bases)",
          body: (
            <ul>
              <li><strong>To provide Mevoriq</strong> (performing our contract with you): your account, cards, contacts, teams, wallet passes and insights.</li>
              <li><strong>With consent:</strong> a visitor sharing their details, and their separate choice to receive updates. Consent can be withdrawn at any time.</li>
              <li><strong>Legitimate interests:</strong> keeping Mevoriq secure, preventing spam and impersonation, reviewing reports, and anonymous usage counts. We balance these against your rights.</li>
              <li><strong>Legal obligations:</strong> responding to lawful requests and keeping records the law requires.</li>
            </ul>
          ),
        },
        {
          id: "visitors",
          title: "If you visit someone’s card",
          body: (
            <>
              <p>You can view a card and save the contact without an account. Nothing about you reaches the card owner unless you fill in “Share your details” and tick the consent box.</p>
              <p>Marketing consent is a separate, optional choice. You can ask the card owner, or us, to delete what you shared.</p>
            </>
          ),
        },
        {
          id: "sharing",
          title: "Who processes data for us",
          body: (
            <>
              <p>We use a few service providers under contracts that limit them to processing data on our instructions:</p>
              <div className="overflow-x-auto rounded-[12px] bg-fill">
                <table className="w-full text-left text-[15px]">
                  <thead><tr className="text-ink"><th className="px-5 py-3 font-semibold">Provider</th><th className="px-5 py-3 font-semibold">Purpose</th><th className="px-5 py-3 font-semibold">Location</th></tr></thead>
                  <tbody>
                    {providers.map((p) => (
                      <tr key={p.name} className="border-t border-white align-top"><td className="px-5 py-3 font-semibold text-ink">{p.name}</td><td className="px-5 py-3">{p.role}</td><td className="px-5 py-3">{p.where}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>When you add a card to Apple Wallet or Google Wallet, the pass (your name, title, company and card link) is handled by Apple or Google under their own privacy policies.</p>
              <p>We may disclose data if the law requires it, to protect people from harm, or as part of a merger or acquisition, in which case this policy continues to apply.</p>
            </>
          ),
        },
        {
          id: "transfers",
          title: "International transfers",
          body: <p>Our providers may process data outside your country. Where the law requires it, we rely on safeguards such as the European Commission’s Standard Contractual Clauses and the UK International Data Transfer Addendum, or an adequacy decision.</p>,
        },
        {
          id: "retention",
          title: "How long we keep data",
          body: (
            <ul>
              <li>Account, cards, contacts and teams: while your account exists. When you delete it, we remove it from active systems straight away and from backups within 30 days.</li>
              <li>Usage counts: while the card exists.</li>
              <li>Security hashes and rate limits: up to 1 hour.</li>
              <li>Reports, messages and admin activity logs: up to 24 months, unless needed longer for a legal claim.</li>
            </ul>
          ),
        },
        {
          id: "rights",
          title: "Your rights, wherever you live",
          body: (
            <>
              <p>
                Everyone can access, correct, download and delete their data. In <Link href="/app/settings" className={a}>Settings</Link> you can export everything we store about you as JSON, export
                your contacts as CSV, and delete your account. For anything else, <Link href="/contact" className={a}>contact us</Link>; we reply within 30 days and may need to confirm it’s you.
              </p>
              <p><strong>EEA, UK and Switzerland (GDPR):</strong> you can also restrict or object to processing, withdraw consent, and complain to your data protection authority.</p>
              <p>
                <strong>California and other US states:</strong> you have the right to know, delete and correct personal information, and to opt out of sale or sharing. We don’t sell or share it, and we
                honour Global Privacy Control signals. We won’t treat you differently for using your rights.
              </p>
              <p><strong>Brazil (LGPD), India (DPDP Act), Sri Lanka (PDPA), Canada, Australia, Singapore and elsewhere:</strong> you have the rights your local law gives you, including to nominate someone to act for you where allowed, and to raise a grievance with us and then your regulator.</p>
            </>
          ),
        },
        {
          id: "children",
          title: "Children",
          body: <p>Mevoriq is for professional use and isn’t meant for anyone under 16. We don’t knowingly collect children’s data; if you think a child has given us data, contact us and we’ll delete it.</p>,
        },
        {
          id: "security",
          title: "Security",
          body: <p>Data is encrypted in transit, access is limited to people who need it, and every database table has row-level security. No system is perfect; if a breach affects you, we’ll tell you and the relevant authorities as the law requires.</p>,
        },
        {
          id: "cookies",
          title: "Cookies",
          body: <p>We use only a few first-party cookies. See the <Link href="/cookies" className={a}>cookie policy</Link>.</p>,
        },
        {
          id: "changes",
          title: "Changes to this policy",
          body: <p>If we make meaningful changes, we’ll update this page and tell signed-in users before they take effect.</p>,
        },
      ]}
    />
  );
}
