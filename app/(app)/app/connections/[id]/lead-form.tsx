"use client";

import { useActionState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteLeadAction, updateLeadAction } from "@/lib/actions/leads";
import type { FormState } from "@/lib/actions/shared";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/data/models";
import { cn } from "@/lib/utils";

const LABEL: Record<LeadStatus, string> = { new: "New", following_up: "Following up", done: "Done", archived: "Archived" };

export function LeadForm({ lead }: { lead: Pick<Lead, "id" | "status" | "tags" | "note" | "followUpAt"> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateLeadAction.bind(null, lead.id), { ok: false });
  const [deleting, startDelete] = useTransition();
  return (
    <form action={action} className="space-y-6 rounded-[16px] bg-fill p-6">
      <fieldset>
        <legend className="mb-2.5 text-[13px] font-medium">Status</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {LEAD_STATUSES.map((s) => (
            <label key={s} className="cursor-pointer">
              <input type="radio" name="status" value={s} defaultChecked={lead.status === s} className="peer sr-only" />
              <span className={cn("block rounded-xl border px-3 py-2.5 text-center text-[13px] transition-colors peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/40")}>
                {LABEL[s]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="followUpAt" className="text-[13px]">Follow up on</Label>
          <Input id="followUpAt" name="followUpAt" type="date" defaultValue={lead.followUpAt ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tags" className="text-[13px]">Tags</Label>
          <Input id="tags" name="tags" defaultValue={lead.tags.join(", ")} placeholder="devfest, design" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="note" className="text-[13px]">Private note</Label>
        <Textarea id="note" name="note" rows={5} defaultValue={lead.note} placeholder="Where you met, what you talked about, what to send them." />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Save changes</Button>
        <span className={cn("text-[13px]", state.ok ? "text-mint-ink" : "text-danger")} aria-live="polite">{state.message}</span>
        <Button
          type="button"
          variant="ghost"
          className="ml-auto text-danger hover:bg-danger/8 hover:text-danger"
          disabled={deleting}
          onClick={() => {
            if (window.confirm("Delete this contact? This can’t be undone.")) startDelete(async () => void (await deleteLeadAction(lead.id)));
          }}
        >
          {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />} Delete
        </Button>
      </div>
    </form>
  );
}
