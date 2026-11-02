import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { Card } from "@/lib/cards/types";
import { emptyCardContent } from "@/lib/cards/types";
import { audit, ForbiddenError, mutate, newId, NotFoundError, now, read, type DB } from "@/lib/data/local/db";
import { canManageCards, isOrgAdmin, roleIn } from "@/lib/data/access";
import type { Invitation, LockableField, Membership, OrgRole, Organization } from "@/lib/data/models";
import { slugify } from "@/lib/validation/card";

const INVITE_DAYS = 7;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function requireRole(db: DB, userId: string, orgId: string, check: (r: OrgRole | null) => boolean): OrgRole {
  const role = roleIn(db, userId, orgId);
  if (!db.organizations[orgId] || !role) throw new NotFoundError("Organization not found.");
  if (!check(role)) throw new ForbiddenError();
  return role;
}

function uniqueOrgSlug(db: DB, name: string) {
  const base = slugify(name) || "team";
  let slug = base;
  for (let i = 2; Object.values(db.organizations).some((o) => o.slug === slug); i++) slug = `${base}-${i}`;
  return slug;
}

export function createOrganization(userId: string, name: string): Promise<Organization> {
  return mutate((db) => {
    const t = now();
    const org: Organization = {
      id: newId(),
      name,
      slug: uniqueOrgSlug(db, name),
      ownerId: userId,
      logoMediaId: null,
      brand: { template: "modern-corporate", accent: "#2448E8", company: name, website: "", lockedFields: ["theme", "company"], adminsCanViewLeads: false },
      status: "active",
      createdAt: t,
      updatedAt: t,
    };
    db.organizations[org.id] = org;
    db.memberships.push({ organizationId: org.id, userId, role: "owner", status: "active", joinedAt: t });
    audit(db, { actorId: userId, organizationId: org.id, entityType: "organization", entityId: org.id, action: "organization.created", metadata: { name } });
    return org;
  });
}

export async function listMyOrganizations(userId: string): Promise<{ org: Organization; role: OrgRole }[]> {
  const db = await read();
  return db.memberships
    .filter((m) => m.userId === userId && m.status === "active" && db.organizations[m.organizationId])
    .map((m) => ({ org: db.organizations[m.organizationId], role: m.role }));
}

export interface MemberRow extends Membership {
  displayName: string;
  email: string;
  cardCount: number;
}

export async function getTeam(userId: string, orgId: string) {
  const db = await read();
  const role = roleIn(db, userId, orgId);
  const org = db.organizations[orgId];
  if (!org || !role) return null;
  const members: MemberRow[] = db.memberships
    .filter((m) => m.organizationId === orgId)
    .map((m) => ({
      ...m,
      displayName: db.profiles[m.userId]?.displayName ?? "Unknown",
      email: db.profiles[m.userId]?.email ?? "",
      cardCount: Object.values(db.cards).filter((c) => c.organizationId === orgId && c.ownerUserId === m.userId && c.status !== "archived").length,
    }))
    .sort((a, b) => ORDER[a.role] - ORDER[b.role] || a.displayName.localeCompare(b.displayName));
  const invitations = isOrgAdmin(role) ? Object.values(db.invitations).filter((i) => i.organizationId === orgId && !i.acceptedAt && !i.revokedAt && i.expiresAt > now()) : [];
  // Managers and admins see every company card; members see their own.
  const cards: Card[] = Object.values(db.cards).filter((c) => c.organizationId === orgId && (canManageCards(role) || c.ownerUserId === userId));
  return { org, role, members, invitations, cards };
}

const ORDER: Record<OrgRole, number> = { owner: 0, admin: 1, manager: 2, member: 3 };

