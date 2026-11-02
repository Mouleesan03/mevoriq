import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { THEMES, TEMPLATE_KEYS } from "@/lib/cards/themes";
import { FAN_PEOPLE, avatarFor } from "@/lib/marketing/fan";
import { cn } from "@/lib/utils";

/** Shared building blocks for marketing pages (bright design, mobile first). */

export const h2Class = "text-h2";

export const reveal = (i = 0, kind?: "left" | "right" | "scale" | "tilt") => ({ "data-reveal": kind ?? "", style: { "--reveal-i": i } as CSSProperties });

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("inline-flex items-center gap-2 rounded-full bg-cream px-3.5 py-1.5 text-[13px] font-semibold sm:text-sm", className)}>{children}</p>;
}

export function SectionHeading({ eyebrow, title, text, align = "left", className }: { eyebrow?: string; title: ReactNode; text?: ReactNode; align?: "left" | "center"; className?: string }) {
  return (
    <div className={cn("max-w-[720px]", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p {...reveal(0)} className="text-sm font-semibold text-blue">{eyebrow}</p>}
      <h2 {...reveal(1)} className="mt-3 text-h2">{title}</h2>
      {text && <p {...reveal(2)} className="mt-4 text-lead">{text}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, text, children }: { eyebrow?: string; title: ReactNode; text?: ReactNode; children?: ReactNode }) {
  return (
    <section className="container-page pt-10 pb-10 text-center sm:pt-16 sm:pb-14 lg:pt-20">
      {eyebrow && <div {...reveal(0)}><Eyebrow>{eyebrow}</Eyebrow></div>}
      <h1 {...reveal(1)} className="mx-auto mt-5 max-w-[860px] text-display">{title}</h1>
      {text && <p {...reveal(2)} className="mx-auto mt-5 max-w-[620px] text-lead">{text}</p>}
      {children && <div {...reveal(3)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">{children}</div>}
    </section>
  );
}

const ctaBase = "group inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-[16px] font-semibold transition-colors sm:h-13 sm:px-7";

export function PrimaryCta({ href = "/login", children = "Create your free card", className }: { href?: string; children?: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn(ctaBase, "bg-blue text-white shadow-cta hover:bg-blue-deep", className)}>
      {children}
      <ChevronRight className="-mr-1 size-4 transition-transform group-hover:translate-x-1" aria-hidden />
    </Link>
  );
}

export function SecondaryCta({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn(ctaBase, "bg-white text-ink shadow-[inset_0_0_0_2px_var(--mevoriq-border)] hover:shadow-[inset_0_0_0_2px_var(--mevoriq-navy)]", className)}>
      {children}
    </Link>
  );
}

/** Template cards: a swipeable row on phones, a grid from tablets up. */
export function TemplateGallery({ withLinks = false }: { withLinks?: boolean }) {
  return (
    <ul className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 md:grid-cols-3 lg:grid-cols-5">
      {TEMPLATE_KEYS.map((key, i) => {
        const t = THEMES[key];
        const p = FAN_PEOPLE[key];
        return (
          <li key={key} {...reveal(i, "tilt")} className="w-[72%] shrink-0 snap-start sm:w-auto">
            <div
              className="flex aspect-[1.6] flex-col rounded-[12px] p-4 transition-transform duration-300 hover:-translate-y-1"
              style={{ background: t.face, color: t.faceText, boxShadow: key === "minimal-white" ? "inset 0 0 0 2px #ECECF1" : "0 24px 40px -28px rgba(18,19,26,0.5)" }}
            >
              <span className="size-8 rounded-full" style={{ background: avatarFor(key).value }} />
              <span className="mt-auto text-lg font-extrabold tracking-[-0.02em]" style={{ fontFamily: t.heading === "serif" ? "Georgia, serif" : undefined }}>{p.name}</span>
            </div>
            <p className="mt-3 font-semibold">{t.name}</p>
            <p className="mt-0.5 text-[14px] text-muted-foreground">{t.description}</p>
          </li>
        );
      })}
      {withLinks && (
        <li className="w-[72%] shrink-0 snap-start sm:hidden">
          <Link href="/templates" className="flex aspect-[1.6] items-center justify-center gap-2 rounded-[12px] bg-fill font-semibold text-ink">
            Try them live <ArrowRight className="size-4" />
          </Link>
        </li>
      )}
    </ul>
  );
}

export const FAQS: { q: string; a: string }[] = [
  { q: "Is Mevoriq really free?", a: "Yes. Everything we’ve launched is free during early access, including teams. We’ll always keep a useful free card, and if we add paid options later, we’ll announce what changes well in advance." },
  { q: "Do people need an app to save my card?", a: "No. Your card opens in any phone browser. They tap “Save contact” and your details go straight into their contacts." },
  { q: "What happens to my QR code if my details change?", a: "Nothing — it keeps working. Edit your card any time; even if you change your card address, the old address redirects to the new one." },
  { q: "Can I have more than one card?", a: "Yes. Make one for work, one for freelance projects or one for an event. Each has its own link and QR code." },
  { q: "What do you track about people who view my card?", a: "Only daily counts: views, saves, link clicks and shared-back contacts. We don’t record names, locations or devices of visitors." },
  { q: "Can I download or delete my data?", a: "Yes. In Settings you can download everything we store about you, export your contacts as CSV, or delete your account." },
];

export function Faq() {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div>
        <p {...reveal(0)} className="text-sm font-semibold text-blue">FAQ</p>
        <h2 {...reveal(1)} className="mt-3 text-h2">Questions, answered</h2>
        <p {...reveal(2)} className="mt-4 max-w-sm text-lead">
          Something else? <Link href="/contact" className="font-semibold text-blue hover:underline">Get in touch</Link>.
        </p>
      </div>
      <div className="space-y-2.5">
        {FAQS.map((f, i) => (
          <details key={f.q} {...reveal(i)} className="group rounded-[12px] bg-fill px-5 py-4 open:bg-sky/60 sm:rounded-[14px] sm:px-6 sm:py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold sm:text-[17px] [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-xl leading-none transition-transform group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="mt-3 text-[15px] leading-[1.65] text-body sm:text-base">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export function StartFreeBand() {
  return (
    <section className="container-page pt-6 pb-4">
      <div {...reveal(0, "scale")} className="relative overflow-hidden rounded-[12px] bg-pink px-6 py-14 text-center sm:rounded-[14px] sm:py-20 lg:py-24">
        <div aria-hidden className="absolute -bottom-12 -left-12 h-24 w-40 -rotate-[14deg] rounded-[12px] bg-yellow sm:-bottom-15 sm:-left-10 sm:h-[136px] sm:w-[220px] sm:rounded-[14px]" />
        <div aria-hidden className="absolute -top-10 -right-12 h-24 w-40 rotate-12 rounded-[12px] bg-blue sm:-top-10 sm:-right-8 sm:h-[136px] sm:w-[220px] sm:rounded-[14px]" />
        <h2 className="relative text-[44px] leading-none font-extrabold tracking-[-0.035em] sm:text-[64px] lg:text-[80px]">Starting free.</h2>
        <p className="relative mx-auto mt-5 max-w-[540px] text-lead">
          Everything we’ve launched is free during early access, teams included. We’ll always keep a useful free card.
        </p>
        <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/login" className={cn(ctaBase, "w-full bg-ink text-white hover:bg-ink/85 sm:w-auto")}>Create your free card</Link>
          <Link href="/login?next=%2Fonboarding%3Ffor%3Dbusiness" className={cn(ctaBase, "w-full bg-white/70 text-ink hover:bg-white sm:w-auto")}>Register a company</Link>
        </div>
      </div>
    </section>
  );
}
