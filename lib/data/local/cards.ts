import "server-only";
import type { Card, CardContent } from "@/lib/cards/types";
import { audit, mutate, newId, now, read, type DB } from "@/lib/data/local/db";
import { ConflictError, ForbiddenError, NotFoundError, SlugTakenError } from "@/lib/data/errors";
import { cardAccess, lockedFields, roleIn } from "@/lib/data/access";
import type { LockableField, Organization } from "@/lib/data/models";

function slugInUse(db: DB, slug: string, exceptCardId?: string) {
  const owner = Object.values(db.cards).find((c) => c.slug === slug)?.id ?? db.slugHistory[slug];
  return owner !== undefined && owner !== exceptCardId;
}

function editable(db: DB, userId: string, cardId: string): Card {
  const card = db.cards[cardId];
  if (!card || !cardAccess(db, userId, card)) throw new NotFoundError("Card not found.");
  return card;
}

/** Applies organization locks: locked fields keep the organization's values. */
function applyLocks(content: CardContent, locked: LockableField[], org: Organization | undefined): CardContent {
  if (!org || locked.length === 0) return content;
  const next = structuredClone(content);
  if (locked.includes("theme")) next.theme = { template: org.brand.template, accent: org.brand.accent };
  if (locked.includes("company")) next.company = org.brand.company || org.name;
  if (locked.includes("website")) next.contacts.website = org.brand.website;
  return next;
}

export interface CardSummary extends Card {
  organizationName: string | null;
}

/** Personal cards plus company cards from organizations the user is still active in. */
export async function listCards(userId: string): Promise<CardSummary[]> {
  const db = await read();
  return Object.values(db.cards)
    .filter((c) => c.ownerUserId === userId && c.status !== "archived" && (!c.organizationId || roleIn(db, userId, c.organizationId)))
    .map((c) => ({ ...c, organizationName: c.organizationId ? (db.organizations[c.organizationId]?.name ?? null) : null }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getCardForEdit(userId: string, cardId: string) {
  const db = await read();
  const card = db.cards[cardId];
  if (!card) return null;
  const access = cardAccess(db, userId, card);
  if (!access) return null;
  const org = card.organizationId ? db.organizations[card.organizationId] : undefined;
  return { card, access, locked: lockedFields(db, userId, card), organization: org ?? null };
}

export function createCard(userId: string, content: CardContent, slug: string): Promise<Card> {
  return mutate((db) => {
    if (slugInUse(db, slug)) throw new SlugTakenError();
    const t = now();
    const card: Card = {
      ...structuredClone(content),
      id: newId(),
      ownerUserId: userId,
      organizationId: null,
      avatarMediaId: db.profiles[userId]?.avatarMediaId ?? null,
      slug,
      status: "draft",
      publishedAt: null,
      version: 1,
      createdAt: t,
      updatedAt: t,
    };
    db.cards[card.id] = card;
    return card;
  });
}

export function updateCard(userId: string, cardId: string, content: CardContent, expectedVersion: number, slug: string): Promise<Card> {
  return mutate((db) => {
    const card = editable(db, userId, cardId);
    if (card.version !== expectedVersion) throw new ConflictError();
    if (slug !== card.slug && slugInUse(db, slug, cardId)) throw new SlugTakenError();
    const org = card.organizationId ? db.organizations[card.organizationId] : undefined;
    const safe = applyLocks(content, lockedFields(db, userId, card), org);
    if (slug !== card.slug) {
      if (card.publishedAt) db.slugHistory[card.slug] = cardId; // keep printed QR codes working
      delete db.slugHistory[slug];
    }
    const next: Card = { ...card, ...safe, slug, version: card.version + 1, updatedAt: now() };
    db.cards[cardId] = next;
    return next;
  });
}

export function setStatus(userId: string, cardId: string, status: "published" | "draft"): Promise<Card> {
  return mutate((db) => {
    const card = editable(db, userId, cardId);
    if (card.status === "suspended") throw new ForbiddenError("This card was suspended after a report. Contact support to restore it.");
    const t = now();
    const next: Card = { ...card, status, publishedAt: status === "published" ? (card.publishedAt ?? t) : card.publishedAt, version: card.version + 1, updatedAt: t };
    db.cards[cardId] = next;
    return next;
  });
}

export function setCardAvatar(userId: string, cardId: string, mediaId: string | null): Promise<Card> {
  return mutate((db) => {
    const card = editable(db, userId, cardId);
    const next = { ...card, avatarMediaId: mediaId, version: card.version + 1, updatedAt: now() };
    db.cards[cardId] = next;
    return next;
  });
}

export function deleteCard(userId: string, cardId: string): Promise<Card> {
  return mutate((db) => {
    const card = editable(db, userId, cardId);
    if (card.organizationId && cardAccess(db, userId, card) !== "org-admin" && roleIn(db, userId, card.organizationId) === "member") {
      throw new ForbiddenError("Company cards can only be removed by your organization's admins.");
    }
    delete db.cards[cardId];
    for (const [old, id] of Object.entries(db.slugHistory)) if (id === cardId) delete db.slugHistory[old];
    for (const lead of Object.values(db.leads)) if (lead.cardId === cardId) delete db.leads[lead.id];
    if (card.organizationId) audit(db, { actorId: userId, organizationId: card.organizationId, entityType: "card", entityId: cardId, action: "card.deleted", metadata: { slug: card.slug } });
    return card;
  });
}

export async function isSlugAvailable(slug: string, exceptCardId?: string) {
  return !slugInUse(await read(), slug, exceptCardId);
}

/** Public read: only published cards. Returns `redirectTo` when the slug is a former address. */
export async function findPublishedBySlug(slug: string): Promise<{ card: Card; logoMediaId: string | null } | { redirectTo: string } | null> {
  const db = await read();
  const card = Object.values(db.cards).find((c) => c.slug === slug);
  if (card) {
    if (card.status !== "published") return null;
    const org = card.organizationId ? db.organizations[card.organizationId] : undefined;
    if (org && org.status !== "active") return null;
    return { card, logoMediaId: org?.logoMediaId ?? null };
  }
  const former = db.slugHistory[slug];
  const current = former ? db.cards[former] : undefined;
  return current?.status === "published" ? { redirectTo: current.slug } : null;
}
