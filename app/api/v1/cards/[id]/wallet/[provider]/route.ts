import { getCurrentUser } from "@/lib/auth/session";
import { getCardForEdit } from "@/lib/data/cards";
import { displayCardUrl, publicCardUrl } from "@/lib/cards/urls";
import { applePass, appleWalletConfigured } from "@/lib/wallet/apple";
import { passContent } from "@/lib/wallet/content";
import { googleWalletConfigured, googleWalletSaveUrl } from "@/lib/wallet/google";

/** Add your own live card to Apple Wallet (.pkpass) or Google Wallet (redirect to the save link). */
export async function GET(_req: Request, ctx: RouteContext<"/api/v1/cards/[id]/wallet/[provider]">) {
  const { id, provider } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const found = await getCardForEdit(user.id, id);
  if (!found || found.card.status !== "published") return new Response("Not found", { status: 404 });
  const content = passContent(found.card, publicCardUrl(found.card.slug), displayCardUrl(found.card.slug));

  if (provider === "apple") {
    if (!appleWalletConfigured()) return new Response("Apple Wallet is not set up", { status: 503 });
    return new Response(new Uint8Array(await applePass(content)), {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="mevoriq-${found.card.slug}.pkpass"`,
        "Cache-Control": "no-store",
      },
    });
  }
  if (provider === "google") {
    if (!googleWalletConfigured()) return new Response("Google Wallet is not set up", { status: 503 });
    return Response.redirect(googleWalletSaveUrl(content), 303);
  }
  return new Response("Not found", { status: 404 });
}
