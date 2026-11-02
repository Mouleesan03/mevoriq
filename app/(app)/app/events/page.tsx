import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, QrCode, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/app-shell";
import { PageLoading } from "@/components/site/page-loading";
import { requireUser } from "@/lib/auth/session";
import { endEventAction } from "@/lib/actions/events";
import { listCards } from "@/lib/data/cards";
import { listEvents, type EventSummary } from "@/lib/data/events";
import { EVENT_MAX_HOURS, formatDuration } from "@/lib/events";
import { formatDate, relativeTime } from "@/lib/format";
import { StartEventForm } from "./start-event-form";

export const metadata: Metadata = { title: "Events" };

const time = (iso: string) => new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;

function LivePanel({ event, meetingSlug }: { event: EventSummary; meetingSlug: string | null }) {
  return (
    <section aria-label="Live event" className="relative overflow-hidden rounded-[16px] bg-blue p-6 text-white sm:rounded-[12px] sm:p-9">
      <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[13px] font-semibold">
        <span className="relative flex size-2"><span className="absolute inset-0 rounded-full bg-mint motion-safe:animate-ping" /><span className="relative size-2 rounded-full bg-mint" /></span>
        Live · started {relativeTime(event.startedAt)}
      </p>
      <h2 className="mt-4 text-[26px] leading-tight font-extrabold tracking-[-0.02em] break-words sm:text-[34px]">{event.name}</h2>
      <p className="mt-6 flex items-baseline gap-3">
        <span className="font-display text-[56px] leading-none font-extrabold tracking-tight sm:text-[72px]">{event.contactCount}</span>
        <span className="text-[15px] text-white/85 sm:text-[17px]">{event.contactCount === 1 ? "person has" : "people have"} shared their details so far</span>
      </p>
      <div className="mt-7 flex flex-wrap gap-2">
        {meetingSlug ? (
          <Button asChild variant="mint"><Link href={`/u/${meetingSlug}/meeting?from=app`}><QrCode /> Open Meeting Mode</Link></Button>
        ) : (
          <Button asChild variant="mint"><Link href="/app/cards">Publish a card to share</Link></Button>
        )}
        <form action={endEventAction.bind(null, event.id)}>
          <Button type="submit" variant="ghost" className="bg-white/12 text-white hover:bg-white/20"><Square /> End and see recap</Button>
        </form>
        {event.contactCount > 0 && (
          <Button asChild variant="ghost" className="text-white hover:bg-white/12"><Link href={`/app/events/${event.id}`}>See who so far <ArrowRight /></Link></Button>
        )}
      </div>
      <p className="mt-5 text-[13px] text-white/75">New contacts are tagged <span className="font-mono">#{event.tag}</span>. If you forget to end it, it stops at {time(event.endsAt)}.</p>
    </section>
  );
}

function StartPanel() {
  return (
    <section aria-labelledby="start-heading" className="rounded-[16px] bg-fill p-6 sm:rounded-[12px] sm:p-9">
      <h2 id="start-heading" className="text-xl font-bold sm:text-2xl">Heading to an event?</h2>
      <p className="mt-1.5 mb-6 max-w-xl text-body">Start it when you arrive. You’ll know exactly who you met there, even weeks later.</p>
      <StartEventForm />
      <ol className="mt-8 grid gap-4 text-[14px] sm:grid-cols-3">
        {[
          ["Arrive and start", "Name the event. Meeting Mode is one tap away."],
          ["Share your card", "Everyone who shares their details back is tagged with the event."],
          ["Get your recap", "End it to see who you met and line up your follow-ups."],
        ].map(([title, text], i) => (
          <li key={title} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface text-[13px] font-bold">{i + 1}</span>
            <span><span className="block font-semibold">{title}</span><span className="text-muted-foreground">{text}</span></span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-[13px] text-muted-foreground">Events end on their own after {EVENT_MAX_HOURS} hours, so contacts from next week aren’t tagged by mistake.</p>
    </section>
  );
}

async function Events() {
  const user = await requireUser();
  const [events, cards] = await Promise.all([listEvents(user.id), listCards(user.id)]);
  const live = events.find((e) => e.live);
  const past = events.filter((e) => !e.live);
  const meetingSlug = cards.find((c) => c.status === "published")?.slug ?? null;
  return (
    <>
      <PageHeader title="Events" description="Tag everyone you meet at a conference, meetup or expo, then get a recap with your follow-ups ready." />
      {live ? <LivePanel event={live} meetingSlug={meetingSlug} /> : <StartPanel />}

      <section aria-labelledby="past-heading" className="mt-12 sm:mt-16">
        <h2 id="past-heading" className="mb-4 text-lg font-bold">Past events</h2>
        {past.length === 0 ? (
          <p className="rounded-2xl border border-dashed px-5 py-8 text-sm text-muted-foreground">Your recaps will be listed here after your first event.</p>
        ) : (
          <ul className="divide-y overflow-hidden rounded-[14px] border bg-surface">
            {past.map((e) => (
              <li key={e.id}>
                <Link href={`/app/events/${e.id}`} className="flex items-center gap-4 px-4 py-4 hover:bg-muted/40 sm:px-5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{e.name}</span>
                    <span className="block text-[13px] text-muted-foreground">{formatDate(e.startedAt)} · {formatDuration(e.startedAt, e.endsAt)}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-fill px-3 py-1 text-[13px] font-semibold">{people(e.contactCount)}</span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Events />
    </Suspense>
  );
}
