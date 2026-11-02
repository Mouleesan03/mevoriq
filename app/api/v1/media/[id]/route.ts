import { readMedia } from "@/lib/data/media";

/** Card photos and organization logos (public by design: they appear on published cards). */
export async function GET(_req: Request, ctx: RouteContext<"/api/v1/media/[id]">) {
  const { id } = await ctx.params;
  const found = await readMedia(id);
  if (!found) return new Response("Not found", { status: 404 });
  if ("url" in found) return Response.redirect(found.url, 308);
  return new Response(new Uint8Array(found.data), {
    headers: {
      "Content-Type": found.media.mime,
      "Cache-Control": "public, max-age=31536000, immutable", // ids are never reused
      "X-Content-Type-Options": "nosniff",
    },
  });
}
