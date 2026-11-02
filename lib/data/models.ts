/** Stored records beyond cards (mirrors docs/product-plan.md §8). */
import type { TemplateKey } from "@/lib/cards/themes";

export type LeadStatus = "new" | "following_up" | "done" | "archived";
export const LEAD_STATUSES: LeadStatus[] = ["new", "following_up", "done", "archived"];

export interface Lead {
  id: string;
  cardId: string;
  ownerUserId: string; // card owner when the lead arrived
  organizationId: string | null;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  consentVersion: string;
  consentAt: string;
  marketingConsent: boolean;
  status: LeadStatus;
  tags: string[];
  note: string;
  followUpAt: string | null; // YYYY-MM-DD
  eventId: string | null; // the owner's live event when the lead arrived
  createdAt: string;
  updatedAt: string;
}

/** Event Mode: while one is live, every new contact is tagged with it (see lib/events.ts). */
export interface NetworkEvent {
  id: string;
  ownerUserId: string;
  name: string;
  tag: string;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
}

export interface Media {
  id: string;
  ownerUserId: string;
  kind: "avatar" | "logo";
  mime: "image/webp";
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
}

export const EVENT_TYPES = ["view", "unique_view", "save_contact", "link_click", "qr_download", "exchange"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export type OrgRole = "owner" | "admin" | "manager" | "member";
export const ORG_ROLES: OrgRole[] = ["owner", "admin", "manager", "member"];

/** Card fields an organization can lock on company cards. */
export const LOCKABLE_FIELDS = ["theme", "company", "website"] as const;
export type LockableField = (typeof LOCKABLE_FIELDS)[number];

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  logoMediaId: string | null;
  brand: {
    template: TemplateKey;
    accent: string;
    company: string;
    website: string;
    lockedFields: LockableField[];
    adminsCanViewLeads: boolean;
  };
  status: "active" | "suspended";
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  organizationId: string;
  userId: string;
  role: OrgRole;
  status: "active" | "deactivated";
  joinedAt: string;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: Exclude<OrgRole, "owner">;
  tokenHash: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdBy: string;
  createdAt: string;
}

export type ReportReason = "impersonation" | "spam" | "offensive" | "scam" | "other";
export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "impersonation", label: "Pretending to be someone else" },
  { value: "scam", label: "Scam or fraud" },
  { value: "spam", label: "Spam" },
  { value: "offensive", label: "Offensive content" },
  { value: "other", label: "Something else" },
];

export interface AbuseReport {
  id: string;
  cardId: string;
  slug: string;
  reason: ReportReason;
  details: string;
  reporterEmail: string;
  state: "open" | "actioned" | "dismissed";
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  topic: "general" | "support" | "teams" | "privacy" | "press";
  message: string;
  state: "new" | "done";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  organizationId: string | null;
  entityType: "card" | "organization" | "membership" | "invitation" | "report" | "flag" | "account";
  entityId: string;
  action: string;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export interface FeatureFlag {
  key: string;
  description: string;
  enabled: boolean;
}

export const DEFAULT_FLAGS: FeatureFlag[] = [
  { key: "contact_exchange", description: "Visitors can share their details back from a public card.", enabled: true },
  { key: "teams", description: "People can create organizations and company cards.", enabled: true },
  { key: "signups", description: "New people can create an account.", enabled: true },
  { key: "maintenance_mode", description: "Show a maintenance notice on public cards.", enabled: false },
];
