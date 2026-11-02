import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { DailyBars } from "@/components/analytics/daily-bars";
import { PageHeader } from "@/components/site/app-shell";
import { PageLoading } from "@/components/site/page-loading";
import { requireUser } from "@/lib/auth/session";
import { getInsights, getSourceCounts } from "@/lib/data/analytics";
import { listCards } from "@/lib/data/cards";
import type { EventType } from "@/lib/data/models";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Insights" };

const TILES: { type: EventType; label: string }[] = [
  { type: "view", label: "Views" },
  { type: "unique_view", label: "Visitors (est.)" },
  { type: "save_contact", label: "Saved to contacts" },
  { type: "link_click", label: "Link clicks" },
  { type: "exchange", label: "Shared back" },
  { type: "qr_download", label: "QR downloads" },
];

async function Insights({ searchParams }: { searchParams: PageProps<"/app/analytics">["searchParams"] }) {
  const sp = await searchParams;
  const range = ([7, 30, 90] as const).find((r) => String(r) === sp.range) ?? 30;
  const user = await requireUser();
  const cards = await listCards(user.id);
  const cardId = typeof sp.card === "string" && cards.some((c) => c.id === sp.card) ? sp.card : undefined;
  const [data, sources] = await Promise.all([getInsights(user.id, range, cardId), getSourceCounts(user.id, range, cardId)]);
  const topSource = Math.max(1, ...sources.map((s) => s.views));
  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams({ range: String(range), ...(cardId && { card: cardId }) });
    for (const [k, v] of Object.entries(patch)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    return `/app/analytics?${p}`;
  };

  return (
    <>
      <PageHeader title="Insights" description="Daily counts only. We don’t record who visited, where they were, or which device they used." />

      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center">
        <nav aria-label="Date range" className="flex w-fit gap-1 rounded-full bg-muted p-1">
          {[7, 30, 90].map((r) => (
            <Link key={r} href={href({ range: String(r) })} aria-current={range === r ? "page" : undefined} className={cn("rounded-full px-3.5 py-1.5 text-[13px]", range === r ? "bg-surface font-medium shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {r} days
            </Link>
          ))}
        </nav>
        {cards.length > 1 && (
          <nav aria-label="Card" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            <Link href={href({ card: undefined })} className={cn("shrink-0 rounded-full border px-3.5 py-2 text-[13px] whitespace-nowrap", !cardId ? "border-navy bg-navy text-white" : "hover:bg-muted")}>All cards</Link>
            {cards.map((c) => (
              <Link key={c.id} href={href({ card: c.id })} className={cn("shrink-0 rounded-full border px-3.5 py-2 text-[13px] whitespace-nowrap", cardId === c.id ? "border-navy bg-navy text-white" : "hover:bg-muted")}>{c.label}</Link>
            ))}
          </nav>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border bg-border sm:grid-cols-3 lg:grid-cols-6">
        {TILES.map((t) => {
          const now = data.totals[t.type];
          const prev = data.previousTotals[t.type];
          const delta = prev === 0 ? null : Math.round(((now - prev) / prev) * 100);
          return (
            <div key={t.type} className="bg-surface px-4 py-3.5 sm:px-5 sm:py-4">
              <dt className="text-[13px] text-muted-foreground">{t.label}</dt>
              <dd className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl">{now}</span>
                {delta !== null && delta !== 0 && (
                  <span className={cn("inline-flex items-center text-[12px] font-medium", delta > 0 ? "text-mint-ink" : "text-muted-foreground")}>
                    {delta > 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                    {Math.abs(delta)}%<span className="sr-only"> vs previous {range} days</span>
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="mt-2 text-[12px] text-muted-foreground">Change compared with the previous {range} days. Your own visits and known bots aren’t counted.</p>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-bold">Views per day</h2>
        <div className="rounded-[14px] border bg-surface p-4 sm:p-6">
          <DailyBars days={data.days} values={data.series.view} label="Views" />
        </div>
      </section>

      <section className="mt-12" aria-labelledby="sources-heading">
        <h2 id="sources-heading" className="text-lg font-bold">Where scans come from</h2>
        <p className="mt-1 mb-4 text-[14px] text-muted-foreground">Views from your labelled QR codes in the last {range} days. Other views come from plain links and Meeting Mode.</p>
        {sources.length === 0 ? (
          <p className="rounded-2xl border border-dashed px-5 py-8 text-sm text-muted-foreground">
            No labelled scans yet. Download a QR for print, badges or slides from a card’s{" "}
            <Link href={cards[0] ? `/app/cards/${cards[0].id}/share` : "/app/cards"} className="font-medium text-foreground underline underline-offset-4">Share page</Link>.
          </p>
        ) : (
          <ul className="space-y-3 rounded-[14px] border bg-surface p-4 sm:p-6">
            {sources.map((s) => (
              <li key={s.source} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-[14px] sm:grid-cols-[12rem_1fr_auto]">
                <span className="truncate font-medium">{s.label}</span>
                <span className="h-3 overflow-hidden rounded-full bg-fill" aria-hidden>
                  <span className="block h-full rounded-full bg-blue" style={{ width: `${(s.views / topSource) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums">{s.views}<span className="sr-only"> views</span></span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!cardId && data.byCard.length > 1 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold">By card</h2>
          <div className="overflow-x-auto rounded-[14px] border bg-surface">
            <table className="w-full text-left text-[14px]">
              <thead className="border-b text-[13px] text-muted-foreground">
                <tr><th className="px-5 py-3 font-medium">Card</th><th className="px-5 py-3 text-right font-medium">Views</th><th className="px-5 py-3 text-right font-medium">Saved</th><th className="px-5 py-3 text-right font-medium">Shared back</th></tr>
              </thead>
              <tbody className="divide-y">
                {data.byCard.map((c) => (
                  <tr key={c.cardId}>
                    <td className="px-5 py-3"><Link href={href({ card: c.cardId })} className="font-medium hover:underline">{c.label}</Link><span className="ml-2 font-mono text-[12px] text-muted-foreground">/u/{c.slug}</span></td>
                    <td className="px-5 py-3 text-right tabular-nums">{c.views}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{c.saves}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{c.exchanges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

export default function AnalyticsPage({ searchParams }: PageProps<"/app/analytics">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Insights searchParams={searchParams} />
    </Suspense>
  );
}
