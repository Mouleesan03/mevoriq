"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveReportAction, setFlagAction, setMessageStateAction } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

export function ReportActions({ reportId, open, suspended }: { reportId: string; open: boolean; suspended: boolean }) {
  const [pending, start] = useTransition();
  const run = (action: "suspend" | "restore" | "dismiss") => start(async () => void (await resolveReportAction(reportId, action)));
  return (
    <div className="flex flex-wrap gap-2">
      {pending && <Loader2 className="size-4 animate-spin self-center text-muted-foreground" />}
      {!suspended && (
        <Button size="sm" variant="destructive" disabled={pending} onClick={() => window.confirm("Take this card offline? The owner can’t republish it until you restore it.") && run("suspend")}>
          Suspend card
        </Button>
      )}
      {suspended && <Button size="sm" variant="outline" disabled={pending} onClick={() => run("restore")}>Restore</Button>}
      {open && <Button size="sm" variant="ghost" disabled={pending} onClick={() => run("dismiss")}>Dismiss</Button>}
    </div>
  );
}

export function MessageToggle({ id, done }: { id: string; done: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button size="sm" variant={done ? "ghost" : "outline"} disabled={pending} onClick={() => start(async () => void (await setMessageStateAction(id, done ? "new" : "done")))}>
      {done ? "Mark as new" : "Mark as done"}
    </Button>
  );
}

export function FlagToggle({ flagKey, enabled }: { flagKey: string; enabled: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={flagKey}
      disabled={pending}
      onClick={() => start(async () => void (await setFlagAction(flagKey, !enabled)))}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none disabled:opacity-60", enabled ? "bg-mint-ink" : "bg-border")}
    >
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", enabled ? "translate-x-5.5" : "translate-x-0.5")} />
    </button>
  );
}
