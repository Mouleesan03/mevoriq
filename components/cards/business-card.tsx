"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import type { PublicCard } from "@/lib/cards/types";
import { getTheme, resolveAccent } from "@/lib/cards/themes";
import { cn } from "@/lib/utils";

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

/**
 * The Mevoriq signature: a real business card (3.5 × 2 in proportions) whose back is the QR code.
 * Tap or press Enter to flip. `intro` plays one flip on load (skipped with reduced motion).
 */
export function BusinessCard({
  card,
  displayUrl,
  qrSvg,
  interactive = true,
  intro = false,
  className,
}: {
  card: Pick<PublicCard, "fullName" | "headline" | "company" | "theme" | "avatarUrl" | "logoUrl" | "pronouns">;
  displayUrl: string;
  qrSvg?: string;
  interactive?: boolean;
  intro?: boolean;
  className?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const theme = getTheme(card.theme.template);
  const accent = resolveAccent(theme, card.theme.accent);
  const serif = theme.heading === "serif";
  const name = card.fullName || "Your name";
  const role = [card.headline, card.company].filter(Boolean).join(" · ");

  const face = (
    <div
      className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[14px] border p-[7%] backface-hidden"
      style={{ background: theme.face, color: theme.faceText, borderColor: theme.faceBorder }}
    >
      <div className="flex items-start justify-between gap-3">
        {card.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.avatarUrl} alt="" className="aspect-square w-[22%] max-w-[72px] min-w-11 rounded-full object-cover" style={{ aspectRatio: "1" }} />
        ) : (
          <span
            className="flex aspect-square w-[22%] max-w-[72px] min-w-11 items-center justify-center rounded-full text-[clamp(14px,4.2cqw,22px)] font-bold"
            style={{ background: accent.value, color: accent.onAccent, fontFamily: serif ? "Georgia, serif" : undefined }}
            aria-hidden
          >
            {initials(name)}
          </span>
        )}
        {card.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.logoUrl} alt="" className="h-[18%] max-h-10 max-w-[35%] object-contain" />
        ) : (
          <span className="mt-1 size-3 rounded-full bg-yellow" aria-hidden />
        )}
      </div>
      <div className="min-w-0">
        <p
          className="truncate text-[clamp(18px,7cqw,30px)] leading-[1.1] font-extrabold tracking-[-0.03em]"
          style={{ fontFamily: serif ? "Georgia, 'Times New Roman', serif" : "var(--font-display)" }}
        >
          {name}
        </p>
        {role && <p className="mt-1 truncate text-[clamp(12px,3.6cqw,15px)]" style={{ color: theme.faceMuted }}>{role}</p>}
        <p className="mt-[5%] truncate font-mono text-[clamp(10px,2.9cqw,12.5px)] tracking-tight" style={{ color: theme.faceMuted }}>
          {displayUrl}
        </p>
      </div>
    </div>
  );

  const back = (
    <div
      className="absolute inset-0 flex items-center gap-[6%] overflow-hidden rounded-[14px] border bg-white p-[7%] text-ink backface-hidden [transform:rotateY(180deg)]"
      style={{ borderColor: "#ECECF1" }}
    >
      <div className="aspect-square h-full shrink-0 [&>svg]:h-full [&>svg]:w-full">
        {qrSvg ? <div className="h-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} /> : <QrPlaceholder />}
      </div>
      <div className="min-w-0">
        <p className="text-[clamp(14px,4.4cqw,19px)] leading-tight font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Scan to save my details</p>
        <p className="mt-2 truncate font-mono text-[clamp(10px,2.7cqw,12px)] text-[#5A5C6A]">{displayUrl}</p>
      </div>
    </div>
  );

  const inner = (
    <div
      className={cn(
        "relative size-full transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] [transform-style:preserve-3d]",
        intro && "motion-safe:animate-[card-intro-flip_4.2s_ease-in-out_0.6s_1]",
      )}
      style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
    >
      {face}
      {back}
    </div>
  );

  return (
    <div className={cn("w-full [container-type:inline-size]", className)}>
      {interactive ? (
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? "Show card front" : "Show QR code"}
          aria-pressed={flipped}
          className="group block aspect-[1.75] w-full rounded-[14px] text-left perspective-card"
        >
          {inner}
        </button>
      ) : (
        <div className="aspect-[1.75] w-full perspective-card" aria-hidden>
          {inner}
        </div>
      )}
      {interactive && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs" style={{ color: "var(--card-muted, #5A5C6A)" }}>
          <RotateCw className="size-3" aria-hidden /> Tap the card to {flipped ? "see the front" : "show the QR code"}
        </p>
      )}
    </div>
  );
}

/** Deterministic QR-like pattern for previews (no real code until the card is published). */
function QrPlaceholder() {
  const cells: [number, number][] = [];
  for (let y = 0; y < 21; y++)
    for (let x = 0; x < 21; x++) {
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      if (!finder && (x * 7 + y * 13 + x * y) % 5 < 2) cells.push([x, y]);
    }
  const finderAt = (fx: number, fy: number) => (
    <g key={`${fx}-${fy}`}>
      <rect x={fx} y={fy} width="7" height="7" fill="#0F1B2D" />
      <rect x={fx + 1} y={fy + 1} width="5" height="5" fill="#fff" />
      <rect x={fx + 2} y={fy + 2} width="3" height="3" fill="#0F1B2D" />
    </g>
  );
  return (
    <svg viewBox="0 0 21 21" className="h-full w-full" shapeRendering="crispEdges" aria-hidden>
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0F1B2D" opacity="0.85" />)}
      {finderAt(0, 0)}
      {finderAt(14, 0)}
      {finderAt(0, 14)}
    </svg>
  );
}