/** Returns the raw token once; only its hash is stored. Email delivery comes with the mail provider. */
export function createInvitation(userId: string, orgId: string, email: string, role: Invitation["role"]): Promise<{ invitation: Invitation; token: string }> {
  return mutate((db) => {
    requireRole(db, userId, orgId, isOrgAdmin);
    const existing = db.memberships.find((m) => m.organizationId === orgId && m.status === "active" && db.profiles[m.userId]?.email === email);
    if (existing) throw new ForbiddenError("That person is already a member.");
    const token = randomBytes(24).toString("base64url");
    const invitation: Invitation = {
      id: newId(),
      organizationId: orgId,
      email,
      role,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + INVITE_DAYS * 86_400_000).toISOString(),
      acceptedAt: null,
      revokedAt: null,
      createdBy: userId,
      createdAt: now(),
    };
    db.invitations[invitation.id] = invitation;
    audit(db, { actorId: userId, organizationId: orgId, entityType: "invitation", entityId: invitation.id, action: "invitation.created", metadata: { email, role } });
    return { invitation, token };
  });
}

export async function findInvitation(token: string) {
  const db = await read();
  const inv = Object.values(db.invitations).find((i) => i.tokenHash === hashToken(token));
  if (!inv || inv.acceptedAt || inv.revokedAt || inv.expiresAt < now()) return null;
  return { invitation: inv, organization: db.organizations[inv.organizationId] };
}

export function acceptInvitation(userId: string, token: string): Promise<Organization> {
  return mutate((db) => {
    const inv = Object.values(db.invitations).find((i) => i.tokenHash === hashToken(token));
    if (!inv || inv.acceptedAt || inv.revokedAt || inv.expiresAt < now()) throw new NotFoundError("This invitation is no longer valid.");
    const profile = db.profiles[userId];
    if (!profile || profile.email.toLowerCase() !== inv.email.toLowerCase()) {
      throw new ForbiddenError(`This invitation was sent to ${inv.email}. Log in with that email to accept it.`);
    }
    const existing = db.memberships.find((m) => m.organizationId === inv.organizationId && m.userId === userId);
    if (existing) Object.assign(existing, { status: "active", role: inv.role });
    else db.memberships.push({ organizationId: inv.organizationId, userId, role: inv.role, status: "active", joinedAt: now() });
    inv.acceptedAt = now();
    audit(db, { actorId: userId, organizationId: inv.organizationId, entityType: "membership", entityId: userId, action: "membership.joined", metadata: { role: inv.role } });
    return db.organizations[inv.organizationId];
  });
}

export function revokeInvitation(userId: string, invitationId: string): Promise<void> {
  return mutate((db) => {
    const inv = db.invitations[invitationId];
    if (!inv) throw new NotFoundError();
    requireRole(db, userId, inv.organizationId, isOrgAdmin);
    inv.revokedAt = now();
  });
}

export function changeRole(userId: string, orgId: string, memberId: string, role: Exclude<OrgRole, "owner">): Promise<void> {
  return mutate((db) => {
    requireRole(db, userId, orgId, isOrgAdmin);
    const m = db.memberships.find((x) => x.organizationId === orgId && x.userId === memberId);
    if (!m) throw new NotFoundError("Member not found.");
    if (m.role === "owner") throw new ForbiddenError("The owner's role can't be changed.");
    m.role = role;
    audit(db, { actorId: userId, organizationId: orgId, entityType: "membership", entityId: memberId, action: "membership.role_changed", metadata: { role } });
  });
}

/**
 * Offboarding: removes access and unpublishes the person's company cards.
 * Their personal cards are untouched (AC-10).
 */
export function setMemberStatus(userId: string, orgId: string, memberId: string, status: Membership["status"]): Promise<void> {
  return mutate((db) => {
    requireRole(db, userId, orgId, isOrgAdmin);
    const m = db.memberships.find((x) => x.organizationId === orgId && x.userId === memberId);
    if (!m) throw new NotFoundError("Member not found.");
    if (m.role === "owner") throw new ForbiddenError("The owner can't be deactivated.");
    m.status = status;
    if (status === "deactivated") {
      for (const card of Object.values(db.cards)) {
        if (card.organizationId === orgId && card.ownerUserId === memberId && card.status === "published") {
          db.cards[card.id] = { ...card, status: "draft", version: card.version + 1, updatedAt: now() };
        }
      }
    }
    audit(db, { actorId: userId, organizationId: orgId, entityType: "membership", entityId: memberId, action: `membership.${status}`, metadata: {} });
  });
}

