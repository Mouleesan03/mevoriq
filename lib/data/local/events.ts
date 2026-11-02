import "server-only";
import { mutate, newId, NotFoundError, now, read, type DB } from "@/lib/data/local/db";
import type { NetworkEvent } from "@/lib/data/models";
import { effectiveEnd, eventTag, isLive } from "@/lib/events";

export function liveEventOf(db: DB, userId: string): NetworkEvent | null {
  return Object.values(db.networkEvents).find((e) => e.ownerUserId === userId && isLive(e)) ?? null;
}

export async function listEvents(userId: string): Promise<NetworkEvent[]> {
  const db = await read();
  return Object.values(db.networkEvents)
    .filter((e) => e.ownerUserId === userId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function getEvent(userId: string, eventId: string): Promise<NetworkEvent | null> {
  const e = (await read()).networkEvents[eventId];
  return e && e.ownerUserId === userId ? e : null;
}

/** Starts a new live event; one that is still open ends first. */
export function startEvent(userId: string, name: string): Promise<NetworkEvent> {
  return mutate((db) => {
    for (const e of Object.values(db.networkEvents)) {
      if (e.ownerUserId === userId && !e.endedAt) e.endedAt = effectiveEnd(e) < now() ? effectiveEnd(e) : now();
    }
    const t = now();
    const event: NetworkEvent = { id: newId(), ownerUserId: userId, name, tag: eventTag(name), startedAt: t, endedAt: null, createdAt: t };
    db.networkEvents[event.id] = event;
    return event;
  });
}

export function endEvent(userId: string, eventId: string): Promise<NetworkEvent> {
  return mutate((db) => {
    const e = db.networkEvents[eventId];
    if (!e || e.ownerUserId !== userId) throw new NotFoundError("Event not found.");
    if (!e.endedAt) e.endedAt = effectiveEnd(e) < now() ? effectiveEnd(e) : now();
    return e;
  });
}

/** Removes the event; its contacts stay (with their tag), just no longer linked. */
export function deleteEvent(userId: string, eventId: string): Promise<void> {
  return mutate((db) => {
    const e = db.networkEvents[eventId];
    if (!e || e.ownerUserId !== userId) throw new NotFoundError("Event not found.");
    for (const l of Object.values(db.leads)) if (l.eventId === eventId) l.eventId = null;
    delete db.networkEvents[eventId];
  });
}
