import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/cards/types";
import { isSupabaseConfigured } from "@/lib/env";
import { ensureProfile, getProfile, signInByEmail } from "@/lib/data/profiles";
import { isPlatformAdmin } from "@/lib/data/shared";
import { supabaseAuth } from "@/lib/supabase/server";

/**
 * Sessions.
 * - Production (Supabase configured): Supabase Auth with cookie sessions (email link or Google).
 * - Local development: a demo session cookie that only holds an opaque user id.
 */
export const SESSION_COOKIE = "mevoriq_demo_session";
const ORG_COOKIE = "mevoriq_org";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function getCurrentUser(): Promise<Profile | null> {
  if (isSupabaseConfigured()) {
    const supabase = await supabaseAuth();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user?.email) return null;
    const name = (user.user_metadata?.display_name as string) || (user.user_metadata?.full_name as string) || user.email.split("@")[0];
    return ensureProfile(user.id, user.email, name);
  }
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return getProfile(id);
}

/** Server-side guard for signed-in pages and every mutation. */
export async function requireUser(): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<Profile> {
  const user = await requireUser();
  if (!isPlatformAdmin(user)) redirect("/app");
  return user;
}

/** Local development only. */
export async function startDemoSession(displayName: string, email: string): Promise<Profile> {
  const profile = await signInByEmail(displayName, email);
  (await cookies()).set(SESSION_COOKIE, profile.id, cookieOptions);
  return profile;
}

export async function endSession() {
  const jar = await cookies();
  if (isSupabaseConfigured()) await (await supabaseAuth()).auth.signOut();
  jar.delete(SESSION_COOKIE);
  jar.delete(ORG_COOKIE);
}

/** The organization chosen in the team switcher (validated against memberships by callers). */
export async function getActiveOrgId(): Promise<string | undefined> {
  return (await cookies()).get(ORG_COOKIE)?.value;
}

export async function setActiveOrgId(orgId: string) {
  (await cookies()).set(ORG_COOKIE, orgId, cookieOptions);
}
