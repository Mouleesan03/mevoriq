import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { Card } from "@/lib/cards/types";
import { emptyCardContent } from "@/lib/cards/types";
import { canManageCards, isOrgAdmin, roleIn } from "@/lib/data/access";
import { ForbiddenError, NotFoundError } from "@/lib/data/errors";
import type { Invitation, Membership, OrgRole, Organization } from "@/lib/data/models";
import type { ActivityRow, MemberRow } from "@/lib/data/local/orgs";
import { INVITE_DAYS } from "@/lib/data/shared";
import { slugify } from "@/lib/validation/card";
import { maybe, must, supabaseAdmin } from "@/lib/supabase/server";
import { accessCtx, isUniqueViolation, writeAudit } from "@/lib/data/supabase/context";
import { contentToRow, toCard, toInvitation, toMember, toOrg, toProfile } from "@/lib/data/supabase/map";

const db = () => supabaseAdmin();
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const ORDER: Record<OrgRole, number> = { owner: 0, admin: 1, manager: 2, member: 3 };

async function requireRole(userId: string, orgId: string, check: (r: OrgRole | null) => boolean): Promise<OrgRole> {
  const role = roleIn(await accessCtx(userId), userId, orgId);
  if (!role) throw new NotFoundError("Organization not found.");
  if (!check(role)) throw new ForbiddenError();
  return role;
}

async function orgById(orgId: string): Promise<Organization> {
  const row = maybe(await db().from("organizations").select("*").eq("id", orgId).maybeSingle());
  if (!row) throw new NotFoundError("Organization not found.");
  return toOrg(row);
}

export async function createOrganization(userId: string, name: string): Promise<Organization> {
  const base = slugify(name) || "team";
  for (let i = 1; i < 50; i++) {
    const slug = i === 1 ? base : `${base}-${i}`;
    try {
      const row = must(
        await db()
          .from("organizations")
          .insert({
            name,
            slug,
            owner_id: userId,
            brand: { template: "modern-corporate", accent: "#2448E8", company: name, website: "", lockedFields: ["theme", "company"], adminsCanViewLeads: false },
          })
          .select("*")
          .single(),
      );
      const org = toOrg(row);
      must(await db().from("organization_members").insert({ organization_id: org.id, user_id: userId, role: "owner", status: "active" }));
      await writeAudit({ actorId: userId, organizationId: org.id, entityType: "organization", entityId: org.id, action: "organization.created", metadata: { name } });
      return org;
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
    }
  }
  throw new Error("Could not create a unique team address.");
}

export async function listMyOrganizations(userId: string): Promise<{ org: Organization; role: OrgRole }[]> {
  const ctx = await accessCtx(userId);
  return ctx.memberships.filter((m) => ctx.organizations[m.organizationId]).map((m) => ({ org: ctx.organizations[m.organizationId], role: m.role }));
}

export async function getTeam(userId: string, orgId: string) {
  const ctx = await accessCtx(userId);
  const role = roleIn(ctx, userId, orgId);
  const org = ctx.organizations[orgId];
  if (!org || !role) return null;
  const memberships = must(await db().from("organization_members").select("*").eq("organization_id", orgId)).map(toMember);
  const userIds = memberships.map((m) => m.userId);
  const profiles = userIds.length ? must(await db().from("profiles").select("*").in("id", userIds)).map(toProfile) : [];
  const byId = new Map(profiles.map((p) => [p.id, p]));
  const allCards = must(await db().from("cards").select("*").eq("organization_id", orgId)).map(toCard);
  const members: MemberRow[] = memberships
    .map((m) => ({
      ...m,
      displayName: byId.get(m.userId)?.displayName ?? "Unknown",
      email: byId.get(m.userId)?.email ?? "",
      cardCount: allCards.filter((c) => c.ownerUserId === m.userId && c.status !== "archived").length,
    }))
    .sort((a, b) => ORDER[a.role] - ORDER[b.role] || a.displayName.localeCompare(b.displayName));
  const invitations: Invitation[] = isOrgAdmin(role)
    ? must(await db().from("organization_invitations").select("*").eq("organization_id", orgId).is("accepted_at", null).is("revoked_at", null).gt("expires_at", new Date().toISOString())).map(toInvitation)
    : [];
  const cards: Card[] = allCards.filter((c) => canManageCards(role) || c.ownerUserId === userId);
  return { org, role, members, invitations, cards };
}

