import { type NextRequest, NextResponse } from "next/server";
import { supabaseAuth } from "@/lib/supabase/server";
import { listCards } from "@/lib/data/cards";

/**
 * Landing point for the email sign-in link and Google sign-in.
 * Exchanges the one-time code for a session cookie, then continues to the app.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "";

  if (!code) return NextResponse.redirect(new URL("/login?error=link", url.origin));
  const supabase = await supabaseAuth();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL("/login?error=link", url.origin));

  if (safeNext) return NextResponse.redirect(new URL(safeNext, url.origin));
  const cards = await listCards(data.user.id).catch(() => []);
  return NextResponse.redirect(new URL(cards.length ? "/app" : "/onboarding", url.origin));
}
