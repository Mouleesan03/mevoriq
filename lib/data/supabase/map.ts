import "server-only";
import type { Card, CardContent, Profile } from "@/lib/cards/types";
import type { AbuseReport, AuditLog, ContactMessage, Invitation, Lead, Media, Membership, NetworkEvent, Organization } from "@/lib/data/models";

/* Row shapes (snake_case) ↔ app models (camelCase). Kept in one place so the schema and models stay in step. */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

export const toProfile = (r: Row): Profile => ({ id: r.id, displayName: r.display_name, email: r.email, avatarMediaId: r.avatar_media_id, createdAt: r.created_at });

export const toCard = (r: Row): Card => ({
  id: r.id,
  ownerUserId: r.owner_user_id,
  organizationId: r.organization_id,
  avatarMediaId: r.avatar_media_id,
  slug: r.slug,
  label: r.label,
  context: r.context,
  fullName: r.full_name,
  pronouns: r.pronouns,
  headline: r.headline,
  company: r.company,
  bio: r.bio,
  contacts: { email: "", phone: "", whatsapp: "", website: "", location: "", ...(r.contacts ?? {}) },
  links: r.links ?? [],
  theme: r.theme,
  status: r.status,
  publishedAt: r.published_at,
  version: r.version,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const contentToRow = (c: CardContent) => ({
  label: c.label,
  context: c.context,
  full_name: c.fullName,
  pronouns: c.pronouns,
  headline: c.headline,
  company: c.company,
  bio: c.bio,
  contacts: c.contacts,
  links: c.links,
  theme: c.theme,
});

export const toLead = (r: Row): Lead => ({
  id: r.id,
  cardId: r.card_id,
  ownerUserId: r.owner_user_id,
  organizationId: r.organization_id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  company: r.company,
  message: r.message,
  consentVersion: r.consent_version,
  consentAt: r.consent_at,
  marketingConsent: r.marketing_consent,
  status: r.status,
  tags: r.tags ?? [],
  note: r.note,
  followUpAt: r.follow_up_at,
  eventId: r.event_id ?? null,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const toNetworkEvent = (r: Row): NetworkEvent => ({ id: r.id, ownerUserId: r.owner_user_id, name: r.name, tag: r.tag, startedAt: r.started_at, endedAt: r.ended_at, createdAt: r.created_at });

export const toMedia = (r: Row): Media => ({ id: r.id, ownerUserId: r.owner_user_id, kind: r.kind, mime: r.mime, width: r.width, height: r.height, bytes: r.bytes, createdAt: r.created_at });

export const toOrg = (r: Row): Organization => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  ownerId: r.owner_id,
  logoMediaId: r.logo_media_id,
  brand: { lockedFields: [], adminsCanViewLeads: false, company: "", website: "", ...r.brand },
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const toMember = (r: Row): Membership => ({ organizationId: r.organization_id, userId: r.user_id, role: r.role, status: r.status, joinedAt: r.joined_at });

export const toInvitation = (r: Row): Invitation => ({
  id: r.id,
  organizationId: r.organization_id,
  email: r.email,
  role: r.role,
  tokenHash: r.token_hash,
  expiresAt: r.expires_at,
  acceptedAt: r.accepted_at,
  revokedAt: r.revoked_at,
  createdBy: r.created_by,
  createdAt: r.created_at,
});

export const toReport = (r: Row): AbuseReport => ({
  id: r.id,
  cardId: r.card_id,
  slug: r.slug,
  reason: r.reason,
  details: r.details,
  reporterEmail: r.reporter_email,
  state: r.state,
  createdAt: r.created_at,
  resolvedAt: r.resolved_at,
  resolvedBy: r.resolved_by,
});

export const toMessage = (r: Row): ContactMessage => ({ id: r.id, name: r.name, email: r.email, topic: r.topic, message: r.message, state: r.state, createdAt: r.created_at });

export const toAudit = (r: Row): AuditLog => ({
  id: r.id,
  actorId: r.actor_id,
  organizationId: r.organization_id,
  entityType: r.entity_type,
  entityId: r.entity_id,
  action: r.action,
  metadata: r.metadata ?? {},
  createdAt: r.created_at,
});
