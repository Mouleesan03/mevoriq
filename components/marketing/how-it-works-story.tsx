"use client";

import { useRef } from "react";
import { Check, UserPlus } from "lucide-react";
import { THEMES } from "@/lib/cards/themes";
import { FRONT_PERSON } from "@/lib/marketing/fan";
import { cn } from "@/lib/utils";
import { useScrollProgress } from "@/components/motion/use-scroll-progress";

const STEPS = [
  { title: "Show your card", text: "Open Meeting Mode, or send your link. Your QR code fills the screen.", dot: "bg-blue text-white" },
  { title: "They scan it", text: "Any phone camera works. No app to install, no account to create.", dot: "bg-yellow text-ink" },
  { title: "You’re in their contacts", text: "One tap saves a proper contact card, and they can share theirs back.", dot: "bg-coral text-ink" },
];

const face = THEMES["aurora-gradient"];

/** The card's journey for step 0 (front), 1 (flipped to QR, being scanned) and 2 (saved on a phone). */
export function StoryVisual({ step, qrSvg, host, compact = false }: { step: number; qrSvg: string; host: string; compact?: boolean }) {
  const cardTransform =
    step === 0 ? "translate(-50%,-50%) rotate(-4deg)" : step === 1 ? "translate(-50%,-50%) rotateY(180deg)" : "translate(-78%,-92%) rotate(-10deg) scale(0.62)";
  return (
    <div className={cn("relative w-full overflow-hidden rounded-[14px] bg-fill", compact ? "aspect-[4/3]" : "aspect-square max-h-[560px]")} aria-hidden>
      <div aria-hidden className="absolute -right-10 -bottom-12 h-40 w-64 rotate-12 rounded-[26px] bg-yellow/70" />
      <div aria-hidden className="absolute -top-10 -left-12 h-36 w-56 -rotate-12 rounded-[26px] bg-pink" />

      {/* scanning frame */}
      <div className={cn("absolute top-1/2 left-1/2 h-[46%] w-[78%] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500", step === 1 ? "opacity-100" : "opacity-0")}>
        {["top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl", "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl"].map((c) => (
          <span key={c} className={cn("absolute size-10 border-blue", c)} />
        ))}
        <span className="absolute inset-x-6 top-1/2 h-0.5 bg-blue/70 motion-safe:animate-pulse" />
      </div>

      {/* the card */}
      <div className="absolute top-1/2 left-1/2 aspect-[1.75] w-[66%] transition-transform duration-[900ms] ease-[cubic-bezier(.2,.9,.25,1.1)] [transform-style:preserve-3d] [perspective:1400px]" style={{ transform: cardTransform }}>
        <div className="absolute inset-0 flex flex-col rounded-[14px] p-[7%] shadow-[0_34px_60px_-26px_rgba(36,72,232,0.7)] backface-hidden" style={{ background: face.face, color: face.faceText }}>
          <span className="flex items-center justify-between">
            <span className="grid aspect-square w-[18%] place-items-center rounded-full bg-yellow text-[clamp(11px,1.4vw,16px)] font-bold text-ink">EC</span>
            <span className="size-3 rounded-full bg-yellow" />
          </span>
          <span className="mt-auto text-[clamp(16px,2.2vw,28px)] leading-none font-extrabold tracking-[-0.03em]">{FRONT_PERSON.name}</span>
          <span className="mt-1.5 text-[clamp(10px,1.1vw,14px)] opacity-85">{FRONT_PERSON.role}</span>
          <span className="mt-[5%] font-mono text-[clamp(9px,0.95vw,12px)] opacity-75">{host}/u/{FRONT_PERSON.slug}</span>
        </div>
        <div className="absolute inset-0 flex items-center gap-[6%] rounded-[14px] bg-white p-[7%] text-ink shadow-[0_34px_60px_-26px_rgba(18,19,26,0.45)] backface-hidden [transform:rotateY(180deg)]">
          <div className="aspect-square h-full shrink-0 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <span className="text-[clamp(13px,1.6vw,20px)] leading-tight font-extrabold tracking-tight">Scan to save my details</span>
        </div>
      </div>

      {/* phone with the saved contact */}
      <div
        className="absolute right-[9%] bottom-[-6%] w-[44%] rounded-[34px] bg-ink p-2 shadow-[0_40px_60px_-30px_rgba(18,19,26,0.6)] transition-all duration-[900ms] ease-[cubic-bezier(.2,.9,.25,1.1)]"
        style={{ transform: step === 2 ? "translateY(0) rotate(4deg)" : "translateY(70%) rotate(12deg)", opacity: step === 2 ? 1 : 0 }}
      >
        <div className="flex aspect-[9/14] flex-col items-center rounded-[16px] bg-white px-4 pt-6 text-center">
          <span className="grid aspect-square w-[34%] place-items-center rounded-full bg-yellow text-[clamp(12px,1.5vw,18px)] font-bold">EC</span>
          <span className="mt-3 text-[clamp(12px,1.25vw,16px)] font-extrabold tracking-tight">{FRONT_PERSON.name}</span>
          <span className="text-[clamp(9px,0.9vw,11px)] text-muted-foreground">Northstar Studio</span>
          <span className="mt-4 flex items-center gap-1.5 rounded-full bg-leaf px-3 py-1.5 text-[clamp(9px,0.9vw,12px)] font-semibold text-mint-ink">
            <Check className="size-3.5" strokeWidth={3} /> Added to contacts
          </span>
          <span className="mt-auto mb-5 flex items-center gap-1.5 rounded-full bg-blue px-3 py-1.5 text-[clamp(9px,0.9vw,12px)] font-semibold text-white">
            <UserPlus className="size-3.5" /> Share mine back
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * "How it works" as a scroll story: on large screens the visual stays pinned while the three
 * steps scroll past, and the card moves through its journey. Small screens get a simple stack.
 */
export function HowItWorksStory({ qrSvg, host }: { qrSvg: string; host: string }) {
  // The step follows how far the pinned area has scrolled: first third, second third, last third.
  const ref = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref, "through");
  const active = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));

  return (
    <>
      {/* large screens: pinned visual */}
      <div ref={ref} className="relative hidden gap-16 lg:grid lg:grid-cols-[1fr_1.1fr]">
        <ol>
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex h-[78vh] items-center">
              <div className={cn("transition-opacity duration-500", active === i ? "opacity-100" : "opacity-35")}>
                <span className={cn("inline-grid size-14 place-items-center rounded-full text-2xl font-extrabold", s.dot)}>{i + 1}</span>
                <h3 className="mt-6 text-h2">{s.title}</h3>
                <p className="mt-4 max-w-md text-lg leading-[1.55] text-body">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="sticky top-28 flex h-[calc(100vh-9rem)] items-center">
          <StoryVisual step={active} qrSvg={qrSvg} host={host} />
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden>
            {STEPS.map((s, i) => <span key={s.title} className={cn("h-2 rounded-full transition-all duration-500", active === i ? "w-8 bg-ink" : "w-2 bg-ink/20")} />)}
          </div>
        </div>
      </div>

      {/* small screens: stacked */}
      <ol className="grid gap-4 lg:hidden">
        {STEPS.map((s, i) => (
          <li key={s.title} data-reveal style={{ ["--reveal-i" as string]: i }} className="rounded-[14px] bg-fill p-5">
            <StoryVisual step={i} qrSvg={qrSvg} host={host} compact />
            <span className={cn("mt-6 inline-grid size-12 place-items-center rounded-full text-[22px] font-extrabold", s.dot)}>{i + 1}</span>
            <h3 className="mt-4 text-h3">{s.title}</h3>
            <p className="mt-2 text-[17px] leading-normal text-body">{s.text}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