export async function getTeamActivity(userId: string, orgId: string, limit = 8): Promise<ActivityRow[]> {
  if (!isOrgAdmin(roleIn(await accessCtx(userId), userId, orgId))) return [];
  const rows = must(await db().from("audit_logs").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }).limit(limit));
  const actorIds = [...new Set(rows.map((r) => r.actor_id))];
  const profiles = actorIds.length ? must(await db().from("profiles").select("id, display_name").in("id", actorIds)) : [];
  const names = new Map(profiles.map((p) => [p.id, p.display_name]));
  return rows.map((r) => ({ id: r.id, actorName: names.get(r.actor_id) ?? "Someone", action: r.action, createdAt: r.created_at }));
}

export async function createInvitation(userId: string, orgId: string, email: string, role: Invitation["role"]): Promise<{ invitation: Invitation; token: string }> {
  await requireRole(userId, orgId, isOrgAdmin);
  const existing = maybe(await db().from("profiles").select("id").eq("email", email).maybeSingle());
  if (existing) {
    const m = maybe(await db().from("organization_members").select("status").eq("organization_id", orgId).eq("user_id", existing.id).maybeSingle());
    if (m?.status === "active") throw new ForbiddenError("That person is already a member.");
  }
  const token = randomBytes(24).toString("base64url");
  const row = must(
    await db()
      .from("organization_invitations")
      .insert({ organization_id: orgId, email, role, token_hash: hashToken(token), expires_at: new Date(Date.now() + INVITE_DAYS * 86_400_000).toISOString(), created_by: userId })
      .select("*")
      .single(),
  );
  const invitation = toInvitation(row);
  await writeAudit({ actorId: userId, organizationId: orgId, entityType: "invitation", entityId: invitation.id, action: "invitation.created", metadata: { email, role } });
  return { invitation, token };
}

async function liveInvitation(token: string): Promise<Invitation | null> {
  const row = maybe(await db().from("organization_invitations").select("*").eq("token_hash", hashToken(token)).maybeSingle());
  if (!row) return null;
  const inv = toInvitation(row);
  return inv.acceptedAt || inv.revokedAt || inv.expiresAt < new Date().toISOString() ? null : inv;
}

export async function findInvitation(token: string) {
  const invitation = await liveInvitation(token);
  if (!invitation) return null;
  return { invitation, organization: await orgById(invitation.organizationId) };
}

export async function acceptInvitation(userId: string, token: string): Promise<Organization> {
  const inv = await liveInvitation(token);
  if (!inv) throw new NotFoundError("This invitation is no longer valid.");
  const profile = must(await db().from("profiles").select("email").eq("id", userId).single());
  if (profile.email.toLowerCase() !== inv.email.toLowerCase()) throw new ForbiddenError(`This invitation was sent to ${inv.email}. Log in with that email to accept it.`);
  // Claim the invitation first so it can only be used once, even with concurrent requests.
  const claimed = must(await db().from("organization_invitations").update({ accepted_at: new Date().toISOString() }).eq("id", inv.id).is("accepted_at", null).select("id"));
  if (!claimed.length) throw new NotFoundError("This invitation is no longer valid.");
  must(await db().from("organization_members").upsert({ organization_id: inv.organizationId, user_id: userId, role: inv.role, status: "active" }, { onConflict: "organization_id,user_id" }));
  await writeAudit({ actorId: userId, organizationId: inv.organizationId, entityType: "membership", entityId: userId, action: "membership.joined", metadata: { role: inv.role } });
  return orgById(inv.organizationId);
}

export async function revokeInvitation(userId: string, invitationId: string): Promise<void> {
  const row = maybe(await db().from("organization_invitations").select("organization_id").eq("id", invitationId).maybeSingle());
  if (!row) throw new NotFoundError();
  await requireRole(userId, row.organization_id, isOrgAdmin);
  must(await db().from("organization_invitations").update({ revoked_at: new Date().toISOString() }).eq("id", invitationId));
}

async function memberRow(orgId: string, memberId: string): Promise<Membership> {
  const row = maybe(await db().from("organization_members").select("*").eq("organization_id", orgId).eq("user_id", memberId).maybeSingle());
  if (!row) throw new NotFoundError("Member not found.");
  return toMember(row);
}

