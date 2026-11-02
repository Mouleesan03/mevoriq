"use client";

import { useEffect, useRef, useState } from "react";
import { Check, QrCode } from "lucide-react";
import { THEMES, TEMPLATE_KEYS, type TemplateKey } from "@/lib/cards/themes";
import { FAN_PEOPLE, avatarFor } from "@/lib/marketing/fan";
import { useMotionOk } from "@/components/motion/scroll-reveal";
import { useScrollProgress } from "@/components/motion/use-scroll-progress";
import { cn } from "@/lib/utils";

const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

/**
 * Hero visual: a deck of business cards. The front card cycles through the templates
 * (or follows the chosen dot), and the deck tilts gently as the page scrolls.
 */
export function HeroDeck({ host }: { host: string }) {
  const [index, setIndex] = useState(TEMPLATE_KEYS.indexOf("aurora-gradient"));
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const motionOk = useMotionOk();
  const p = useScrollProgress(ref, "exit", motionOk);

  useEffect(() => {
    if (!motionOk || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % TEMPLATE_KEYS.length), 3800);
    return () => clearInterval(t);
  }, [motionOk, paused]);

  const key: TemplateKey = TEMPLATE_KEYS[index];
  const theme = THEMES[key];
  const person = FAN_PEOPLE[key];
  const avatar = avatarFor(key);
  const dark = key === "midnight-executive" || key === "aurora-gradient";

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[460px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative aspect-[1.75] w-full" style={{ transform: `translateY(${p * -40}px) rotate(${p * -4}deg)` }}>
        <div aria-hidden className="absolute inset-0 rounded-[14px] bg-coral" style={{ transform: `translate(4%, 7%) rotate(${7 + p * 6}deg)` }} />
        <div aria-hidden className="absolute inset-0 rounded-[14px] bg-yellow" style={{ transform: `translate(-2%, 4%) rotate(${-5 - p * 5}deg)` }} />
        <div
          key={key}
          className="absolute inset-0 flex flex-col rounded-[14px] p-[7%] shadow-[0_34px_60px_-26px_rgba(18,19,26,0.55)] motion-safe:animate-[deal_0.6s_cubic-bezier(.2,.9,.25,1.1)_both] [container-type:inline-size]"
          style={{ background: theme.face, color: theme.faceText, boxShadow: key === "minimal-white" ? "inset 0 0 0 2px #ECECF1, 0 34px 60px -26px rgba(18,19,26,0.45)" : undefined }}
          role="img"
          aria-label={`${theme.name} card for ${person.name}`}
        >
          <span className="flex items-center justify-between">
            <span className="grid aspect-square w-[16%] place-items-center rounded-full text-[4.2cqw] font-bold" style={{ background: avatar.value, color: avatar.onAccent }}>
              {initials(person.name)}
            </span>
            <span className="rounded-full px-[3%] py-[1.2%] text-[3cqw] font-semibold" style={{ background: dark ? "rgba(255,255,255,0.16)" : key === "minimal-white" ? "#F2F3F7" : "rgba(255,255,255,0.65)" }}>
              {theme.name}
            </span>
          </span>
          <span className="mt-auto text-[7.2cqw] leading-[1.05] font-extrabold tracking-[-0.03em]" style={{ fontFamily: theme.heading === "serif" ? "Georgia, serif" : undefined }}>{person.name}</span>
          <span className="mt-[1.5%] text-[3.6cqw] opacity-85">{person.role}</span>
          <span className="mt-[4%] font-mono text-[2.9cqw] opacity-75">{host}/u/{person.slug}</span>
        </div>

        <div className="absolute -top-5 -right-2 z-10 flex items-center gap-2 rounded-2xl bg-white py-2 pr-3.5 pl-2 shadow-[0_0_0_1px_#ECECF1,0_18px_40px_-16px_rgba(18,19,26,0.35)] sm:-right-6" style={{ transform: `translateY(${p * -30}px)` }}>
          <span className="grid size-7 place-items-center rounded-full bg-mint"><Check className="size-4 text-ink" strokeWidth={3} /></span>
          <span className="leading-tight">
            <span className="block text-[13px] font-semibold">{person.name}</span>
            <span className="block text-[11px] text-muted-foreground">Added to contacts</span>
          </span>
        </div>
        <div className="absolute -bottom-6 -left-2 z-10 flex items-center gap-2 rounded-2xl bg-ink py-2 pr-3.5 pl-2 text-white shadow-[0_18px_40px_-16px_rgba(18,19,26,0.5)] sm:-left-6" style={{ transform: `translateY(${p * 20}px)` }}>
          <span className="grid size-7 place-items-center rounded-full bg-white/15"><QrCode className="size-4" /></span>
          <span className="text-[12px] font-semibold">Scan to save</span>
        </div>
      </div>

      <div className="mt-9 flex items-center justify-center sm:mt-12" role="radiogroup" aria-label="Card template">
        {TEMPLATE_KEYS.map((k, i) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={i === index}
            aria-label={THEMES[k].name}
            onClick={() => {
              setIndex(i);
              setPaused(true);
            }}
            className="group grid h-11 place-items-center px-1.5"
          >
            <span className={cn("block h-2.5 rounded-full transition-all duration-300", i === index ? "w-7 bg-ink" : "w-2.5 bg-ink/20 group-hover:bg-ink/40")} />
          </button>
        ))}
      </div>
    </div>
  );
}
