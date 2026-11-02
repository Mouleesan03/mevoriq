import "server-only";
import { mutate, newId, NotFoundError, now, read } from "@/lib/data/local/db";
import { canViewLeadsOf } from "@/lib/data/access";
import { liveEventOf } from "@/lib/data/local/events";
import type { Lead } from "@/lib/data/models";
import { CONSENT_VERSION, type LeadFilters, type LeadInput } from "@/lib/data/shared";

/** Public submission from a published card. Caller has already rate-limited and validated. */
export function createLead(cardId: string, input: LeadInput): Promise<Lead> {
  return mutate((db) => {
    const card = db.cards[cardId];
    if (!card || card.status !== "published") throw new NotFoundError("Card not found.");
    const t = now();
    const live = liveEventOf(db, card.ownerUserId);
    const lead: Lead = {
      ...input,
      id: newId(),
      cardId,
      ownerUserId: card.ownerUserId,
      organizationId: card.organizationId,
      consentVersion: CONSENT_VERSION,
      consentAt: t,
      status: "new",
      tags: live ? [live.tag] : [],
      note: "",
      followUpAt: null,
      eventId: live?.id ?? null,
      createdAt: t,
      updatedAt: t,
    };
    db.leads[lead.id] = lead;
    return lead;
  });
}

export interface LeadRow extends Lead {
  cardLabel: string;
  cardSlug: string;
}

export async function listLeads(userId: string, filters: LeadFilters = {}): Promise<LeadRow[]> {
  const db = await read();
  const q = filters.q?.trim().toLowerCase();
  return Object.values(db.leads)
    .filter((l) => {
      const card = db.cards[l.cardId];
      if (!card || !canViewLeadsOf(db, userId, card)) return false;
      if (filters.status && filters.status !== "all" ? l.status !== filters.status : l.status === "archived") return false;
      if (filters.cardId && l.cardId !== filters.cardId) return false;
      if (q && ![l.name, l.email, l.company, l.message, ...l.tags].some((v) => v.toLowerCase().includes(q))) return false;
      return true;
    })
    .map((l) => ({ ...l, eventId: l.eventId ?? null, cardLabel: db.cards[l.cardId].label, cardSlug: db.cards[l.cardId].slug }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getLead(userId: string, leadId: string): Promise<LeadRow | null> {
  const db = await read();
  const lead = db.leads[leadId];
  const card = lead && db.cards[lead.cardId];
  if (!lead || !card || !canViewLeadsOf(db, userId, card)) return null;
  return { ...lead, eventId: lead.eventId ?? null, cardLabel: card.label, cardSlug: card.slug };
}

export function updateLead(userId: string, leadId: string, patch: Partial<Pick<Lead, "status" | "tags" | "note" | "followUpAt">>): Promise<Lead> {
  return mutate((db) => {
    const lead = db.leads[leadId];
    const card = lead && db.cards[lead.cardId];
    if (!lead || !card || !canViewLeadsOf(db, userId, card)) throw new NotFoundError("Contact not found.");
    const next = { ...lead, ...patch, updatedAt: now() };
    db.leads[leadId] = next;
    return next;
  });
}

export function deleteLead(userId: string, leadId: string): Promise<void> {
  return mutate((db) => {
    const lead = db.leads[leadId];
    const card = lead && db.cards[lead.cardId];
    if (!lead || !card || !canViewLeadsOf(db, userId, card)) throw new NotFoundError("Contact not found.");
    delete db.leads[leadId];
  });
}

export async function newLeadCount(userId: string) {
  return (await listLeads(userId, { status: "new" })).length;
}
