import type { Lead } from "@/lib/data/models";

/** Follow-up reminders (pure, shared by Home and Contacts). Dates are YYYY-MM-DD. */

export const todayIso = (d = new Date()) => d.toISOString().slice(0, 10);

/** Open contacts whose follow-up date is today or earlier, oldest first. */
export function dueFollowUps<T extends Pick<Lead, "followUpAt" | "status">>(leads: T[], today = todayIso()): T[] {
  return leads
    .filter((l) => l.followUpAt && l.followUpAt <= today && l.status !== "done" && l.status !== "archived")
    .sort((a, b) => a.followUpAt!.localeCompare(b.followUpAt!));
}

/** "Today", "Yesterday", "3 days overdue". */
export function dueLabel(followUpAt: string, today = todayIso()): string {
  const days = Math.round((Date.parse(today) - Date.parse(followUpAt)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days overdue`;
}
