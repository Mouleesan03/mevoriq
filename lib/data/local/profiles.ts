import "server-only";
import type { Profile } from "@/lib/cards/types";
import { audit, ForbiddenError, mutate, newId, now, read } from "@/lib/data/local/db";
import { deleteMediaFiles } from "@/lib/data/local/media";

export async function getProfile(userId: string): Promise<Profile | null> {
  return (await read()).profiles[userId] ?? null;
}

/** Demo sign-in: reuses the profile with the same email, otherwise creates one. */
export function signInByEmail(displayName: string, email: string): Promise<Profile> {
  return mutate((db) => {
    const existing = Object.values(db.profiles).find((p) => p.email === email);
    if (existing) return existing;
    const profile: Profile = { id: newId(), displayName, email, avatarMediaId: null, createdAt: now() };
    db.profiles[profile.id] = profile;
    return profile;
  });
}

export function updateProfile(userId: string, patch: Partial<Pick<Profile, "displayName" | "avatarMediaId">>): Promise<Profile> {
  return mutate((db) => {
    const next = { ...db.profiles[userId], ...patch };
    db.profiles[userId] = next;
    return next;
  });
}

/** Everything we hold about the person, for the "Download my data" button (AUTH-07). */
export async function exportAccount(userId: string) {
  const db = await read();
  const cards = Object.values(db.cards).filter((c) => c.ownerUserId === userId);
  const cardIds = new Set(cards.map((c) => c.id));
  return {
    exportedAt: now(),
    profile: db.profiles[userId],
    cards,
    contacts: Object.values(db.leads).filter((l) => cardIds.has(l.cardId)),
    memberships: db.memberships.filter((m) => m.userId === userId).map((m) => ({ ...m, organization: db.organizations[m.organizationId]?.name })),
    media: Object.values(db.media).filter((m) => m.ownerUserId === userId),
  };
}

/** Deletes the account, cards, received contacts and uploaded images. Owners must hand over or delete their organizations first. */
export async function deleteAccount(userId: string): Promise<void> {
  const mediaIds = await mutate((db) => {
    const owned = Object.values(db.organizations).filter((o) => o.ownerId === userId && db.memberships.some((m) => m.organizationId === o.id && m.userId !== userId && m.status === "active"));
    if (owned.length) throw new ForbiddenError(`You own ${owned.map((o) => o.name).join(", ")}, which still has members. Remove them first.`);

    const cardIds = new Set(Object.values(db.cards).filter((c) => c.ownerUserId === userId).map((c) => c.id));
    for (const id of cardIds) delete db.cards[id];
    for (const [slug, id] of Object.entries(db.slugHistory)) if (cardIds.has(id)) delete db.slugHistory[slug];
    for (const lead of Object.values(db.leads)) if (cardIds.has(lead.cardId)) delete db.leads[lead.id];
    for (const key of Object.keys(db.events)) if (cardIds.has(key.split("|")[0])) delete db.events[key];
    for (const org of Object.values(db.organizations)) if (org.ownerId === userId) delete db.organizations[org.id];
    db.memberships = db.memberships.filter((m) => m.userId !== userId && db.organizations[m.organizationId]);
    const media = Object.values(db.media).filter((m) => m.ownerUserId === userId).map((m) => m.id);
    for (const id of media) delete db.media[id];
    delete db.profiles[userId];
    audit(db, { actorId: userId, organizationId: null, entityType: "account", entityId: userId, action: "account.deleted", metadata: {} });
    return media;
  });
  await deleteMediaFiles(mediaIds);
}
