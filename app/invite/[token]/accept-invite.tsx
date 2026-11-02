"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptInviteAction } from "@/lib/actions/team";

export function AcceptInvite({ token, signedInAs }: { token: string; signedInAs: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <Button
        size="lg"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await acceptInviteAction(token);
            if (res && !res.ok) setError(res.message ?? "Couldn’t accept the invitation.");
          })
        }
      >
        {pending && <Loader2 className="animate-spin" />} Accept and join
      </Button>
      <p className="text-[13px] text-muted-foreground">Signed in as {signedInAs}</p>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}
