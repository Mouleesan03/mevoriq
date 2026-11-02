"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerBusinessAction } from "@/lib/actions/team";
import type { FormState } from "@/lib/actions/shared";

export function RegisterBusinessForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(registerBusinessAction, { ok: false });
  const errors = state.errors ?? {};
  return (
    <form action={action} className="space-y-5" noValidate>
      {state.message && !state.ok && <p role="alert" className="text-sm text-danger">{state.message}</p>}
      <div className="space-y-1.5">
        <Label htmlFor="biz-name">Company name</Label>
        <Input id="biz-name" name="name" autoComplete="organization" placeholder="Infonits" maxLength={80} required aria-invalid={!!errors.name} />
        {errors.name && <p className="text-sm text-danger">{errors.name}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="biz-site">Website <span className="font-normal text-muted-foreground">(optional)</span></Label>
        <Input id="biz-site" name="website" inputMode="url" autoComplete="url" placeholder="infonits.io" aria-invalid={!!errors.website} />
        {errors.website ? <p className="text-sm text-danger">{errors.website}</p> : <p className="text-[13px] text-muted-foreground">Matching your sign-in email domain gives your team’s cards a verified badge.</p>}
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : null} Register company <ArrowRight />
      </Button>
    </form>
  );
}
