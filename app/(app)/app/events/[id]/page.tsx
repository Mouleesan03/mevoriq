import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CalendarCheck, Check, Download, Inbox, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/site/avatar";
import { PageLoading } from "@/components/site/page-loading";
import { requireUser } from "@/lib/auth/session";
import { deleteEventAction, endEventAction, followUpAllAction } from "@/lib/actions/events";
import { getEventRecap } from "@/lib/data/events";
import { formatDuration } from "@/lib/events";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Event recap" };

const time = (iso: string) => new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
const weekday = (iso: string) => new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short" }).format(new Date(iso));

function Step({ n, done, title, text, children }: { n: number; done: boolean; title: string; text: string; children?: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold", done ? "bg-mint text-ink" : "bg-fill")} aria-hidden>
        {done ? <Check className="size-4" /> : n}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}{done && <span className="sr-only"> (done)</span>}</span>
        <span className="block text-[14px] text-muted-foreground">{text}</span>
      </span>
      {children && <span className="shrink-0">{children}</span>}
    </li>
  );
}

async function Recap({ params }: { params: PageProps<"/app/events/[id]">["params"] }) {
  const { id } = await params;
  const user = await requireUser();
  const recap = await getEventRecap(user.id, id);
  if (!recap) notFound();
  const { event, leads } = recap;
  const n = leads.length;
  const unscheduled = leads.filter((l) => l.status === "new" && !l.followUpAt).length;
  const handled = leads.filter((l) => l.status !== "new" || l.followUpAt).length;
  const stats = [
    { label: "Left you a note", value: leads.filter((l) => l.message).length },
    { label: "Open to updates", value: leads.filter((l) => l.marketingConsent).length },
    { label: "On your follow-up list", value: handled },
  ];

  return (
    <>
      <Link href="/app/events" className="text-[13px] text-muted-foreground hover:text-foreground">Events</Link>

      <section aria-label="Summary" className="mt-3 rounded-[16px] bg-ink p-6 text-white sm:rounded-[12px] sm:p-10">
        <p className="text-[13px] text-white/70">
          {event.live ? "Live now" : "Recap"} · {weekday(event.startedAt)} · {formatDuration(event.startedAt, event.live ? new Date().toISOString() : event.endsAt)}
        </p>
        <h1 className="mt-3 max-w-3xl text-[30px] leading-[1.08] font-extrabold tracking-[-0.03em] break-words sm:text-[44px] lg:text-[52px]">
          {n === 0 ? <>No one shared their details at {event.name} yet.</> : <>You met <span className="text-yellow">{n} {n === 1 ? "person" : "people"}</span> at {event.name}.</>}
        </h1>
        {n > 0 && (
          <dl className="mt-8 grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-[12px] bg-white/10 px-3 py-3 sm:px-4 sm:py-4">
                <dt className="text-[12px] leading-tight text-white/70 sm:text-[13px]">{s.label}</dt>
                <dd className="mt-1.5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {event.live && (
          <form action={endEventAction.bind(null, event.id)} className="mt-8">
            <Button type="submit" variant="mint"><Square /> End event</Button>
          </form>
        )}
      </section>

      {n > 0 && (
        <section aria-labelledby="next-heading" className="mt-12">
          <h2 id="next-heading" className="mb-4 text-lg font-bold">Next steps</h2>
          <ol className="divide-y overflow-hidden rounded-[14px] border bg-surface">
            <Step
              n={1}
              done={unscheduled === 0}
              title="Line up your follow-ups"
              text={unscheduled === 0 ? "Everyone from this event is on your follow-up list." : `${unscheduled} new ${unscheduled === 1 ? "contact has" : "contacts have"} no follow-up date yet.`}
            >
              {unscheduled > 0 && (
                <form action={followUpAllAction.bind(null, event.id)}>
                  <Button type="submit"><CalendarCheck /> Remind me tomorrow</Button>
                </form>
              )}
            </Step>
            <Step n={2} done={false} title="Send them to your CRM" text="A CSV with everyone from this event, ready for HubSpot, Salesforce or a spreadsheet.">
              <Button asChild variant="outline"><a href={`/api/v1/exports/leads?event=${event.id}`}><Download /> Export CSV</a></Button>
            </Step>
            <Step n={3} done={false} title="Add notes while you remember" text={`Every contact is tagged #${event.tag}, so you can find them later.`}>
              <Button asChild variant="outline"><Link href={`/app/connections?q=${encodeURIComponent(event.tag)}`}><Inbox /> Open in Contacts</Link></Button>
            </Step>
          </ol>
        </section>
      )}

      <section aria-labelledby="people-heading" className="mt-12">
        <h2 id="people-heading" className="mb-4 text-lg font-bold">Who you met</h2>
        {n === 0 ? (
          <p className="rounded-2xl border border-dashed px-5 py-8 text-sm text-muted-foreground">
            {event.live ? "Open Meeting Mode and let people scan your card. Anyone who shares their details back shows up here." : "Nobody shared their details while this event was running."}
          </p>
        ) : (
          <ul className="divide-y overflow-hidden rounded-[14px] border bg-surface">
            {leads.map((l) => (
              <li key={l.id}>
                <Link href={`/app/connections/${l.id}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 px-4 py-3.5 hover:bg-muted/40 sm:px-5">
                  <Avatar name={l.name} size={40} className="bg-muted text-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{l.name}</span>
                    <span className="block truncate text-[13px] text-muted-foreground">{l.message ? `“${l.message}”` : [l.company, l.email].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="text-right text-[12px] text-muted-foreground">
                    {time(l.createdAt)}
                    {l.followUpAt && <span className="mt-1 block rounded-full bg-fill px-2 py-0.5 text-[11px] text-body">Follow up {formatDate(l.followUpAt)}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!event.live && (
        <form action={deleteEventAction.bind(null, event.id)} className="mt-12 border-t pt-6">
          <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground"><Trash2 /> Delete this event</Button>
          <p className="mt-1 text-[13px] text-muted-foreground">Your contacts stay in Contacts with their #{event.tag} tag.</p>
        </form>
      )}
    </>
  );
}

export default function RecapPage({ params }: PageProps<"/app/events/[id]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Recap params={params} />
    </Suspense>
  );
}
