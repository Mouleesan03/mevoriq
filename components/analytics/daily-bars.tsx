"use client";

import { useState } from "react";

/**
 * Single-series daily bar chart (views per day). One series, so no legend; the title names it.
 * Thin bars with rounded tops anchored to the baseline, recessive grid, hover tooltip per bar,
 * and an accessible table fallback.
 */
export function DailyBars({ days, values, label }: { days: string[]; values: number[]; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(4, ...values);
  const step = Math.pow(10, Math.floor(Math.log10(max))) * (max / Math.pow(10, Math.floor(Math.log10(max))) > 5 ? 2 : 1);
  const top = Math.ceil(max / step) * step;
  const ticks = [0, top / 2, top];
  const W = 720;
  const H = 220;
  const pad = { l: 32, r: 8, t: 12, b: 26 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const slot = innerW / days.length;
  const barW = Math.max(3, Math.min(28, slot - 2));
  const fmt = (d: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(new Date(`${d}T00:00:00`));
  const labelEvery = Math.ceil(days.length / 7);

  return (
    <figure className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${label} per day`} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => {
          const y = pad.t + innerH - (t / top) * innerH;
          return (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="var(--mevoriq-border)" strokeWidth={1} />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">{t}</text>
            </g>
          );
        })}
        {values.map((v, i) => {
          const h = (v / top) * innerH;
          const x = pad.l + i * slot + (slot - barW) / 2;
          const y = pad.t + innerH - h;
          const r = Math.min(4, barW / 2, h);
          return (
            <g key={days[i]} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={-1}>
              <rect x={pad.l + i * slot} y={pad.t} width={slot} height={innerH} fill="transparent" />
              {v > 0 && (
                <path
                  d={`M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${y + h} Z`}
                  fill="#2448E8"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
              {i % labelEvery === 0 && (
                <text x={pad.l + i * slot + slot / 2} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">{fmt(days[i])}</text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border bg-surface px-2.5 py-1.5 text-[12px] shadow-md"
          style={{ left: `${((pad.l + hover * slot + slot / 2) / W) * 100}%` }}
          role="status"
        >
          <span className="text-muted-foreground">{fmt(days[hover])}</span> <span className="font-semibold">{values[hover]}</span> {label.toLowerCase()}
        </div>
      )}
      <details className="mt-2 text-[13px] text-muted-foreground">
        <summary className="cursor-pointer">Show as table</summary>
        <table className="mt-2 w-full max-w-xs text-left">
          <thead><tr><th className="py-1 font-medium">Day</th><th className="py-1 text-right font-medium">{label}</th></tr></thead>
          <tbody>{days.map((d, i) => <tr key={d} className="border-t"><td className="py-1">{fmt(d)}</td><td className="py-1 text-right tabular-nums">{values[i]}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}
