import "server-only";
import { ConflictError, NotFoundError } from "@/lib/data/errors";
import type { NetworkEvent } from "@/lib/data/models";
import { effectiveEnd, EVENT_MAX_HOURS, eventTag } from "@/lib/events";
import { maybe, must, supabaseAdmin } from "@/lib/supabase/server";
import { isUniqueViolation } from "@/lib/data/supabase/context";
import { toNetworkEvent } from "@/lib/data/supabase/map";

const db = () => supabaseAdmin();
const endNow = (e: NetworkEvent) => (effectiveEnd(e) < new Date().toISOString() ? effectiveEnd(e) : new Date().toISOString());

export async function liveEventOf(userId: string): Promise<NetworkEvent | null> {
  const since = new Date(Date.now() - EVENT_MAX_HOURS * 3_600_000).toISOString();
  const row = maybe(await db().from("network_events").select("*").eq("owner_user_id", userId).is("ended_at", null).gt("started_at", since).maybeSingle());
  return row ? toNetworkEvent(row) : null;
}

export async function listEvents(userId: string): Promise<NetworkEvent[]> {
  return must(await db().from("network_events").select("*").eq("owner_user_id", userId).order("started_at", { ascending: false }).limit(200)).map(toNetworkEvent);
}

export async function getEvent(userId: string, eventId: string): Promise<NetworkEvent | null> {
  if (!/^[0-9a-f-]{36}$/.test(eventId)) return null;
  const row = maybe(await db().from("network_events").select("*").eq("id", eventId).eq("owner_user_id", userId).maybeSingle());
  return row ? toNetworkEvent(row) : null;
}

/** Starts a new live event; one that is still open ends first. The partial unique index allows one open event per person. */
export async function startEvent(userId: string, name: string): Promise<NetworkEvent> {
  const open = must(await db().from("network_events").select("*").eq("owner_user_id", userId).is("ended_at", null)).map(toNetworkEvent);
  for (const e of open) must(await db().from("network_events").update({ ended_at: endNow(e) }).eq("id", e.id));
  try {
    return toNetworkEvent(must(await db().from("network_events").insert({ owner_user_id: userId, name, tag: eventTag(name) }).select("*").single()));
  } catch (err) {
    if (isUniqueViolation(err)) throw new ConflictError("Another event just started on a different device. Reload to see it.");
    throw err;
  }
}

export async function endEvent(userId: string, eventId: string): Promise<NetworkEvent> {
  const e = await getEvent(userId, eventId);
  if (!e) throw new NotFoundError("Event not found.");
  if (e.endedAt) return e;
  return toNetworkEvent(must(await db().from("network_events").update({ ended_at: endNow(e) }).eq("id", eventId).select("*").single()));
}

/** Removes the event; leads.event_id is set null by the foreign key, so contacts stay with their tag. */
export async function deleteEvent(userId: string, eventId: string): Promise<void> {
  if (!(await getEvent(userId, eventId))) throw new NotFoundError("Event not found.");
  must(await db().from("network_events").delete().eq("id", eventId));
}
