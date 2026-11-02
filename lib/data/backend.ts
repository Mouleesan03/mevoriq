import "server-only";
import { isSupabaseConfigured } from "@/lib/env";

/** Supabase when its environment is set (production), otherwise the local development store. */
export function pick<L, R>(local: L, remote: R): L | R {
  return isSupabaseConfigured() ? remote : local;
}
