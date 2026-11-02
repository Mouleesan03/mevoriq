import "server-only";
import { notFound, permanentRedirect } from "next/navigation";
import { findPublishedBySlug } from "@/lib/data/cards";
import { getProfile } from "@/lib/data/profiles";
import { toPublicCard, type Card, type PublicCard } from "@/lib/cards/types";
import { verifiedDomain } from "@/lib/cards/verified";

async function project(card: Card, logoMediaId: string | null): Promise<PublicCard> {
  const owner = await getProfile(card.ownerUserId);
  return { ...toPublicCard(card, logoMediaId), verifiedDomain: owner ? verifiedDomain(owner.email, card.contacts) : null };
}

/**
 * Resolves a public slug to whitelisted card data.
 * Former slugs redirect (308) to the current address, so printed QR codes keep working.
 * Drafts, archived, suspended and unknown cards are 404s.
 */
export async function loadPublicCard(slug: string, suffix = ""): Promise<{ card: PublicCard; cardId: string }> {
  const result = await findPublishedBySlug(slug.toLowerCase());
  if (!result) notFound();
  if ("redirectTo" in result) permanentRedirect(`/u/${result.redirectTo}${suffix}`);
  return { card: await project(result.card, result.logoMediaId), cardId: result.card.id };
}

export async function findPublicCard(slug: string): Promise<{ card: PublicCard; cardId: string } | null> {
  const result = await findPublishedBySlug(slug.toLowerCase());
  return result && "card" in result ? { card: await project(result.card, result.logoMediaId), cardId: result.card.id } : null;
}
