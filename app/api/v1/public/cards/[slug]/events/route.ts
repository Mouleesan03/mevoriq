import { cookies, headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { isQrSource } from "@/lib/cards/sources";
import { recordEvent, recordSourceView } from "@/lib/data/analytics";
import { findPublishedBySlug } from "@/lib/data/cards";
import { clientKey, isBot, rateLimit } from "@/lib/rate-limit";

const ALLOWED = new Set(["view", "link_click"]);

/**
 * Beacon from the public card. Counts are aggregated per day; nothing identifying is stored.
 * Owner previews and obvious bots are skipped (AN-06). A 30-minute cookie dedupes unique views.
 */
export async function POST(req: Request, ctx: RouteContext<"/api/v1/public/cards/[slug]/events">) {
  const { slug } = await ctx.params;
  const body = (await req.json().catch(() => null)) as { type?: string; source?: unknown } | null;
  const type = body?.type ?? "";
  if (!ALLOWED.has(type)) return new Response(null, { status: 400 });
  if (isBot((await headers()).get("user-agent"))) return new Response(null, { status: 204 });
  if (!(await rateLimit(`events:${await clientKey()}:${slug}`, 60, 60_000))) return new Response(null, { status: 429 });

  const found = await findPublishedBySlug(slug);
  if (!found || !("card" in found)) return new Response(null, { status: 404 });
  const user = await getCurrentUser();
  if (user?.id === found.card.ownerUserId) return new Response(null, { status: 204 });

  if (type === "view") {
    await recordEvent(found.card.id, "view");
    if (isQrSource(body?.source)) await recordSourceView(found.card.id, body.source);
    const jar = await cookies();
    const name = `mv_seen_${found.card.id.slice(0, 8)}`;
    // No counting cookie for people who opted out or send Global Privacy Control; their view still counts, just not as "unique".
    const optedOut = jar.get("mv_optout")?.value === "1" || (await headers()).get("sec-gpc") === "1";
    if (!optedOut && !jar.get(name)) {
      await recordEvent(found.card.id, "unique_view");
      jar.set(name, "1", { maxAge: 30 * 60, httpOnly: true, sameSite: "lax", path: "/" });
    }
  } else {
    await recordEvent(found.card.id, "link_click");
  }
  return new Response(null, { status: 204 });
}
