"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { BusinessCard } from "@/components/cards/business-card";
import { THEMES, TEMPLATE_KEYS, resolveAccent, type TemplateKey } from "@/lib/cards/themes";
import { FAN_PEOPLE } from "@/lib/marketing/fan";
import { cn } from "@/lib/utils";

/** Try every template and accent on a live, flippable card. */
export function TemplatePlayground({ host, qrSvg }: { host: string; qrSvg: string }) {
  const [template, setTemplate] = useState<TemplateKey>("aurora-gradient");
  const [accent, setAccent] = useState(THEMES["aurora-gradient"].accents[0].value);
  const theme = THEMES[template];
  const person = FAN_PEOPLE[template];
  const current = resolveAccent(theme, accent).value;

  return (
    <div className="grid items-center gap-8 rounded-[16px] p-5 sm:gap-12 sm:rounded-[14px] sm:p-10 lg:p-14 transition-colors duration-500 lg:grid-cols-[1.1fr_1fr]" style={{ background: theme.page }}>
      <div className="mx-auto w-full max-w-[460px]">
        <BusinessCard
          key={template + current}
          intro
          qrSvg={qrSvg}
          displayUrl={`${host}/u/${person.slug}`}
          card={{ fullName: person.name, pronouns: "", headline: person.role.split(", ")[0], company: person.role.split(", ")[1] ?? "", theme: { template, accent: current }, avatarUrl: null, logoUrl: null }}
        />
      </div>
      <div className="rounded-[14px] bg-white p-5 sm:rounded-[12px] sm:p-7 shadow-[0_30px_60px_-36px_rgba(18,19,26,0.4)]">
        <p className="text-sm font-semibold">Template</p>
        <div role="radiogroup" aria-label="Template" className="mt-3 flex flex-wrap gap-2">
          {TEMPLATE_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={template === k}
              onClick={() => {
                setTemplate(k);
                setAccent(THEMES[k].accents[0].value);
              }}
              className={cn("flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors", template === k ? "bg-ink text-white" : "bg-fill hover:bg-[#E7E8EE]")}
            >
              <span className="size-3.5 rounded-full ring-1 ring-black/10" style={{ background: THEMES[k].face }} /> {THEMES[k].name}
            </button>
          ))}
        </div>
        <p className="mt-7 text-sm font-semibold">Accent</p>
        <div role="radiogroup" aria-label="Accent" className="mt-3 flex flex-wrap gap-2.5">
          {theme.accents.map((a) => (
            <button
              key={a.value}
              type="button"
              role="radio"
              aria-checked={current === a.value}
              aria-label={a.name}
              title={a.name}
              onClick={() => setAccent(a.value)}
              className={cn("grid size-11 place-items-center rounded-full ring-offset-2 transition-shadow", current === a.value && "ring-2 ring-ink")}
              style={{ background: a.value, color: a.onAccent }}
            >
              {current === a.value && <Check className="size-4" />}
            </button>
          ))}
        </div>
        <p className="mt-7 text-[15px] leading-normal text-body">{theme.description} Tap the card to see its QR side.</p>
      </div>
    </div>
  );
}
