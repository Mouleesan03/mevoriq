import Link from "next/link";
import { Check, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dismissReplyAction, sendCardBackAction } from "@/lib/actions/reply";
import { getReplyTarget, justRepliedTo } from "@/lib/reply";

/** "Send your card back to Kavin" for people who arrived from someone's card. Renders nothing otherwise. */
export async function ReplyBanner({ userId }: { userId: string }) {
  const sentTo = await justRepliedTo();
  if (sentTo) {
    return (
      <p role="status" className="mt-5 flex items-center gap-3 rounded-[14px] bg-leaf px-4 py-3.5 font-medium text-mint-ink sm:px-5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mint text-ink"><Check className="size-4" /></span>
        Sent. {sentTo} now has your card.
      </p>
    );
  }
  const target = await getReplyTarget(userId);
  if (!target) return null;
  return (
    <section aria-label={`Reply to ${target.name}`} className="mt-5 flex flex-col gap-4 rounded-[14px] bg-sky px-4 py-4 sm:flex-row sm:items-center sm:px-5">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Send your card back to {target.name}</p>
        <p className="text-[14px] text-body">
          {target.myCard
            ? `${target.firstName} gets your name, email and card link in their contacts.`
            : `Publish your card first, then send it to ${target.firstName} in one tap.`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {target.myCard ? (
          <form action={sendCardBackAction}>
            <Button type="submit"><Send /> Send to {target.firstName}</Button>
          </form>
        ) : (
          <Button asChild><Link href="/app/cards">Go to my cards</Link></Button>
        )}
        <form action={dismissReplyAction}>
          <Button type="submit" variant="ghost" size="icon" aria-label="Not now"><X /></Button>
        </form>
      </div>
    </section>
  );
}
