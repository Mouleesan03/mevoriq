import type { TemplateKey } from "@/lib/cards/themes";

export const CARD_CONTEXTS = ["professional", "freelancer", "event", "creator", "personal"] as const;
export type CardContext = (typeof CARD_CONTEXTS)[number];

export const LINK_KINDS = ["website", "portfolio", "linkedin", "github", "x", "instagram", "youtube", "calendar", "other"] as const;
export type LinkKind = (typeof LINK_KINDS)[number];

/** "suspended" = taken down by platform moderation; owners cannot republish it. */
export type CardStatus = "draft" | "published" | "archived" | "suspended";

export interface CardLink {
  id: string;
  kind: LinkKind;
  label: string;
  url: string;
}

export interface CardContacts {
  email: string;
  phone: string; // E.164, e.g. +447700900123
  whatsapp: string; // E.164
  website: string;
  location: string;
}

/** Fields the owner edits. Mirrors `cards` + `card_contacts` + `card_links` + `card_themes` (docs/product-plan.md §8). */
export interface CardContent {
  label: string; // owner-facing name, e.g. "Work card"
  context: CardContext;
  fullName: string;
  pronouns: string;
  headline: string; // job title
  company: string;
  bio: string;
  contacts: CardContacts;
  links: CardLink[];
  theme: { template: TemplateKey; accent: string };
}

export interface Card extends CardContent {
  id: string;
  ownerUserId: string;
  organizationId: string | null;
  avatarMediaId: string | null;
  slug: string;
  status: CardStatus;
  publishedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** Whitelisted data served to anonymous visitors. Never add private fields here. */
export interface PublicCard {
  slug: string;
  fullName: string;
  pronouns: string;
  headline: string;
  company: string;
  bio: string;
  contacts: CardContacts;
  links: Omit<CardLink, "id">[];
  theme: { template: TemplateKey; accent: string };
  avatarUrl: string | null;
  logoUrl: string | null;
  verifiedDomain?: string | null; // see lib/cards/verified.ts
}

export interface Profile {
  id: string;
  displayName: string;
  email: string;
  avatarMediaId?: string | null;
  createdAt: string;
}

export const mediaUrl = (id: string | null | undefined) => (id ? `/api/v1/media/${id}` : null);

export function toPublicCard(card: Card, logoMediaId: string | null = null): PublicCard {
  return {
    slug: card.slug,
    fullName: card.fullName,
    pronouns: card.pronouns,
    headline: card.headline,
    company: card.company,
    bio: card.bio,
    contacts: { ...card.contacts },
    links: card.links.map(({ kind, label, url }) => ({ kind, label, url })),
    theme: { ...card.theme },
    avatarUrl: mediaUrl(card.avatarMediaId),
    logoUrl: mediaUrl(logoMediaId),
  };
}

export function emptyCardContent(fullName = ""): CardContent {
  return {
    label: "My card",
    context: "professional",
    fullName,
    pronouns: "",
    headline: "",
    company: "",
    bio: "",
    contacts: { email: "", phone: "", whatsapp: "", website: "", location: "" },
    links: [],
    theme: { template: "minimal-white", accent: "#2448E8" },
  };
}
