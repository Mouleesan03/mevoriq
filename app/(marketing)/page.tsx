import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarDays, Check, EyeOff, Link2, Lock, LogOut, Palette, QrCode, ShieldCheck, Trash2, Wallet } from "lucide-react";
import { HeroDeck } from "@/components/marketing/hero-deck";
import { HowItWorksStory } from "@/components/marketing/how-it-works-story";
import { Ribbon } from "@/components/marketing/ribbon";
import { Eyebrow, Faq, PrimaryCta, SecondaryCta, SectionHeading, StartFreeBand, TemplateGallery, reveal } from "@/components/marketing/sections";
import { FRONT_PERSON } from "@/lib/marketing/fan";
import { appUrl } from "@/lib/env";
import { qrSvg } from "@/lib/qr";

const host = appUrl().replace(/^https?:\/\//, "");

const audiences = ["Freelancers", "Consultants", "Founders", "Sales teams", "Recruiters", "Event hosts", "Creatives", "Real estate agents"];

const extras = [
  { title: "A link that never changes", text: "Change jobs, numbers or photos. Every QR code you’ve printed still works." },
  { title: "Save contact, done right", text: "International numbers, accents and every script save cleanly on iPhone and Android." },
  { title: "Accessible by default", text: "Every template and accent passes WCAG AA contrast, so every card is easy to read." },
];

const room = [
  { icon: CalendarDays, title: "Event Mode", text: "Start an event when you arrive. Everyone you meet is tagged, and you get a recap with follow-ups ready.", cls: "bg-sky", ic: "text-blue" },
  { icon: Wallet, title: "Apple and Google Wallet", text: "Keep your card next to your boarding passes. Your QR is one swipe away, even offline.", cls: "bg-cream", ic: "text-ink" },
  { icon: BadgeCheck, title: "Verified badge", text: "Sign in with your company email and your card shows it. A quiet answer to fake profiles.", cls: "bg-leaf", ic: "text-mint-ink" },
  { icon: QrCode, title: "A QR for every place", text: "Different codes for your brochure, badge and slides, so you know which one people scan.", cls: "bg-pink", ic: "text-[#A3321F]" },
];

const trust = [
  { icon: EyeOff, title: "Out of search engines", text: "Cards aren’t indexed by search engines. People find you through your link or QR code." },
  { icon: ShieldCheck, title: "Consent first", text: "Visitors only share details back when they tick a clear consent box. Marketing consent is separate." },
  { icon: Trash2, title: "Yours to take or delete", text: "Download everything we store about you, export your contacts, or delete your account at any time." },
];

export default async function HomePage() {
  const qr = await qrSvg(`${appUrl()}/u/${FRONT_PERSON.slug}`);
  return (
    <>
      {/* Hero: the silk ribbon runs up under the translucent header, kept soft (30%) so the cards stay the focus */}
      <div className="relative isolate -mt-16 overflow-hidden pt-16">
      <Ribbon className="absolute top-0 right-[-30%] -z-10 h-[70%] w-[130%] opacity-30 [mask-image:linear-gradient(to_bottom,black_50%,transparent)] sm:right-[-12%] sm:w-[90%] lg:top-[-6%] lg:right-[-12%] lg:h-[120%] lg:w-[82%] lg:[mask-image:linear-gradient(to_right,transparent_5%,black_45%)]" />
      <section className="container-page grid items-center gap-12 pt-8 pb-12 sm:gap-14 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pt-20 lg:pb-24">
        <div>
          <div {...reveal(0)}>
            <Eyebrow>
              <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] text-white">Free</span>
              Early access is open, teams included
            </Eyebrow>
          </div>
          <h1 {...reveal(1)} className="mt-5 text-display">
            Your identity.
            <br />
            <span className="bg-linear-to-r from-blue via-[#7A4BD8] to-coral bg-clip-text text-transparent">Every connection.</span>
          </h1>
          <p {...reveal(2)} className="mt-4 max-w-[520px] text-lead sm:mt-5">
            The digital business card you never run out of. Share a link or QR code, and people save you to their phone in one tap.
          </p>
          <div {...reveal(3)} className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <PrimaryCta />
            <SecondaryCta href="#how">See how it works</SecondaryCta>
          </div>
          <ul {...reveal(4)} className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-body sm:mt-7">
            {["No app needed", "Works on any phone", "Free during early access"].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><Check className="size-4 text-mint-ink" strokeWidth={2.6} /> {t}</li>
            ))}
          </ul>
        </div>
        <div {...reveal(2, "scale")} className="px-3 sm:px-8 lg:px-0">
          <HeroDeck host={host} />
        </div>
      </section>
      </div>

      {/* Who it's for */}
      <section aria-label="Made for" className="border-y border-black/[0.06] bg-white/70 py-6 backdrop-blur-sm">
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <ul className="flex w-max gap-10 motion-safe:animate-[marquee_32s_linear_infinite] motion-reduce:flex-wrap motion-reduce:justify-center">
            {[...audiences, ...audiences].map((a, i) => (
              <li key={`${a}-${i}`} aria-hidden={i >= audiences.length} className="flex items-center gap-10 text-[15px] font-semibold whitespace-nowrap text-body">
                {a}
                <span className="h-4 w-px bg-black/10" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Three ways to share */}
      <section className="container-page section-y">
        <SectionHeading eyebrow="Share" title="Three ways to hand over your card" text="In person, in a message or on screen. Whichever way you share, people save you in one tap." />
        <div className="mt-10 grid gap-3 sm:gap-4 md:grid-cols-3">
          <div {...reveal(0, "tilt")} className="flex flex-col rounded-[16px] bg-blue p-6 text-white md:min-h-[300px] md:p-8">
            <div className="size-20 rounded-[14px] bg-white p-2 shadow-[0_10px_24px_-14px_rgba(10,20,80,0.6)] [&>svg]:h-full [&>svg]:w-full" aria-hidden dangerouslySetInnerHTML={{ __html: qr }} />
            <h3 className="pt-6 text-h3 md:mt-auto md:pt-8">Scan it</h3>
            <p className="mt-2 leading-normal text-[#DCE3FF]">Meeting Mode fills your screen with your QR code. Any phone camera can scan it.</p>
          </div>
          <div {...reveal(1, "tilt")} className="flex flex-col rounded-[16px] bg-yellow p-6 text-ink md:min-h-[300px] md:p-8">
            <span className="max-w-full self-start rounded-2xl bg-white px-4 py-2.5 font-mono text-[13px] break-all shadow-[0_8px_20px_-12px_rgba(18,19,26,0.4)] sm:text-[14px]">
              {host}/u/<b>{FRONT_PERSON.slug}</b>
            </span>
            <h3 className="pt-6 text-h3 md:mt-auto md:pt-8">Send it</h3>
            <p className="mt-2 leading-normal text-body">One permanent link for email, chat and your bio. It never changes, even when you do.</p>
          </div>
          <div {...reveal(2, "tilt")} className="flex flex-col rounded-[16px] bg-coral p-6 text-ink md:min-h-[300px] md:p-8">
            <div className="flex">
              <span className="grid size-14 place-items-center rounded-full bg-white pr-2 font-bold shadow-[0_0_0_4px_var(--mevoriq-coral)]">EC</span>
              <span className="-ml-3 grid size-14 place-items-center rounded-full bg-ink font-bold text-white shadow-[0_0_0_4px_var(--mevoriq-coral)]">RM</span>
            </div>
            <h3 className="pt-6 text-h3 md:mt-auto md:pt-8">Swap it</h3>
            <p className="mt-2 leading-normal text-[#2A1410]">One tap saves your contact, and they can share theirs straight back.</p>
          </div>
        </div>
      </section>

      {/* How it works: pinned scroll story */}
      <section id="how" className="container-page scroll-mt-24 pb-16 md:pb-24">
        <SectionHeading eyebrow="How it works" title="An introduction that takes three seconds" />
        <div className="mt-10 lg:mt-0">
          <HowItWorksStory qrSvg={qr} host={host} />
        </div>
      </section>

      {/* Features */}
      <section className="container-page section-y border-t">
        <SectionHeading eyebrow="After the hello" title="Built for the second meeting, not just the first" />
        <div className="mt-12 grid gap-14 md:mt-16 md:gap-20">
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <div {...reveal(0, "left")} className="grid place-items-center rounded-[16px] bg-pink p-5 sm:rounded-[12px] sm:p-10">
              <div className="w-full max-w-[380px] rounded-[14px] bg-white p-5 shadow-[0_30px_60px_-30px_rgba(120,20,50,0.45)]">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-blue font-bold text-white">RM</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">Ryan Mitchell</span>
                    <span className="block text-[13px] text-muted-foreground">Shared back from your card</span>
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-cream px-3 py-1.5 text-[13px] font-medium">Met at the design meetup</span>
                  <span className="rounded-full bg-sky px-3 py-1.5 text-[13px] font-medium text-blue-deep">Follow up Thursday</span>
                </div>
                <p className="mt-3.5 rounded-[14px] bg-fill px-3.5 py-3 text-sm leading-normal text-body">Interested in the rebrand. Send portfolio link.</p>
              </div>
            </div>
            <div {...reveal(1, "right")}>
              <h3 className="text-h3">Follow up while it’s fresh</h3>
              <p className="mt-4 max-w-[460px] text-lead">
                Visitors can leave their details with clear consent. They arrive in your contacts, where you tag where you met, add a note and set a reminder. A nudge, not a sales pipeline.
              </p>
            </div>
          </div>

          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <div {...reveal(1, "left")} className="md:order-1">
              <h3 className="text-h3">Insights without tracking</h3>
              <p className="mt-4 max-w-[460px] text-lead">Daily views, saves and clicks. No locations, no fingerprints, no visitor profiles.</p>
            </div>
            <div {...reveal(0, "right")} className="grid place-items-center rounded-[16px] bg-leaf p-5 sm:rounded-[12px] sm:p-10 md:order-2">
              <div className="w-full max-w-[380px] rounded-[14px] bg-white p-5 shadow-[0_30px_60px_-30px_rgba(10,90,60,0.45)]">
                <div className="flex justify-between text-sm"><span className="font-semibold">Card views</span><span className="text-muted-foreground">Last 7 days</span></div>
                <div role="img" aria-label="Example bar chart of daily card views" className="mt-4 flex h-[120px] items-end gap-2 sm:h-[140px] sm:gap-2.5">
                  {[38, 55, 30, 72, 100, 64, 46].map((h, i) => (
                    <span key={i} className={`flex-1 rounded-lg ${h === 100 ? "bg-blue" : "bg-sky"}`} style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="mt-3.5 flex flex-wrap gap-2 text-[13px]">
                  {["Views", "Saves", "Clicks"].map((t) => <span key={t} className="rounded-full bg-fill px-3 py-1.5">{t}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            {extras.map((f, i) => (
              <div key={f.title} {...reveal(i)} className="rounded-[14px] p-6 shadow-[inset_0_0_0_2px_var(--mevoriq-border)] sm:p-7">
                <h4 className="text-[18px] font-semibold">{f.title}</h4>
                <p className="mt-2 leading-normal text-body">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
        <Link {...reveal(0)} href="/features" className="mt-10 inline-flex items-center gap-2 py-2 font-semibold text-blue hover:underline">
          See every feature <ArrowRight className="size-4" />
        </Link>
      </section>

      {/* Built for the room */}
      <section className="container-page pb-16 md:pb-24">
        <SectionHeading eyebrow="In the room" title="Made for conferences, meetups and sales calls" />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {room.map((r, i) => (
            <div key={r.title} {...reveal(i)} className={`flex flex-col rounded-[14px] p-6 sm:p-7 ${r.cls}`}>
              <span className="flex size-11 items-center justify-center rounded-2xl bg-white/80"><r.icon className={`size-5 ${r.ic}`} aria-hidden /></span>
              <h3 className="mt-6 text-[19px] font-bold tracking-[-0.01em]">{r.title}</h3>
              <p className="mt-2 text-[15px] leading-normal text-body">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="container-page section-y scroll-mt-24 border-t">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Templates" title="Five templates. Readable for everyone." />
          <Link {...reveal(2)} href="/templates" className="hidden items-center gap-2 font-semibold text-blue hover:underline sm:inline-flex">
            Try them live <ArrowRight className="size-4" />
          </Link>
        </div>
        <TemplateGallery withLinks />
      </section>

      {/* Teams */}
      <section id="teams" className="container-page scroll-mt-24 pb-16 md:pb-24">
        <div {...reveal(0, "scale")} className="grid items-center gap-10 rounded-[12px] bg-blue p-6 text-white sm:rounded-[14px] sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-16">
          <div>
            <span className="inline-block rounded-full bg-yellow px-3 py-1 text-[13px] font-semibold text-ink">Mevoriq Teams</span>
            <h2 className="mt-5 text-h2">One company brand, every employee.</h2>
            <p className="mt-4 max-w-[470px] text-[17px] leading-[1.6] text-[#DCE3FF] sm:text-lg">
              Set your template, colors and company details once. Lock what must stay consistent; people edit the rest. When someone leaves, their company card goes offline and their personal cards stay theirs.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Link href="/login?next=%2Fonboarding%3Ffor%3Dbusiness" className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 font-semibold text-ink hover:bg-white/90">
                Register your company <ArrowRight className="size-4" />
              </Link>
              <Link href="/teams" className="inline-flex h-12 items-center rounded-lg px-5 font-semibold text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.4)] hover:bg-white/10">
                How Teams works
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Palette, t: "Brand presets", d: "Template and colors, set once.", cls: "bg-white text-ink", ic: "text-blue", dc: "text-muted-foreground" },
              { icon: Lock, t: "Locked fields", d: "Company details stay consistent.", cls: "bg-ink text-white", ic: "text-yellow", dc: "text-[#C4C6D2]" },
              { icon: Link2, t: "Invite by link", d: "Send one link and they join.", cls: "bg-yellow text-ink", ic: "", dc: "text-body" },
              { icon: LogOut, t: "Safe offboarding", d: "Company card off, personal cards kept.", cls: "bg-coral text-ink", ic: "", dc: "text-[#2A1410]" },
            ].map((x, i) => (
              <div key={x.t} {...reveal(i + 1, "scale")} className={`rounded-[12px] p-4 sm:rounded-[14px] sm:p-5.5 ${x.cls}`}>
                <x.icon className={`size-6 ${x.ic}`} aria-hidden />
                <p className="mt-5 text-[14px] leading-snug font-semibold break-words sm:mt-7 sm:text-[17px]">{x.t}</p>
                <p className={`mt-1 text-[13px] sm:text-sm ${x.dc}`}>{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & trust */}
      <section className="container-page section-y border-t">
        <SectionHeading eyebrow="Privacy" title="Your details, your rules" />
        <div className="mt-10 grid gap-3 sm:gap-4 md:grid-cols-3">
          {trust.map((t, i) => (
            <div key={t.title} {...reveal(i)} className="rounded-[14px] bg-fill p-6 sm:p-8">
              <span className="grid size-11 place-items-center rounded-full bg-white"><t.icon className="size-5 text-blue" aria-hidden /></span>
              <h3 className="mt-5 text-[20px] font-bold tracking-[-0.02em]">{t.title}</h3>
              <p className="mt-2 leading-normal text-body">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container-page section-y scroll-mt-24 border-t">
        <Faq />
      </section>

      <StartFreeBand />
    </>
  );
}
