"use client";

import { useActionState, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/site/avatar";
import { deleteAccountAction, updateProfileAction } from "@/lib/actions/settings";
import type { FormState } from "@/lib/actions/shared";
import { cn } from "@/lib/utils";

export function ProfileForm({ displayName, email, avatarUrl }: { displayName: string; email: string; avatarUrl: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfileAction, { ok: false });
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [remove, setRemove] = useState(false);
  return (
    <form action={action} className="max-w-lg space-y-6">
      <div className="flex flex-wrap items-center gap-5">
        <Avatar name={displayName} src={remove ? null : preview} size={72} />
        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild>
            <label className="cursor-pointer">
              <Camera /> {preview ? "Replace photo" : "Upload photo"}
              <input
                type="file"
                name="photo"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setPreview(URL.createObjectURL(f));
                    setRemove(false);
                  }
                }}
              />
            </label>
          </Button>
          {preview && !remove && (
            <Button type="button" variant="ghost" onClick={() => setRemove(true)}>Remove</Button>
          )}
          {remove && <input type="hidden" name="removePhoto" value="on" />}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="displayName" className="text-[13px]">Name</Label>
        <Input id="displayName" name="displayName" defaultValue={displayName} autoComplete="name" aria-invalid={!!state.errors?.displayName} />
        {state.errors?.displayName && <p className="text-[13px] text-danger">{state.errors.displayName}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-[13px]">Email</Label>
        <Input id="email" value={email} disabled />
        <p className="text-[13px] text-muted-foreground">Your sign-in email. It can’t be changed in demo mode.</p>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Save profile</Button>
        <span className={cn("text-[13px]", state.ok ? "text-mint-ink" : "text-danger")} aria-live="polite">{state.message}</span>
      </div>
    </form>
  );
}

export function DeleteAccountForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(deleteAccountAction, { ok: false });
  return (
    <form action={action} className="max-w-lg space-y-4">
      {state.message && <p role="alert" className="rounded-xl bg-danger/8 px-4 py-3 text-sm text-danger">{state.message}</p>}
      <div className="space-y-1.5">
        <Label htmlFor="confirm" className="text-[13px]">Type <span className="font-mono">{email}</span> to confirm</Label>
        <Input id="confirm" name="confirm" autoComplete="off" aria-invalid={!!state.errors?.confirm} />
        {state.errors?.confirm && <p className="text-[13px] text-danger">{state.errors.confirm}</p>}
      </div>
      <Button type="submit" variant="destructive" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Delete my account</Button>
    </form>
  );
}
