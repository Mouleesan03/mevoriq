import type { Metadata } from "next";
import { BadgeCheck, BarChart3, BellRing, Building2, CalendarDays, Camera, Contact, Copy, FileDown, Globe2, Inbox, Layers, Link2, Lock, Maximize2, Palette, QrCode, Reply, ShieldCheck, Tags, UserPlus, Users, Wallet } from "lucide-react";
import { PageHero, PrimaryCta, SecondaryCta, StartFreeBand, h2Class, reveal } from "@/components/marketing/sections";

export const metadata: Metadata = {
  title: "Features",
  description: "Everything in Mevoriq: permanent links and QR codes, one-tap contact saving, share-back contacts, private insights and team cards.",
};

const groups = [
  {
    title: "Share",
    color: "bg-blue text-white",
    items: [
      { icon: Link2, t: "Permanent link", d: "One address for your card. Change the address later and the old one keeps redirecting." },
      { icon: QrCode, t: "QR code for print", d: "Download as SVG or PNG. It stays the same when you edit your card." },
      { icon: Maximize2, t: "Meeting Mode", d: "A full-screen QR code for events and quick introductions." },
      { icon: Copy, t: "Copy and share", d: "Copy your link or use your phone’s share sheet in one tap." },
      { icon: Wallet, t: "Apple and Google Wallet", d: "Add your card to your phone’s wallet so your QR is always one swipe away." },
      { icon: Tags, t: "A QR for every place", d: "Separate codes for print, badges, slides and your email signature, counted separately." },
    ],
  },
  {
    title: "Save",
    color: "bg-yellow text-ink",
    items: [
      { icon: UserPlus, t: "One-tap Save contact", d: "A standards-based contact file that works on iPhone and Android." },
      { icon: Globe2, t: "Works with every script", d: "Names, accents and international phone numbers save correctly." },
      { icon: Contact, t: "No app needed", d: "Your card opens in any browser. Nobody has to install anything." },
      { icon: Layers, t: "A card for every context", d: "Separate cards for work, freelance projects or events." },
    ],
  },
  {
    title: "Follow up",
    color: "bg-coral text-ink",
    items: [
      { icon: Inbox, t: "Share-back contacts", d: "Visitors can leave their details with clear consent, without an account." },
      { icon: BarChart3, t: "Private insights", d: "Daily views, saves, link clicks and shared-back contacts. No visitor profiles." },
      { icon: FileDown, t: "Export any time", d: "Download your contacts as CSV or your whole account as JSON." },
      { icon: BellRing, t: "Follow-up reminders", d: "Contacts due today appear on your home screen, with one tap to mark them done." },
      { icon: CalendarDays, t: "Event Mode and recaps", d: "Tag everyone you meet at an event, then get a recap and a per-event export." },
      { icon: Reply, t: "Reply with your card", d: "People who save your card can make their own and send it straight back." },
      { icon: ShieldCheck, t: "Report and moderation", d: "Anyone can report a card for impersonation or spam. Our team reviews every report." },
    ],
  },
  {
    title: "Design",
    color: "bg-pink text-ink",
    items: [
      { icon: Palette, t: "Five templates", d: "From Minimal White to Aurora Gradient, each with accessible accent colors." },
      { icon: Camera, t: "Photo upload", d: "Add a profile photo. We crop it to a square and remove hidden metadata." },
      { icon: Lock, t: "Readable by design", d: "Every template and accent passes WCAG AA contrast." },
      { icon: Users, t: "Team branding", d: "Organizations set the design once and lock it on company cards." },
      { icon: Building2, t: "Company accounts", d: "Register your business, invite employees and offboard them safely." },
      { icon: BadgeCheck, t: "Verified badge", d: "Cards on your company’s domain show they’re really from your company." },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <PageHero eyebrow="Features" title="Everything a first impression needs" text="Mevoriq helps you share who you are, get saved to people’s phones, and remember everyone you meet.">
        <PrimaryCta />
        <SecondaryCta href="/templates">See templates</SecondaryCta>
      </PageHero>

      {groups.map((g, gi) => (
        <section key={g.title} className="container-page pt-12 md:pt-16">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <div {...reveal(0, gi % 2 ? "right" : "left")} className={`flex min-h-[180px] flex-col justify-end rounded-[16px] p-6 sm:rounded-[12px] sm:p-8 ${g.color}`}>
              <span className="font-mono text-sm opacity-80">0{gi + 1}</span>
              <h2 className="mt-2 text-[34px] leading-none tracking-[-0.03em]">{g.title}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {g.items.map((it, i) => (
                <div key={it.t} {...reveal(i)} className="rounded-[14px] bg-fill p-6 sm:rounded-[16px] sm:p-7">
                  <span className="grid size-11 place-items-center rounded-full bg-white"><it.icon className="size-5 text-blue" aria-hidden /></span>
                  <h3 className="mt-5 text-[20px] font-bold tracking-[-0.02em]">{it.t}</h3>
                  <p className="mt-1.5 leading-normal text-body">{it.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="container-page pt-16 pb-6 md:pt-24">
        <h2 {...reveal(0)} className={`${h2Class} max-w-[760px]`}>Coming next</h2>
        <p {...reveal(1)} className="mt-4 max-w-[620px] text-lg leading-normal text-body">
          We build in the open with early users. Next up: email alerts for new contacts and due follow-ups, and cards in Tamil, Sinhala and English. Features appear here only once they’re built and tested.
        </p>
      </section>

      <StartFreeBand />
    </>
  );
}
