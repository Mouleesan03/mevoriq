import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AtSign, Building2, MessageSquareText, Phone } from "lucide-react";
import { Avatar } from "@/components/site/avatar";
import { PageLoading } from "@/components/site/page-loading";
import { requireUser } from "@/lib/auth/session";
import { getEvent } from "@/lib/data/events";
import { getLead } from "@/lib/data/leads";
import { formatDate, relativeTime } from "@/lib/format";
import { LeadForm } from "./lead-form";

export const metadata: Metadata = { title: "Contact" };

async function Lead({ params }: { params: PageProps<"/app/connections/[id]">["params"] }) {
  const { id } = await params;
  const user = await requireUser();
  const lead = await getLead(user.id, id);
  if (!lead) notFound();
  const event = lead.eventId ? await getEvent(user.id, lead.eventId) : null;
  return (
    <>
      <Link href="/app/connections" className="text-[13px] text-muted-foreground hover:text-foreground">Contacts</Link>
      <div className="mt-3 mb-10 flex flex-wrap items-center gap-5">
        <Avatar name={lead.name} size={64} />
        <div className="min-w-0">
          <h1 className="text-[clamp(28px,3.6vw,40px)] leading-[1.05] font-extrabold tracking-[-0.03em]">{lead.name}</h1>
          <p className="mt-1 text-muted-foreground">
            Shared from <span className="text-foreground">{lead.cardLabel}</span>
            {event && <> at <Link href={`/app/events/${event.id}`} className="text-foreground underline-offset-4 hover:underline">{event.name}</Link></>} · {relativeTime(lead.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <section aria-label="Details" className="space-y-6">
          <ul className="divide-y overflow-hidden rounded-[14px] border bg-surface">
            <li className="flex items-center gap-3.5 px-4 py-3.5">
              <AtSign className="size-[18px] text-indigo" aria-hidden />
              <a href={`mailto:${lead.email}`} className="min-w-0 flex-1 truncate font-medium hover:underline">{lead.email}</a>
            </li>
            {lead.phone && (
              <li className="flex items-center gap-3.5 px-4 py-3.5">
                <Phone className="size-[18px] text-indigo" aria-hidden />
                <a href={`tel:${lead.phone}`} className="font-medium hover:underline">{lead.phone}</a>
              </li>
            )}
            {lead.company && (
              <li className="flex items-center gap-3.5 px-4 py-3.5">
                <Building2 className="size-[18px] text-indigo" aria-hidden />
                <span className="font-medium">{lead.company}</span>
              </li>
            )}
          </ul>
          {lead.message && (
            <figure className="rounded-[14px] border bg-surface px-5 py-4">
              <figcaption className="mb-2 flex items-center gap-2 text-[13px] text-muted-foreground"><MessageSquareText className="size-4" /> Their note</figcaption>
              <blockquote className="text-[15px] leading-relaxed whitespace-pre-line">{lead.message}</blockquote>
            </figure>
          )}
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Agreed to share these details on {formatDate(lead.consentAt)} (consent text {lead.consentVersion}).{" "}
            {lead.marketingConsent ? "Also agreed to receive updates." : "Did not opt in to updates — contact them only to follow up."}
          </p>
        </section>

        <LeadForm lead={{ id: lead.id, status: lead.status, tags: lead.tags, note: lead.note, followUpAt: lead.followUpAt }} />
      </div>
    </>
  );
}

export default function LeadPage({ params }: PageProps<"/app/connections/[id]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Lead params={params} />
    </Suspense>
  );
}
