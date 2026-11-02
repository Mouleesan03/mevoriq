import "server-only";
import type { Card } from "@/lib/cards/types";
import type { LockableField, Membership, OrgRole, Organization } from "@/lib/data/models";

/** The slice of data the rules need; both backends can provide it. */
export interface AccessCtx {
  memberships: Membership[];
  organizations: Record<string, Organization>;
}

/** Authorization rules shared by every data module (docs/product-plan.md §6 roles matrix). */

export function membership(db: AccessCtx, userId: string, orgId: string): Membership | undefined {
  return db.memberships.find((m) => m.userId === userId && m.organizationId === orgId && m.status === "active");
}

export function roleIn(db: AccessCtx, userId: string, orgId: string): OrgRole | null {
  return membership(db, userId, orgId)?.role ?? null;
}

export const isOrgAdmin = (role: OrgRole | null) => role === "owner" || role === "admin";
export const canManageCards = (role: OrgRole | null) => role === "owner" || role === "admin" || role === "manager";

export type CardAccess = "owner" | "org-admin" | null;

/** Owner of a personal card, the active-member owner of a company card, or an admin of its organization. */
export function cardAccess(db: AccessCtx, userId: string, card: Card): CardAccess {
  if (!card.organizationId) return card.ownerUserId === userId ? "owner" : null;
  const role = roleIn(db, userId, card.organizationId);
  if (card.ownerUserId === userId && role) return "owner";
  if (isOrgAdmin(role)) return "org-admin";
  return null;
}

/** Fields locked for the person editing: org admins can change everything on company cards. */
export function lockedFields(db: AccessCtx, userId: string, card: Card): LockableField[] {
  if (!card.organizationId) return [];
  const org: Organization | undefined = db.organizations[card.organizationId];
  if (!org) return [];
  return isOrgAdmin(roleIn(db, userId, org.id)) ? [] : org.brand.lockedFields;
}

/** Leads are private to the card owner; org admins see them only if the org enabled it. */
export function canViewLeadsOf(db: AccessCtx, userId: string, card: Card): boolean {
  const access = cardAccess(db, userId, card);
  if (access === "owner") return true;
  if (access === "org-admin" && card.organizationId) return db.organizations[card.organizationId]?.brand.adminsCanViewLeads ?? false;
  return false;
}
