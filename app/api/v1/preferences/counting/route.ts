import { NextResponse } from "next/server";

const OPT_OUT_COOKIE = "mv_optout";

/** Turns the anonymous view-counting cookie off (or back on) for this browser. */
export async function POST(req: Request) {
  const off = (await req.formData()).get("off") === "1";
  const res = NextResponse.redirect(new URL("/cookies?saved=1#control", req.url), 303);
  if (off) res.cookies.set(OPT_OUT_COOKIE, "1", { maxAge: 365 * 24 * 60 * 60, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  else res.cookies.delete(OPT_OUT_COOKIE);
  return res;
}
