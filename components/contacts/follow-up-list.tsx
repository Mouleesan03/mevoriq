import Link from "next/link";
import { Check } from "lucide-react";
import { Avatar } from "@/components/site/avatar";
import { completeFollowUpAction } from "@/lib/actions/leads";
import type { LeadRow } from "@/lib/data/leads";
import { dueLabel } from "@/lib/follow-ups";
import { cn } from "@/lib/utils";

/** Contacts due for a follow-up, each with a one-tap "Done". */
export function FollowUpList({ leads, today }: { leads: LeadRow[]; today: string }) {
  return (
    <ul className="divide-y overflow-hidden rounded-[14px] border bg-surface">
      {leads.map((l) => {
        const overdue = l.followUpAt! < today;
        return (
          <li key={l.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <Link href={`/app/connections/${l.id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl hover:opacity-80">
              <Avatar name={l.name} size={36} className="bg-muted text-foreground" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{l.name}</span>
                <span className="block truncate text-[13px] text-muted-foreground">{l.note || l.company || l.email}</span>
              </span>
            </Link>
            <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium", overdue ? "bg-coral/15 text-[#A3321F]" : "bg-yellow/40 text-ink")}>{dueLabel(l.followUpAt!, today)}</span>
            <form action={completeFollowUpAction.bind(null, l.id)}>
              <button type="submit" className="flex size-10 items-center justify-center rounded-full bg-fill text-ink transition-colors hover:bg-mint focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none" aria-label={`Mark ${l.name} as done`}>
                <Check className="size-4" />
              </button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}
