import "server-only";
import type { Card, CardContent } from "@/lib/cards/types";
import { cardAccess, lockedFields, roleIn } from "@/lib/data/access";
import { ConflictError, ForbiddenError, NotFoundError, SlugTakenError } from "@/lib/data/errors";
import type { LockableField, Organization } from "@/lib/data/models";
import type { CardSummary } from "@/lib/data/local/cards";
import { maybe, must, supabaseAdmin } from "@/lib/supabase/server";
import { accessCtx, isUniqueViolation, writeAudit } from "@/lib/data/supabase/context";
import { contentToRow, toCard, toOrg } from "@/lib/data/supabase/map";

const db = () => supabaseAdmin();

async function cardById(cardId: string): Promise<Card | null> {
  const row = maybe(await db().from("cards").select("*").eq("id", cardId).maybeSingle());
  return row ? toCard(row) : null;
}

async function slugOwner(slug: string): Promise<string | null> {
  const card = maybe(await db().from("cards").select("id").eq("slug", slug).maybeSingle());
  if (card) return card.id;
  const hist = maybe(await db().from("card_slug_history").select("card_id").eq("old_slug", slug).maybeSingle());
  return hist?.card_id ?? null;
}

async function editable(userId: string, cardId: string) {
  const card = await cardById(cardId);
  const ctx = await accessCtx(userId);
  if (!card || !cardAccess(ctx, userId, card)) throw new NotFoundError("Card not found.");
  return { card, ctx };
}

function applyLocks(content: CardContent, locked: LockableField[], org: Organization | undefined): CardContent {
  if (!org || locked.length === 0) return content;
  const next = structuredClone(content);
  if (locked.includes("theme")) next.theme = { template: org.brand.template, accent: org.brand.accent };
  if (locked.includes("company")) next.company = org.brand.company || org.name;
  if (locked.includes("website")) next.contacts.website = org.brand.website;
  return next;
}

/** Bumps the version only if nobody else changed the card meanwhile. */
async function updateVersioned(card: Card, patch: Record<string, unknown>): Promise<Card> {
  const rows = must(await db().from("cards").update({ ...patch, version: card.version + 1 }).eq("id", card.id).eq("version", card.version).select("*"));
  if (!rows.length) throw new ConflictError();
  return toCard(rows[0]);
}

export async function listCards(userId: string): Promise<CardSummary[]> {
  const ctx = await accessCtx(userId);
  const rows = must(await db().from("cards").select("*").eq("owner_user_id", userId).neq("status", "archived").order("updated_at", { ascending: false }));
  return rows
    .map(toCard)
    .filter((c) => !c.organizationId || roleIn(ctx, userId, c.organizationId))
    .map((c) => ({ ...c, organizationName: c.organizationId ? (ctx.organizations[c.organizationId]?.name ?? null) : null }));
}

export async function getCardForEdit(userId: string, cardId: string) {
  const card = await cardById(cardId);
  if (!card) return null;
  const ctx = await accessCtx(userId);
  const access = cardAccess(ctx, userId, card);
  if (!access) return null;
  const org = card.organizationId ? ctx.organizations[card.organizationId] : undefined;
  return { card, access, locked: lockedFields(ctx, userId, card), organization: org ?? null };
}

export async function createCard(userId: string, content: CardContent, slug: string): Promise<Card> {
  if (await slugOwner(slug)) throw new SlugTakenError();
  const profile = must(await db().from("profiles").select("avatar_media_id").eq("id", userId).single());
  try {
    const row = must(
      await db()
        .from("cards")
        .insert({ ...contentToRow(content), owner_user_id: userId, slug, avatar_media_id: profile.avatar_media_id })
        .select("*")
        .single(),
    );
    return toCard(row);
  } catch (err) {
    if (isUniqueViolation(err)) throw new SlugTakenError();
    throw err;
  }
}

export async function updateCard(userId: string, cardId: string, content: CardContent, expectedVersion: number, slug: string): Promise<Card> {
  const { card, ctx } = await editable(userId, cardId);
  if (card.version !== expectedVersion) throw new ConflictError();
  if (slug !== card.slug) {
    const owner = await slugOwner(slug);
    if (owner && owner !== cardId) throw new SlugTakenError();
  }
  const org = card.organizationId ? ctx.organizations[card.organizationId] : undefined;
  const safe = applyLocks(content, lockedFields(ctx, userId, card), org);
  let next: Card;
  try {
    next = await updateVersioned(card, { ...contentToRow(safe), slug });
  } catch (err) {
    if (isUniqueViolation(err)) throw new SlugTakenError();
    throw err;
  }
  if (slug !== card.slug) {
    // Keep printed QR codes working: the old address now redirects here.
    if (card.publishedAt) must(await db().from("card_slug_history").upsert({ old_slug: card.slug, card_id: cardId }));
    must(await db().from("card_slug_history").delete().eq("old_slug", slug));
  }
  return next;
}

export async function setStatus(userId: string, cardId: string, status: "published" | "draft"): Promise<Card> {
  const { card } = await editable(userId, cardId);
  if (card.status === "suspended") throw new ForbiddenError("This card was suspended after a report. Contact support to restore it.");
  return updateVersioned(card, { status, published_at: status === "published" ? (card.publishedAt ?? new Date().toISOString()) : card.publishedAt });
}

export async function setCardAvatar(userId: string, cardId: string, mediaId: string | null): Promise<Card> {
  const { card } = await editable(userId, cardId);
  return updateVersioned(card, { avatar_media_id: mediaId });
}

export async function deleteCard(userId: string, cardId: string): Promise<Card> {
  const { card, ctx } = await editable(userId, cardId);
  if (card.organizationId && cardAccess(ctx, userId, card) !== "org-admin" && roleIn(ctx, userId, card.organizationId) === "member") {
    throw new ForbiddenError("Company cards can only be removed by your organization's admins.");
  }
  must(await db().from("cards").delete().eq("id", cardId)); // cascades to slug history, leads, events, reports
  if (card.organizationId) await writeAudit({ actorId: userId, organizationId: card.organizationId, entityType: "card", entityId: cardId, action: "card.deleted", metadata: { slug: card.slug } });
  return card;
}

export async function isSlugAvailable(slug: string, exceptCardId?: string) {
  const owner = await slugOwner(slug);
  return !owner || owner === exceptCardId;
}

export async function findPublishedBySlug(slug: string): Promise<{ card: Card; logoMediaId: string | null } | { redirectTo: string } | null> {
  const row = maybe(await db().from("cards").select("*").eq("slug", slug).maybeSingle());
  if (row) {
    const card = toCard(row);
    if (card.status !== "published") return null;
    if (!card.organizationId) return { card, logoMediaId: null };
    const org = maybe(await db().from("organizations").select("*").eq("id", card.organizationId).maybeSingle());
    if (!org || org.status !== "active") return null;
    return { card, logoMediaId: toOrg(org).logoMediaId };
  }
  const hist = maybe(await db().from("card_slug_history").select("card_id").eq("old_slug", slug).maybeSingle());
  if (!hist) return null;
  const current = await cardById(hist.card_id);
  return current?.status === "published" ? { redirectTo: current.slug } : null;
}