export function updateBrand(
  userId: string,
  orgId: string,
  patch: { name: string; brand: Organization["brand"]; logoMediaId?: string | null },
): Promise<Organization> {
  return mutate((db) => {
    requireRole(db, userId, orgId, isOrgAdmin);
    const org = db.organizations[orgId];
    const next: Organization = {
      ...org,
      name: patch.name,
      brand: patch.brand,
      logoMediaId: patch.logoMediaId === undefined ? org.logoMediaId : patch.logoMediaId,
      updatedAt: now(),
    };
    db.organizations[orgId] = next;
    // Locked fields take effect on every company card immediately ("update once, everywhere").
    const locked: LockableField[] = next.brand.lockedFields;
    for (const card of Object.values(db.cards)) {
      if (card.organizationId !== orgId) continue;
      const c = structuredClone(card);
      if (locked.includes("theme")) c.theme = { template: next.brand.template, accent: next.brand.accent };
      if (locked.includes("company")) c.company = next.brand.company || next.name;
      if (locked.includes("website")) c.contacts.website = next.brand.website;
      db.cards[card.id] = { ...c, version: card.version + 1, updatedAt: now() };
    }
    audit(db, { actorId: userId, organizationId: orgId, entityType: "organization", entityId: orgId, action: "organization.brand_updated", metadata: {} });
    return next;
  });
}

/** Creates a draft company card owned by the member, prefilled from the brand. */
export function createCompanyCard(userId: string, orgId: string, memberId: string, slug: string): Promise<Card> {
  return mutate((db) => {
    requireRole(db, userId, orgId, canManageCards);
    const org = db.organizations[orgId];
    const member = db.memberships.find((m) => m.organizationId === orgId && m.userId === memberId && m.status === "active");
    const profile = db.profiles[memberId];
    if (!member || !profile) throw new NotFoundError("Member not found.");
    if (Object.values(db.cards).some((c) => c.slug === slug) || db.slugHistory[slug]) throw new ForbiddenError("That address is already taken.");
    const base = emptyCardContent(profile.displayName);
    const t = now();
    const card: Card = {
      ...base,
      label: `${org.name} card`,
      company: org.brand.company || org.name,
      contacts: { ...base.contacts, email: profile.email, website: org.brand.website },
      theme: { template: org.brand.template, accent: org.brand.accent },
      id: newId(),
      ownerUserId: memberId,
      organizationId: orgId,
      avatarMediaId: profile.avatarMediaId ?? null,
      slug,
      status: "draft",
      publishedAt: null,
      version: 1,
      createdAt: t,
      updatedAt: t,
    };
    db.cards[card.id] = card;
    audit(db, { actorId: userId, organizationId: orgId, entityType: "card", entityId: card.id, action: "card.company_created", metadata: { memberId, slug } });
    return card;
  });
}

export interface ActivityRow {
  id: string;
  actorName: string;
  action: string;
  createdAt: string;
}

/** Recent organization activity for owners and admins. */
export async function getTeamActivity(userId: string, orgId: string, limit = 8): Promise<ActivityRow[]> {
  const db = await read();
  if (!isOrgAdmin(roleIn(db, userId, orgId))) return [];
  return db.audit
    .filter((a) => a.organizationId === orgId)
    .slice(-limit)
    .reverse()
    .map((a) => ({ id: a.id, actorName: db.profiles[a.actorId]?.displayName ?? "Someone", action: a.action, createdAt: a.createdAt }));
}
