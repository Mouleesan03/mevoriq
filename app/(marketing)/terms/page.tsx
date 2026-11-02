import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Terms", description: "The rules for using Mevoriq, for people and companies worldwide." };

const a = "font-semibold text-blue hover:underline";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      updated="2 November 2026"
      intro={<p>These terms are an agreement between you and Infonits, the company that makes Mevoriq. By creating an account or publishing a card, you agree to them. Nothing here takes away rights you have under consumer law where you live.</p>}
      sections={[
        {
          id: "who",
          title: "Who can use Mevoriq",
          body: (
            <>
              <p>You must be at least 16, and old enough to agree to these terms where you live.</p>
              <p>If you register a company or use Mevoriq for an organization, you confirm you’re allowed to accept these terms for it; “you” then includes that organization.</p>
            </>
          ),
        },
        { id: "account", title: "Your account", body: <p>Use your real name and an email address you control, and keep access to it secure. You’re responsible for activity under your account. Tell us straight away if you think someone else is using it.</p> },
        {
          id: "content",
          title: "Your cards and content",
          body: (
            <>
              <p>You own what you put on your cards. You give us a worldwide, non-exclusive licence to host, copy and display it only as needed to run Mevoriq for you, such as showing your card and creating wallet passes. The licence ends when you delete the content.</p>
              <p>Only publish details you have the right to share, keep them accurate, and don’t use someone else’s trademarks or name in a misleading way.</p>
            </>
          ),
        },
        {
          id: "acceptable",
          title: "What’s not allowed",
          body: (
            <ul>
              <li>Pretending to be another person or organization, or claiming a company you don’t work for.</li>
              <li>Spam, scams, phishing or misleading links.</li>
              <li>Illegal, hateful, harassing or sexually explicit content.</li>
              <li>Collecting other people’s data without a lawful basis, or scraping Mevoriq.</li>
              <li>Breaking, overloading, reverse engineering or getting around the security of the service.</li>
              <li>Using Mevoriq where sanctions or export laws forbid it.</li>
            </ul>
          ),
        },
        {
          id: "contacts",
          title: "Contacts people share with you",
          body: (
            <>
              <p>When a visitor shares their details with you, you’re responsible for them. Use them to follow up on your introduction, respect their choice about marketing, delete them if asked, and follow the data protection and anti-spam laws that apply to you (for example the GDPR, CAN-SPAM, CASL or local equivalents).</p>
              <p>We process those contacts on your behalf. Organizations that need a data processing agreement can request one through <Link href="/contact" className={a}>contact</Link>.</p>
            </>
          ),
        },
        {
          id: "teams",
          title: "Company accounts",
          body: <p>Owners and admins are responsible for the people they invite, the brand settings they lock, and any shared access to contacts. Company cards belong to the organization; personal cards always belong to the person. When someone leaves, their company card goes offline.</p>,
        },
        {
          id: "verified",
          title: "Verified badges",
          body: <p>A verified badge means the card owner signs in with an email address on the domain shown. It isn’t an endorsement and doesn’t confirm their job title or authority. Misusing a domain you don’t control is impersonation.</p>,
        },
        {
          id: "third",
          title: "Other services",
          body: <p>Features such as Sign in with Google, Apple Wallet and Google Wallet depend on those providers, whose terms also apply when you use them. We aren’t responsible for their services.</p>,
        },
        {
          id: "moderation",
          title: "Reports and suspensions",
          body: <p>Anyone can report a card. We may take a card offline while we review a report, remove content that breaks these terms or the law, and suspend accounts. Where reasonable, we’ll tell you why and let you respond.</p>,
        },
        {
          id: "free",
          title: "Free early access and future plans",
          body: <p>Mevoriq is free during early access. If we introduce paid plans, we’ll announce them in advance; nothing will be charged unless you choose to upgrade. See <Link href="/pricing" className={a}>Pricing</Link>.</p>,
        },
        { id: "ours", title: "Our brand and software", body: <p>Mevoriq, its logo, templates and software belong to Infonits. These terms don’t give you rights to them beyond using the service.</p> },
        { id: "ending", title: "Ending your account", body: <p>You can delete your account at any time in Settings. We may close accounts that seriously or repeatedly break these terms, or if we stop offering Mevoriq, in which case we’ll give reasonable notice so you can export your data.</p> },
        {
          id: "liability",
          title: "Disclaimers and liability",
          body: (
            <>
              <p>During early access the service is provided “as is”. To the extent the law allows, we don’t promise it will be uninterrupted or error-free, and we aren’t liable for indirect or consequential losses, or for lost profits or data.</p>
              <p>To the extent the law allows, our total liability is limited to the greater of the amount you paid us in the 12 months before the claim or USD 100. None of this limits liability for death or personal injury caused by negligence, for fraud, or anything else that can’t be limited by law.</p>
            </>
          ),
        },
        { id: "law", title: "Disputes", body: <p>Please contact us first; most issues can be solved quickly. If you’re a consumer, you can bring a claim in the courts where you live, and your local mandatory consumer protections apply.</p> },
        { id: "changes", title: "Changes to these terms", body: <p>We’ll post updates here and tell signed-in users at least 14 days before significant changes take effect. If you keep using Mevoriq after that, the new terms apply.</p> },
      ]}
    />
  );
}
