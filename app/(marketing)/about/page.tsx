import type { Metadata } from "next";
import { PageHero, PrimaryCta, SecondaryCta, StartFreeBand, h2Class, reveal } from "@/components/marketing/sections";

export const metadata: Metadata = {
  title: "About",
  description: "Why we’re building Mevoriq: professional introductions and long-term connections should be easier for everyone.",
};

const values = [
  { t: "Clear, not clever", d: "Plain words, honest claims. We only describe features once they’re built and tested.", c: "bg-blue text-white", dc: "text-[#DCE3FF]" },
  { t: "Readable for everyone", d: "Accessibility isn’t an add-on. Every template is checked for contrast, every page works with a keyboard.", c: "bg-yellow text-ink", dc: "text-body" },
  { t: "Private by default", d: "We count, we don’t follow. Your visitors stay anonymous and your data stays yours.", c: "bg-coral text-ink", dc: "text-[#2A1410]" },
  { t: "Free where it matters", d: "A useful free card will always exist. If paid options come, they’ll add to it, not take from it.", c: "bg-pink text-ink", dc: "text-body" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About Mevoriq" title="Introductions should be easy. Remembering them should be too." text="We’re building a simple, beautiful way to share who you are and keep the connections you make." />

      <section className="container-page">
        <div className="grid gap-4 lg:grid-cols-2">
          <div {...reveal(0, "left")} className="rounded-[16px] sm:rounded-[12px] bg-fill p-[clamp(28px,4vw,48px)]">
            <p className="font-mono text-sm text-muted-foreground">Our mission</p>
            <p className="mt-4 text-[clamp(22px,2.2vw,30px)] leading-[1.25] font-bold tracking-[-0.02em]">
              Help anyone create, share and manage a beautiful, useful professional identity, without technical barriers.
            </p>
          </div>
          <div {...reveal(1, "right")} className="rounded-[16px] sm:rounded-[12px] bg-ink p-[clamp(28px,4vw,48px)] text-white">
            <p className="font-mono text-sm text-[#C4C6D2]">Our vision</p>
            <p className="mt-4 text-[clamp(22px,2.2vw,30px)] leading-[1.25] font-bold tracking-[-0.02em]">
              Become the friendly identity and contact-sharing layer for professionals and teams everywhere.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page pt-16 md:pt-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <h2 {...reveal(0)} className={h2Class}>Why we started</h2>
          <div {...reveal(1)} className="space-y-5 text-lg leading-[1.65] text-body">
            <p>Paper cards run out, go out of date and end up in drawers. Most digital alternatives feel like sales tools, or ask the other person to install an app.</p>
            <p>Mevoriq starts from the moment two people meet: show a card, scan it, save it. Everything else, from follow-up notes to team branding, exists to make that moment work better, and to help you remember it later.</p>
          </div>
        </div>
      </section>

      <section className="container-page pt-16 pb-6 md:pt-24">
        <h2 {...reveal(0)} className={`${h2Class} max-w-[760px]`}>What we believe</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {values.map((v, i) => (
            <div key={v.t} {...reveal(i, "tilt")} className={`rounded-[16px] p-6 sm:rounded-[12px] sm:p-8 ${v.c}`}>
              <h3 className="text-h3">{v.t}</h3>
              <p className={`mt-3 text-[17px] leading-normal ${v.dc}`}>{v.d}</p>
            </div>
          ))}
        </div>
        <div {...reveal(0)} className="mt-12 flex flex-wrap gap-3">
          <PrimaryCta />
          <SecondaryCta href="/contact">Contact us</SecondaryCta>
        </div>
      </section>

      <StartFreeBand />
    </>
  );
}
