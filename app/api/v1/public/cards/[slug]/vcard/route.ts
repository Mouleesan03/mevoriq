import { findPublicCard } from "@/lib/cards/public";
import { getCurrentUser } from "@/lib/auth/session";
import { recordEvent } from "@/lib/data/analytics";
import { findPublishedBySlug } from "@/lib/data/cards";
import { isBot } from "@/lib/rate-limit";
import { publicCardUrl } from "@/lib/cards/urls";
import { buildVCard, vcardFilename } from "@/lib/vcard";

export async function GET(req: Request, ctx: RouteContext<"/api/v1/public/cards/[slug]/vcard">) {
  const { slug } = await ctx.params;
  const found = await findPublicCard(slug);
  if (!found) return Response.json({ error: "not_found" }, { status: 404 });
  const { card } = found;
  const raw = await findPublishedBySlug(slug.toLowerCase());
  const owner = raw && "card" in raw ? raw.card.ownerUserId : null;
  if (!isBot(req.headers.get("user-agent")) && (await getCurrentUser())?.id !== owner) await recordEvent(found.cardId, "save_contact");

  return new Response(buildVCard(card, publicCardUrl(card.slug)), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${vcardFilename(card)}"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
