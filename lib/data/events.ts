import "server-only";
import { pick } from "@/lib/data/backend";
import * as local from "@/lib/data/local/events";
import * as remote from "@/lib/data/supabase/events";
import { listLeads, updateLead, type LeadRow } from "@/lib/data/leads";
import type { NetworkEvent } from "@/lib/data/models";
import { effectiveEnd, isLive } from "@/lib/events";

/** Event Mode data access. Backends store events; counts and recaps are built here from the contacts the person may see. */
export const startEvent = ((...args: Parameters<typeof local.startEvent>) => (pick(local, remote).startEvent as typeof local.startEvent)(...args)) as typeof local.startEvent;
export const endEvent = ((...args: Parameters<typeof local.endEvent>) => (pick(local, remote).endEvent as typeof local.endEvent)(...args)) as typeof local.endEvent;
export const deleteEvent = ((...args: Parameters<typeof local.deleteEvent>) => (pick(local, remote).deleteEvent as typeof local.deleteEvent)(...args)) as typeof local.deleteEvent;
export const getEvent = ((...args: Parameters<typeof local.getEvent>) => (pick(local, remote).getEvent as typeof local.getEvent)(...args)) as typeof local.getEvent;
const listRaw = ((...args: Parameters<typeof local.listEvents>) => (pick(local, remote).listEvents as typeof local.listEvents)(...args)) as typeof local.listEvents;

export interface EventSummary extends NetworkEvent {
  live: boolean;
  endsAt: string;
  contactCount: number;
}

const summarize = (e: NetworkEvent, contactCount: number): EventSummary => ({ ...e, live: isLive(e), endsAt: effectiveEnd(e), contactCount });

async function allLeads(userId: string): Promise<LeadRow[]> {
  const [active, archived] = await Promise.all([listLeads(userId, { status: "all" }), listLeads(userId, { status: "archived" })]);
  return [...active, ...archived];
}

export async function listEvents(userId: string): Promise<EventSummary[]> {
  const [events, leads] = await Promise.all([listRaw(userId), allLeads(userId)]);
  const counts = new Map<string, number>();
  for (const l of leads) if (l.eventId) counts.set(l.eventId, (counts.get(l.eventId) ?? 0) + 1);
  return events.map((e) => summarize(e, counts.get(e.id) ?? 0));
}

export async function getLiveEvent(userId: string): Promise<EventSummary | null> {
  return (await listEvents(userId)).find((e) => e.live) ?? null;
}

export async function getEventRecap(userId: string, eventId: string): Promise<{ event: EventSummary; leads: LeadRow[] } | null> {
  const [event, leads] = await Promise.all([getEvent(userId, eventId), allLeads(userId)]);
  if (!event) return null;
  const met = leads.filter((l) => l.eventId === event.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return { event: summarize(event, met.length), leads: met };
}

/** Puts every new, unscheduled contact from the event on the follow-up list for `date`. Returns how many changed. */
export async function followUpEventContacts(userId: string, eventId: string, date: string): Promise<number> {
  const recap = await getEventRecap(userId, eventId);
  if (!recap) return 0;
  const todo = recap.leads.filter((l) => l.status === "new" && !l.followUpAt);
  for (const l of todo) await updateLead(userId, l.id, { status: "following_up", followUpAt: date });
  return todo.length;
}
