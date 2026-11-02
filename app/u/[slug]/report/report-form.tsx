"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reportCardAction } from "@/lib/actions/admin";
import type { FormState } from "@/lib/actions/shared";
import { REPORT_REASONS } from "@/lib/data/models";

export function ReportForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(reportCardAction, { ok: false });
  const errors = state.errors ?? {};
  if (state.ok) {
    return (
      <p role="status" className="mt-8 flex items-center gap-3 rounded-[14px] border bg-surface p-5 font-medium">
        <span className="flex size-8 items-center justify-center rounded-full bg-mint text-navy"><Check className="size-4" /></span>
        {state.message}
      </p>
    );
  }
  return (
    <form action={action} className="mt-8 space-y-6" noValidate>
      <input type="hidden" name="slug" value={slug} />
      {state.message && <p role="alert" className="text-sm text-danger">{state.message}</p>}
      <fieldset>
        <legend className="mb-3 text-sm font-medium">What’s the problem?</legend>
        <div className="divide-y overflow-hidden rounded-[14px] border bg-surface">
          {REPORT_REASONS.map((r) => (
            <label key={r.value} className="flex cursor-pointer items-center gap-3 px-4 py-3.5 text-[15px] hover:bg-muted/50">
              <input type="radio" name="reason" value={r.value} className="size-4 accent-[var(--mevoriq-navy)]" required />
              {r.label}
            </label>
          ))}
        </div>
        {errors.reason && <p className="mt-2 text-sm text-danger">{errors.reason}</p>}
      </fieldset>
      <div className="space-y-1.5">
        <Label htmlFor="details">Details <span className="font-normal text-muted-foreground">(optional)</span></Label>
        <Textarea id="details" name="details" rows={4} maxLength={1000} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Your email <span className="font-normal text-muted-foreground">(optional, if we need to follow up)</span></Label>
        <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} />
        {errors.email && <p className="text-sm text-danger">{errors.email}</p>}
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} Send report
      </Button>
    </form>
  );
}
