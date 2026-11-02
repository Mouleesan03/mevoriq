import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Faq, PageHero, PrimaryCta, h2Class, reveal } from "@/components/marketing/sections";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Mevoriq is free during early access, teams included. We’ll always keep a useful free card.",
};

const included = [
  "Separate cards for every context",
  "Permanent link and print-ready QR code",
  "One-tap Save contact (vCard)",
  "Meeting Mode",
  "Five accessible templates and photo upload",
  "Share-back contacts with notes, tags and reminders",
  "Private daily insights",
  "Teams: brand presets, locked fields, invitations",
  "CSV and full account export",
];

const promises = [
  { t: "No surprise charges", d: "Nothing you use today will be charged without you choosing to upgrade." },
  { t: "Advance notice", d: "If plans change, we’ll tell you well before anything happens." },
  { t: "Your links keep working", d: "Published free cards and their links stay online under the free plan." },
  { t: "Your data stays yours", d: "Export or delete everything at any time, on any plan." },
];

export default function PricingPage() {
  return (
    <>
      <PageHero eyebrow="Pricing" title="Free during early access" text="Every feature we’ve launched is free while Mevoriq grows, teams included. No credit card, no trial countdown." />

      <section className="container-page">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div {...reveal(0, "left")} className="rounded-[16px] sm:rounded-[12px] bg-blue p-[clamp(28px,4vw,48px)] text-white">
            <span className="rounded-full bg-yellow px-3.5 py-1.5 text-sm font-semibold text-ink">Early access</span>
            <p className="mt-8 flex items-end gap-2">
              <span className="text-[56px] sm:text-[72px] leading-none font-extrabold tracking-[-0.04em]">Free</span>
            </p>
            <p className="mt-3 text-lg text-[#DCE3FF]">For individuals and teams, while we’re in early access.</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {included.map((f) => (
                <li key={f} className="flex gap-2.5 text-[15px]">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/15"><Check className="size-3.5" strokeWidth={3} /></span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex min-h-14 items-center rounded-lg bg-white px-8 text-[17px] font-semibold text-ink hover:bg-white/90">
                Create your free card
              </Link>
              <Link href="/login?next=%2Fonboarding%3Ffor%3Dbusiness" className="inline-flex min-h-14 items-center rounded-lg px-6 text-[17px] font-semibold text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.4)] hover:bg-white/10">
                Register a company
              </Link>
            </div>
          </div>
          <div {...reveal(1, "right")} className="rounded-[16px] sm:rounded-[12px] bg-fill p-[clamp(28px,4vw,48px)]">
            <h2 className="text-[28px] leading-tight tracking-[-0.03em]">What may come later</h2>
            <p className="mt-4 leading-[1.6] text-body">
              Once Mevoriq is established, we may add optional paid tools for people and organizations that need more, such as advanced team administration or deeper insights. A useful free card will always remain.
            </p>
            <p className="mt-4 leading-[1.6] text-body">We haven’t set any prices yet, and we won’t publish them until we’ve talked with early users.</p>
          </div>
        </div>
      </section>

      <section className="container-page pt-16 md:pt-24">
        <h2 {...reveal(0)} className={`${h2Class} max-w-[760px]`}>Our promise to early users</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map((p, i) => (
            <div key={p.t} {...reveal(i)} className="rounded-[14px] p-6 sm:rounded-[16px] sm:p-7 shadow-[inset_0_0_0_2px_var(--mevoriq-border)]">
              <h3 className="text-[19px] font-semibold">{p.t}</h3>
              <p className="mt-2 leading-normal text-body">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pt-16 pb-12 md:pt-28 md:pb-16">
        <Faq />
        <div {...reveal(0)} className="mt-14 text-center">
          <PrimaryCta />
        </div>
      </section>
    </>
  );
}
