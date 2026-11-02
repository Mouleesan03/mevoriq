"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Eye, EyeOff, Loader2, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCardAction, setCardStatusAction } from "@/lib/actions/cards";

export function CopyButton({ value, label = "Copy link", size = "default", variant = "outline" }: { value: string; label?: string; size?: "default" | "sm"; variant?: "outline" | "default" | "secondary" }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copy this", value);
        }
      }}
    >
      {copied ? <Check /> : <Copy />} <span aria-live="polite">{copied ? "Copied" : label}</span>
    </Button>
  );
}

export function NativeShareButton({ url, title }: { url: string; title: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={async () => {
        if (navigator.share) await navigator.share({ url, title }).catch(() => undefined);
        else await navigator.clipboard.writeText(url).catch(() => window.prompt("Copy your link", url));
      }}
    >
      <Share2 /> Share
    </Button>
  );
}

export function PublishToggle({ cardId, published, size = "sm" }: { cardId: string; published: boolean; size?: "sm" | "default" }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant={published ? "outline" : "default"}
      size={size}
      disabled={pending}
      onClick={() => {
        if (published && !window.confirm("Unpublish this card? Its link and QR code show “not available” until you publish again.")) return;
        start(async () => {
          const res = await setCardStatusAction(cardId, published ? "draft" : "published");
          if (!res.ok && res.message) window.alert(res.message);
        });
      }}
    >
      {pending ? <Loader2 className="animate-spin" /> : published ? <EyeOff /> : <Eye />}
      {published ? "Unpublish" : "Publish"}
    </Button>
  );
}

export function DeleteCardButton({ cardId }: { cardId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      className="text-danger hover:bg-danger/8 hover:text-danger"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Delete this card? Its link, QR code and received contacts are removed for good.")) return;
        start(async () => {
          const res = await deleteCardAction(cardId);
          if (res && !res.ok && res.message) window.alert(res.message);
        });
      }}
    >
      {pending ? <Loader2 className="animate-spin" /> : <Trash2 />} Delete card
    </Button>
  );
}