export async function changeRole(userId: string, orgId: string, memberId: string, role: Exclude<OrgRole, "owner">): Promise<void> {
  await requireRole(userId, orgId, isOrgAdmin);
  const m = await memberRow(orgId, memberId);
  if (m.role === "owner") throw new ForbiddenError("The owner's role can't be changed.");
  must(await db().from("organization_members").update({ role }).eq("organization_id", orgId).eq("user_id", memberId));
  await writeAudit({ actorId: userId, organizationId: orgId, entityType: "membership", entityId: memberId, action: "membership.role_changed", metadata: { role } });
}

/** Offboarding: removes access and unpublishes the person's company cards; personal cards are untouched. */
export async function setMemberStatus(userId: string, orgId: string, memberId: string, status: Membership["status"]): Promise<void> {
  await requireRole(userId, orgId, isOrgAdmin);
  const m = await memberRow(orgId, memberId);
  if (m.role === "owner") throw new ForbiddenError("The owner can't be deactivated.");
  must(await db().from("organization_members").update({ status }).eq("organization_id", orgId).eq("user_id", memberId));
  if (status === "deactivated") {
    const cards = must(await db().from("cards").select("id, version").eq("organization_id", orgId).eq("owner_user_id", memberId).eq("status", "published"));
    for (const c of cards) must(await db().from("cards").update({ status: "draft", version: c.version + 1 }).eq("id", c.id));
  }
  await writeAudit({ actorId: userId, organizationId: orgId, entityType: "membership", entityId: memberId, action: `membership.${status}`, metadata: {} });
}

export async function updateBrand(userId: string, orgId: string, patch: { name: string; brand: Organization["brand"]; logoMediaId?: string | null }): Promise<Organization> {
  await requireRole(userId, orgId, isOrgAdmin);
  const row = must(
    await db()
      .from("organizations")
      .update({ name: patch.name, brand: patch.brand, ...(patch.logoMediaId !== undefined && { logo_media_id: patch.logoMediaId }) })
      .eq("id", orgId)
      .select("*")
      .single(),
  );
  const org = toOrg(row);
  // Locked fields take effect on every company card immediately ("update once, everywhere").
  const locked = org.brand.lockedFields;
  if (locked.length) {
    const cards = must(await db().from("cards").select("*").eq("organization_id", orgId)).map(toCard);
    for (const card of cards) {
      const c = structuredClone(card);
      if (locked.includes("theme")) c.theme = { template: org.brand.template, accent: org.brand.accent };
      if (locked.includes("company")) c.company = org.brand.company || org.name;
      if (locked.includes("website")) c.contacts.website = org.brand.website;
      must(await db().from("cards").update({ theme: c.theme, company: c.company, contacts: c.contacts, version: card.version + 1 }).eq("id", card.id));
    }
  }
  await writeAudit({ actorId: userId, organizationId: orgId, entityType: "organization", entityId: orgId, action: "organization.brand_updated", metadata: {} });
  return org;
}

/** Creates a draft company card owned by the member, prefilled from the brand. */
export async function createCompanyCard(userId: string, orgId: string, memberId: string, slug: string): Promise<Card> {
  await requireRole(userId, orgId, canManageCards);
  const org = await orgById(orgId);
  const member = await memberRow(orgId, memberId);
  if (member.status !== "active") throw new NotFoundError("Member not found.");
  const profile = toProfile(must(await db().from("profiles").select("*").eq("id", memberId).single()));
  const taken = maybe(await db().from("cards").select("id").eq("slug", slug).maybeSingle()) ?? maybe(await db().from("card_slug_history").select("card_id").eq("old_slug", slug).maybeSingle());
  if (taken) throw new ForbiddenError("That address is already taken.");
  const base = emptyCardContent(profile.displayName);
  const content = {
    ...base,
    label: `${org.name} card`,
    company: org.brand.company || org.name,
    contacts: { ...base.contacts, email: profile.email, website: org.brand.website },
    theme: { template: org.brand.template, accent: org.brand.accent },
  };
  try {
    const row = must(
      await db()
        .from("cards")
        .insert({ ...contentToRow(content), owner_user_id: memberId, organization_id: orgId, slug, avatar_media_id: profile.avatarMediaId ?? null })
        .select("*")
        .single(),
    );
    const card = toCard(row);
    await writeAudit({ actorId: userId, organizationId: orgId, entityType: "card", entityId: card.id, action: "card.company_created", metadata: { memberId, slug } });
    return card;
  } catch (err) {
    if (isUniqueViolation(err)) throw new ForbiddenError("That address is already taken.");
    throw err;
  }
}
