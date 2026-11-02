import "server-only";
import { cardAccess } from "@/lib/data/access";
import { buildInsights, buildSourceCounts, insightsStart, utcDay, type Insights, type SourceCount } from "@/lib/data/insights";
import type { QrSource } from "@/lib/cards/sources";
import type { EventType } from "@/lib/data/models";
import { must, supabaseAdmin } from "@/lib/supabase/server";
import { accessCtx } from "@/lib/data/supabase/context";
import { toCard } from "@/lib/data/supabase/map";

/** Daily counter upsert in the database (record_card_event). */
export async function recordEvent(cardId: string, type: EventType): Promise<void> {
  must(await supabaseAdmin().rpc("record_card_event", { p_card_id: cardId, p_type: type }));
}

export async function recordSourceView(cardId: string, source: QrSource): Promise<void> {
  must(await supabaseAdmin().rpc("record_card_source", { p_card_id: cardId, p_source: source }));
}

async function ownedCardIds(userId: string, cardId?: string): Promise<string[]> {
  const ctx = await accessCtx(userId);
  let q = supabaseAdmin().from("cards").select("*").eq("owner_user_id", userId);
  if (cardId) q = q.eq("id", cardId);
  return must(await q).map(toCard).filter((c) => cardAccess(ctx, userId, c) === "owner").map((c) => c.id);
}

export async function getSourceCounts(userId: string, range: 7 | 30 | 90, cardId?: string): Promise<SourceCount[]> {
  const ids = await ownedCardIds(userId, cardId);
  if (!ids.length) return [];
  const from = utcDay(new Date(Date.now() - (range - 1) * 86_400_000));
  const rows = must(await supabaseAdmin().from("card_source_daily").select("card_id, event_date, source, count").in("card_id", ids).gte("event_date", from));
  return buildSourceCounts(ids, rows.map((r) => ({ cardId: r.card_id, date: r.event_date, source: r.source as QrSource, count: r.count })), range);
}

export async function getInsights(userId: string, range: 7 | 30 | 90, cardId?: string): Promise<Insights> {
  const db = supabaseAdmin();
  const ctx = await accessCtx(userId);
  let q = db.from("cards").select("*").eq("owner_user_id", userId);
  if (cardId) q = q.eq("id", cardId);
  const cards = must(await q).map(toCard).filter((c) => cardAccess(ctx, userId, c) === "owner");
  if (!cards.length) return buildInsights([], [], range);
  const rows = must(
    await db.from("card_event_daily").select("card_id, event_date, event_type, count").in("card_id", cards.map((c) => c.id)).gte("event_date", insightsStart(range)),
  );
  return buildInsights(
    cards,
    rows.map((r) => ({ cardId: r.card_id, date: r.event_date, type: r.event_type as EventType, count: r.count })),
    range,
  );
}
