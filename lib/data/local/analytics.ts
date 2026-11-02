import "server-only";
import { mutate, read } from "@/lib/data/local/db";
import { cardAccess } from "@/lib/data/access";
import type { EventType } from "@/lib/data/models";
import { buildInsights, buildSourceCounts, type Insights, type SourceCount } from "@/lib/data/insights";
import type { QrSource } from "@/lib/cards/sources";

/**
 * Privacy-aware analytics: only daily counts per card and event type.
 * No IPs, no visitor identifiers, no locations are stored (docs/product-plan.md AN-04).
 */
const day = (d = new Date()) => d.toISOString().slice(0, 10);

export function recordEvent(cardId: string, type: EventType): Promise<void> {
  return mutate((db) => {
    if (!db.cards[cardId]) return;
    const key = `${cardId}|${day()}|${type}`;
    db.events[key] = (db.events[key] ?? 0) + 1;
  });
}

export function recordSourceView(cardId: string, source: QrSource): Promise<void> {
  return mutate((db) => {
    if (!db.cards[cardId]) return;
    const key = `${cardId}|${day()}|${source}`;
    db.sourceViews[key] = (db.sourceViews[key] ?? 0) + 1;
  });
}

export type { Insights, SourceCount } from "@/lib/data/insights";

/** Aggregates the user's own cards (or one card) over the last `range` days, plus the period before for comparison. */
export async function getInsights(userId: string, range: 7 | 30 | 90, cardId?: string): Promise<Insights> {
  const db = await read();
  const cards = Object.values(db.cards).filter((c) => cardAccess(db, userId, c) === "owner" && (!cardId || c.id === cardId));
  const events = Object.entries(db.events).map(([key, count]) => {
    const [cid, date, type] = key.split("|") as [string, string, EventType];
    return { cardId: cid, date, type, count };
  });
  return buildInsights(cards, events, range);
}

export async function getSourceCounts(userId: string, range: 7 | 30 | 90, cardId?: string): Promise<SourceCount[]> {
  const db = await read();
  const ids = Object.values(db.cards).filter((c) => cardAccess(db, userId, c) === "owner" && (!cardId || c.id === cardId)).map((c) => c.id);
  const rows = Object.entries(db.sourceViews).map(([key, count]) => {
    const [cid, date, source] = key.split("|") as [string, string, QrSource];
    return { cardId: cid, date, source, count };
  });
  return buildSourceCounts(ids, rows, range);
}
