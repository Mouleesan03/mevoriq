import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { REPLY_COOKIE, REPLY_MAX_AGE } from "@/lib/reply";

/** "Make your own card" from a public card: remember where they came from, then sign in (or go home if signed in). */
export async function GET(req: Request, ctx: RouteContext<"/r/[slug]">) {
  const { slug } = await ctx.params;
  const user = await getCurrentUser();
  const res = NextResponse.redirect(new URL(user ? "/app" : "/login", req.url));
  if (/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug.toLowerCase())) {
    res.cookies.set(REPLY_COOKIE, slug.toLowerCase(), { maxAge: REPLY_MAX_AGE, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  }
  return res;
}
