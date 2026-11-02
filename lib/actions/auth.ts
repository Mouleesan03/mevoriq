"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { endSession, startDemoSession } from "@/lib/auth/session";
import { getFlag } from "@/lib/data/admin";
import { listCards } from "@/lib/data/cards";
import { appUrl, isSupabaseConfigured } from "@/lib/env";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { supabaseAuth } from "@/lib/supabase/server";
import { fieldErrors } from "@/lib/validation/card";
import type { FormState } from "@/lib/actions/shared";

const safeNext = (next?: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "");
const callbackUrl = (next: string) => `${appUrl()}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`;

const schema = z.object({
  displayName: z.string().trim().max(80).optional().default(""),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  next: z.string().optional(),
});

/**
 * Email sign-in. Production: Supabase sends a one-time sign-in link (new accounts are created on first use).
 * Local development: signs in immediately with a demo session.
 */
export async function emailSignInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const { displayName, email } = parsed.data;
  const next = safeNext(parsed.data.next);
  const signupsOpen = await getFlag("signups");

  if (isSupabaseConfigured()) {
    if (!(await rateLimit(`signin:${await clientKey()}`, 5, 15 * 60_000)) || !(await rateLimit(`signin-email:${email}`, 3, 15 * 60_000))) {
      return { ok: false, message: "Too many sign-in emails. Wait a few minutes and try again." };
    }
    const supabase = await supabaseAuth();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl(next), shouldCreateUser: signupsOpen, data: displayName ? { display_name: displayName } : undefined },
    });
    if (error) {
      return { ok: false, message: signupsOpen ? "We couldn’t send the sign-in link. Check the address and try again." : "New sign-ups are paused. If you already have an account, check the address and try again." };
    }
    return { ok: true, message: "sent", data: { email } };
  }

  if (!displayName) return { ok: false, errors: { displayName: "Enter your name." } };
  if (!signupsOpen) return { ok: false, message: "New sign-ups are paused right now. Try again later." };
  const user = await startDemoSession(displayName, email);
  if (next) redirect(next);
  redirect((await listCards(user.id)).length ? "/app" : "/onboarding");
}

/** Google sign-in (Supabase only): redirects to Google, then back to /auth/callback. */
export async function googleSignInAction(formData: FormData) {
  const next = safeNext(String(formData.get("next") ?? ""));
  const supabase = await supabaseAuth();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callbackUrl(next) } });
  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}

export async function signOutAction() {
  await endSession();
  redirect("/");
}
