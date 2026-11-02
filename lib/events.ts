import type { NetworkEvent } from "@/lib/data/models";
import { slugify } from "@/lib/validation/card";

/** Event Mode rules shared by both data backends and the pages (pure, so they are unit-tested). */

/** A forgotten event stops tagging new contacts after this long. */
export const EVENT_MAX_HOURS = 18;

/** The tag every contact met at the event gets, e.g. "DevFest Colombo 2026" -> "devfest-colombo-2026". */
export function eventTag(name: string): string {
  return slugify(name).slice(0, 30).replace(/-+$/g, "") || "event";
}

/** When the event stopped (or will stop) tagging contacts. */
export function effectiveEnd(e: Pick<NetworkEvent, "startedAt" | "endedAt">): string {
  const cap = new Date(new Date(e.startedAt).getTime() + EVENT_MAX_HOURS * 3_600_000).toISOString();
  return e.endedAt && e.endedAt < cap ? e.endedAt : cap;
}

export function isLive(e: Pick<NetworkEvent, "startedAt" | "endedAt">, at = Date.now()): boolean {
  return !e.endedAt && new Date(effectiveEnd(e)).getTime() > at;
}

/** "3h 20m", "45m". */
export function formatDuration(fromIso: string, toIso: string): string {
  const mins = Math.max(0, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60_000));
  const h = Math.floor(mins / 60);
  return h ? `${h}h${mins % 60 ? ` ${mins % 60}m` : ""}` : `${mins}m`;
}
