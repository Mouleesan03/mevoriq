import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = () => process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Auth client bound to the request cookies (publishable key). Used only for sign-in,
 * sign-out and reading the signed-in user; all data access goes through supabaseAdmin().
 */
export async function supabaseAuth() {
  const jar = await cookies();
  return createServerClient(url(), publishableKey(), {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) jar.set(name, value, options);
        } catch {
          // Called from a Server Component: cookies are read-only there; proxy.ts refreshes the session.
        }
      },
    },
  });
}

let admin: SupabaseClient | null = null;

/** Server-only client with the secret key. Never import this into client code. */
export function supabaseAdmin(): SupabaseClient {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("SUPABASE_SECRET_KEY is not set. Add it to the server environment.");
  admin ??= createClient(url(), secret, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

export const MEDIA_BUCKET = "card-media";

type Result<T> = { data: T; error: { message: string; code?: string } | null };

/** Throws on a Supabase error and returns the data (lists, single rows, writes). */
export function must<T>(res: Result<T>): NonNullable<T> {
  if (res.error) throw Object.assign(new Error(res.error.message), { code: res.error.code });
  return (res.data ?? []) as NonNullable<T>;
}

/** Like must(), for maybeSingle() queries where "no row" is a valid answer. */
export function maybe<T>(res: Result<T>): T | null {
  if (res.error) throw Object.assign(new Error(res.error.message), { code: res.error.code });
  return res.data ?? null;
}
