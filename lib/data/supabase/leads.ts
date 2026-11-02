import "server-only";
import type { Card } from "@/lib/cards/types";
import { canViewLeadsOf, isOrgAdmin } from "@/lib/data/access";
import { NotFoundError } from "@/lib/data/errors";
import type { Lead } from "@/lib/data/models";
import type { LeadRow } from "@/lib/data/local/leads";
import { CONSENT_VERSION, type LeadFilters, type LeadInput } from "@/lib/data/shared";
import { maybe, must, supabaseAdmin } from "@/lib/supabase/server";
import { accessCtx } from "@/lib/data/supabase/context";
import { liveEventOf } from "@/lib/data/supabase/events";
import { toCard, toLead } from "@/lib/data/supabase/map";

const db = () => supabaseAdmin();

export async function createLead(cardId: string, input: LeadInput): Promise<Lead> {
  const card = maybe(await db().from("cards").select("id, owner_user_id, organization_id, status").eq("id", cardId).maybeSingle());
  if (!card || card.status !== "published") throw new NotFoundError("Card not found.");
  const live = await liveEventOf(card.owner_user_id);
  const row = must(
    await db()
      .from("leads")
      .insert({
        card_id: cardId,
        owner_user_id: card.owner_user_id,
        organization_id: card.organization_id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        message: input.message,
        marketing_consent: input.marketingConsent,
        consent_version: CONSENT_VERSION,
        consent_at: new Date().toISOString(),
        tags: live ? [live.tag] : [],
        event_id: live?.id ?? null,
      })
      .select("*")
      .single(),
  );
  return toLead(row);
}

/** Leads the user may see: their own, plus company-card leads from orgs that enabled admin access. */
async function visibleLeads(userId: string): Promise<{ leads: Lead[]; cards: Map<string, Card> }> {
  const ctx = await accessCtx(userId);
  const sharedOrgs = Object.values(ctx.organizations)
    .filter((o) => o.brand.adminsCanViewLeads && isOrgAdmin(ctx.memberships.find((m) => m.organizationId === o.id)?.role ?? null))
    .map((o) => o.id);
  const filter = sharedOrgs.length ? `owner_user_id.eq.${userId},organization_id.in.(${sharedOrgs.join(",")})` : `owner_user_id.eq.${userId}`;
  const leads = must(await db().from("leads").select("*").or(filter).order("created_at", { ascending: false }).limit(2000)).map(toLead);
  const cardIds = [...new Set(leads.map((l) => l.cardId))];
  const cards = cardIds.length ? must(await db().from("cards").select("*").in("id", cardIds)).map(toCard) : [];
  const byId = new Map(cards.map((c) => [c.id, c]));
  return { leads: leads.filter((l) => byId.has(l.cardId) && canViewLeadsOf(ctx, userId, byId.get(l.cardId)!)), cards: byId };
}

export async function listLeads(userId: string, filters: LeadFilters = {}): Promise<LeadRow[]> {
  const { leads, cards } = await visibleLeads(userId);
  const q = filters.q?.trim().toLowerCase();
  return leads
    .filter((l) => {
      if (filters.status && filters.status !== "all" ? l.status !== filters.status : l.status === "archived") return false;
      if (filters.cardId && l.cardId !== filters.cardId) return false;
      if (q && ![l.name, l.email, l.company, l.message, ...l.tags].some((v) => v.toLowerCase().includes(q))) return false;
      return true;
    })
    .map((l) => ({ ...l, cardLabel: cards.get(l.cardId)!.label, cardSlug: cards.get(l.cardId)!.slug }));
}

async function viewable(userId: string, leadId: string) {
  const row = maybe(await db().from("leads").select("*").eq("id", leadId).maybeSingle());
  if (!row) return null;
  const lead = toLead(row);
  const cardRow = maybe(await db().from("cards").select("*").eq("id", lead.cardId).maybeSingle());
  if (!cardRow) return null;
  const card = toCard(cardRow);
  return canViewLeadsOf(await accessCtx(userId), userId, card) ? { lead, card } : null;
}

export async function getLead(userId: string, leadId: string): Promise<LeadRow | null> {
  const found = await viewable(userId, leadId);
  return found ? { ...found.lead, cardLabel: found.card.label, cardSlug: found.card.slug } : null;
}

export async function updateLead(userId: string, leadId: string, patch: Partial<Pick<Lead, "status" | "tags" | "note" | "followUpAt">>): Promise<Lead> {
  if (!(await viewable(userId, leadId))) throw new NotFoundError("Contact not found.");
  const row = must(
    await db()
      .from("leads")
      .update({
        ...(patch.status !== undefined && { status: patch.status }),
        ...(patch.tags !== undefined && { tags: patch.tags }),
        ...(patch.note !== undefined && { note: patch.note }),
        ...(patch.followUpAt !== undefined && { follow_up_at: patch.followUpAt }),
      })
      .eq("id", leadId)
      .select("*")
      .single(),
  );
  return toLead(row);
}

export async function deleteLead(userId: string, leadId: string): Promise<void> {
  if (!(await viewable(userId, leadId))) throw new NotFoundError("Contact not found.");
  must(await db().from("leads").delete().eq("id", leadId));
}

export async function newLeadCount(userId: string) {
  return (await listLeads(userId, { status: "new" })).length;
}
