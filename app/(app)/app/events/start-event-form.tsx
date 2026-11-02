"use client";

import { useActionState } from "react";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startEventAction } from "@/lib/actions/events";
import type { FormState } from "@/lib/actions/shared";

export function StartEventForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(startEventAction, { ok: false });
  const error = state.errors?.name ?? (!state.ok ? state.message : undefined);
  return (
    <form action={action} className="flex flex-col gap-3 sm:flex-row" noValidate>
      <label className="flex-1">
        <span className="sr-only">Event name</span>
        <Input name="name" placeholder="Event name, e.g. DevFest Colombo" maxLength={80} required autoComplete="off" aria-invalid={!!error} aria-describedby={error ? "event-name-error" : undefined} className="bg-surface" />
        {error && <span id="event-name-error" role="alert" className="mt-2 block text-sm text-danger">{error}</span>}
      </label>
      <Button type="submit" size="lg" className="h-12" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Play />} Start event
      </Button>
    </form>
  );
}
