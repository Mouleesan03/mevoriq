import { EVENT_TYPES, type EventType } from "@/lib/data/models";
import { QR_SOURCES, type QrSource } from "@/lib/cards/sources";

export interface Insights {
  days: string[];
  series: Record<EventType, number[]>;
  totals: Record<EventType, number>;
  previousTotals: Record<EventType, number>;
  byCard: { cardId: string; label: string; slug: string; views: number; saves: number; exchanges: number }[];
}

export const utcDay = (d = new Date()) => d.toISOString().slice(0, 10);

/** First day (UTC) of the comparison window: the period of equal length before the current range. */
export const insightsStart = (range: number, today = new Date()) => utcDay(new Date(today.getTime() - (2 * range - 1) * 86_400_000));

/** Turns daily counts into chart series, totals and the previous-period comparison. Pure, so both backends share it. */
export function buildInsights(
  cards: { id: string; label: string; slug: string }[],
  events: { cardId: string; date: string; type: EventType; count: number }[],
  range: 7 | 30 | 90,
  today = new Date(),
): Insights {
  const ids = new Set(cards.map((c) => c.id));
  const days: string[] = [];
  for (let i = range - 1; i >= 0; i--) days.push(utcDay(new Date(today.getTime() - i * 86_400_000)));
  const prevStart = insightsStart(range, today);
  const index = new Map(days.map((d, i) => [d, i]));

  const zero = () => Object.fromEntries(EVENT_TYPES.map((t) => [t, 0])) as Record<EventType, number>;
  const series = Object.fromEntries(EVENT_TYPES.map((t) => [t, days.map(() => 0)])) as Record<EventType, number[]>;
  const totals = zero();
  const previousTotals = zero();
  const perCard = new Map<string, Record<EventType, number>>();

  for (const e of events) {
    if (!ids.has(e.cardId)) continue;
    const i = index.get(e.date);
    if (i !== undefined) {
      series[e.type][i] += e.count;
      totals[e.type] += e.count;
      const pc = perCard.get(e.cardId) ?? zero();
      pc[e.type] += e.count;
      perCard.set(e.cardId, pc);
    } else if (e.date >= prevStart && e.date < days[0]) {
      previousTotals[e.type] += e.count;
    }
  }

  const byCard = cards
    .map((c) => {
      const pc = perCard.get(c.id) ?? zero();
      return { cardId: c.id, label: c.label, slug: c.slug, views: pc.view, saves: pc.save_contact, exchanges: pc.exchange };
    })
    .sort((a, b) => b.views - a.views);

  return { days, series, totals, previousTotals, byCard };
}

export interface SourceCount {
  source: QrSource;
  label: string;
  views: number;
}

/** Views per QR source label in the last `range` days, busiest first; sources with no views are left out. */
export function buildSourceCounts(
  cardIds: string[],
  rows: { cardId: string; date: string; source: QrSource; count: number }[],
  range: number,
  today = new Date(),
): SourceCount[] {
  const ids = new Set(cardIds);
  const from = utcDay(new Date(today.getTime() - (range - 1) * 86_400_000));
  const totals = new Map<QrSource, number>();
  for (const r of rows) if (ids.has(r.cardId) && r.date >= from) totals.set(r.source, (totals.get(r.source) ?? 0) + r.count);
  return QR_SOURCES.map((s) => ({ source: s.key, label: s.label, views: totals.get(s.key) ?? 0 }))
    .filter((s) => s.views > 0)
    .sort((a, b) => b.views - a.views);
}
