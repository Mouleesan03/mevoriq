import { findPublicCard } from "@/lib/cards/public";
import { recordEvent } from "@/lib/data/analytics";
import { isQrSource, withSource } from "@/lib/cards/sources";
import { publicCardUrl } from "@/lib/cards/urls";
import { qrPng, qrSvg } from "@/lib/qr";

export async function GET(req: Request, ctx: RouteContext<"/api/v1/public/cards/[slug]/qr">) {
  const { slug } = await ctx.params;
  const found = await findPublicCard(slug);
  if (!found) return Response.json({ error: "not_found" }, { status: 404 });
  const { card } = found;

  const search = new URL(req.url).searchParams;
  const format = search.get("format") === "png" ? "png" : "svg";
  const source = search.get("s");
  const tagged = isQrSource(source) ? source : null;
  const url = withSource(publicCardUrl(card.slug), tagged);
  const headers: Record<string, string> = { "Cache-Control": "public, max-age=300", "X-Robots-Tag": "noindex" };
  if (search.get("download")) await recordEvent(found.cardId, "qr_download");
  if (search.get("download")) headers["Content-Disposition"] = `attachment; filename="mevoriq-${card.slug}${tagged ? `-${tagged}` : ""}-qr.${format}"`;

  if (format === "png") {
    return new Response(new Uint8Array(await qrPng(url)), { headers: { ...headers, "Content-Type": "image/png" } });
  }
  return new Response(await qrSvg(url), { headers: { ...headers, "Content-Type": "image/svg+xml" } });
}
