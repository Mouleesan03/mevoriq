import "server-only";
import { cookies } from "next/headers";
import { findPublicCard } from "@/lib/cards/public";
import { listCards } from "@/lib/data/cards";

/**
 * Reply card loop: someone who saved a card makes their own and sends it back.
 * `/r/[slug]` remembers which card they came from (the slug only, nothing personal) for 7 days.
 */
export const REPLY_COOKIE = "mevoriq_reply_to";
export const REPLY_MAX_AGE = 7 * 24 * 60 * 60;

export interface ReplyTarget {
  slug: string;
  cardId: string;
  name: string;
  firstName: string;
  myCard: { slug: string; company: string } | null; // the signed-in person's first live card
}

/** First name of the card owner they just replied to (shown once after sending). */
export async function justRepliedTo(): Promise<string | null> {
  const value = (await cookies()).get(REPLY_COOKIE)?.value;
  if (!value?.startsWith("sent:")) return null;
  const found = await findPublicCard(value.slice(5));
  return found ? found.card.fullName.split(" ")[0] : null;
}

/** The card this person came from, if they still have one to reply to and it isn't their own. */
export async function getReplyTarget(userId: string): Promise<ReplyTarget | null> {
  const slug = (await cookies()).get(REPLY_COOKIE)?.value;
  if (!slug) return null;
  const [found, mine] = await Promise.all([findPublicCard(slug), listCards(userId)]);
  if (!found || mine.some((c) => c.id === found.cardId)) return null;
  const live = mine.find((c) => c.status === "published");
  return {
    slug: found.card.slug,
    cardId: found.cardId,
    name: found.card.fullName,
    firstName: found.card.fullName.split(" ")[0],
    myCard: live ? { slug: live.slug, company: live.company } : null,
  };
}
