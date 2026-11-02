import "server-only";
import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { isSupabaseConfigured } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Fixed-window limiter for public endpoints (contact exchange, reports, events).
 * Production uses the shared Postgres limiter (hit_rate_limit) so it works across serverless
 * instances; the local store uses memory.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const hashed = createHash("sha256").update(key).digest("hex").slice(0, 40);
    const { data, error } = await supabaseAdmin().rpc("hit_rate_limit", { p_key: hashed, p_limit: limit, p_window_seconds: Math.ceil(windowMs / 1000) });
    return error ? true : Boolean(data); // fail open: never block real visitors because the limiter is down
  }
  return memoryLimit(key, limit, windowMs);
}

function memoryLimit(key: string, limit: number, windowMs: number): boolean {
  const t = Date.now();
  if (buckets.size > 10_000) for (const [k, b] of buckets) if (b.resetAt < t) buckets.delete(k);
  const b = buckets.get(key);
  if (!b || b.resetAt < t) {
    buckets.set(key, { count: 1, resetAt: t + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

/** Hashed client address: used only as a rate-limit key, never stored. */
export async function clientKey(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|preview|monitor|curl|wget|python|headless/i;
export const isBot = (ua: string | null) => !ua || BOT_UA.test(ua);
