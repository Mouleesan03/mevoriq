import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/site/app-shell";
import { Avatar } from "@/components/site/avatar";
import { PageLoading } from "@/components/site/page-loading";
import { requireUser } from "@/lib/auth/session";
import { listCards } from "@/lib/data/cards";
import { listLeads } from "@/lib/data/leads";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/data/models";
import { formatDate, relativeTime } from "@/lib/format";
import { dueFollowUps, todayIso } from "@/lib/follow-ups";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Contacts" };

const STATUS_LABEL: Record<LeadStatus, string> = { new: "New", following_up: "Following up", done: "Done", archived: "Archived" };

async function Connections({ searchParams }: { searchParams: PageProps<"/app/connections">["searchParams"] }) {
  const sp = await searchParams;
  const status = (LEAD_STATUSES as string[]).includes(String(sp.status)) ? (sp.status as LeadStatus) : "all";
  const cardId = typeof sp.card === "string" ? sp.card : undefined;
  const q = typeof sp.q === "string" ? sp.q : "";
  const dueOnly = sp.due === "1";
  const user = await requireUser();
  const [matching, cards, allActive] = await Promise.all([listLeads(user.id, { status, cardId, q }), listCards(user.id), listLeads(user.id)]);
  const today = todayIso();
  const dueCount = dueFollowUps(allActive, today).length;
  const leads = dueOnly ? dueFollowUps(matching, today) : matching;
  const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s, allActive.filter((l) => l.status === s).length]));
  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status: status === "all" ? undefined : status, card: cardId, q: q || undefined, due: dueOnly ? "1" : undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `/app/connections${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Contacts"
        description="People who shared their details from your cards. Only you can see them."
        actions={<Button asChild variant="outline"><a href="/api/v1/exports/leads"><Download /> Export CSV</a></Button>}
      />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <nav aria-label="Filter by status" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0"><div className="flex shrink-0 gap-1 rounded-full bg-muted p-1">
          {[["all", "All"], ...LEAD_STATUSES.filter((s) => s !== "archived").map((s) => [s, STATUS_LABEL[s]]), ["archived", "Archived"]].map(([value, label]) => (
            <Link
              key={value}
              href={href({ status: value === "all" ? undefined : value })}
              aria-current={status === value ? "page" : undefined}
              className={cn("rounded-full px-3.5 py-2 text-[13px] whitespace-nowrap", status === value ? "bg-surface font-medium shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              {label}
              {value !== "all" && value !== "archived" && counts[value] > 0 && <span className="ml-1.5 text-muted-foreground">{counts[value]}</span>}
            </Link>
          ))}
        </div></nav>
        {(dueCount > 0 || dueOnly) && (
          <Link
            href={href({ due: dueOnly ? undefined : "1" })}
            aria-pressed={dueOnly}
            className={cn("w-fit shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium whitespace-nowrap", dueOnly ? "bg-ink text-white" : "bg-yellow text-ink hover:bg-yellow/80")}
          >
            Follow up due · {dueCount}
          </Link>
        )}
        <form className="flex w-full gap-2 md:ml-auto md:w-auto" role="search">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          {dueOnly && <input type="hidden" name="due" value="1" />}
          {cards.length > 1 && (
            <select name="card" defaultValue={cardId ?? ""} aria-label="Card" className="h-10 rounded-full border bg-surface px-3 text-[13px]">
              <option value="">All cards</option>
              {cards.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          )}
          <label className="relative flex-1 sm:w-64">
            <span className="sr-only">Search contacts</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input name="q" defaultValue={q} placeholder="Search name, company, tag" className="h-10 w-full rounded-full border bg-surface pr-4 pl-10 text-[14px] outline-none focus-visible:border-indigo focus-visible:ring-[3px] focus-visible:ring-ring/25" />
          </label>
        </form>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          title={q || cardId || dueOnly || status !== "all" ? "No contacts match" : "No contacts yet"}
          text={q || cardId || dueOnly || status !== "all" ? "Try another filter or search." : "When someone taps “Share your details” on your card, they’ll appear here with where they found you."}
        />
      ) : (
        <ul className="divide-y overflow-hidden rounded-[14px] border bg-surface">
          {leads.map((l) => (
            <li key={l.id}>
              <Link href={`/app/connections/${l.id}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3.5 hover:bg-muted/40 sm:grid-cols-[auto_1.2fr_1fr_auto_auto] sm:px-5">
                <Avatar name={l.name} size={40} className="bg-muted text-foreground" />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-medium">
                    <span className="truncate">{l.name}</span>
                    {l.status === "new" && <span className="size-1.5 shrink-0 rounded-full bg-mint" aria-label="New" />}
                  </span>
                  <span className="block truncate text-[13px] text-muted-foreground">{[l.company, l.email].filter(Boolean).join(" · ")}</span>
                  {(l.tags.length > 0 || l.followUpAt) && (
                    <span className="mt-1.5 flex flex-wrap gap-1 sm:hidden">
                      {l.followUpAt && l.status !== "done" && (
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px]", l.followUpAt <= today ? "bg-yellow/50 text-ink" : "bg-muted text-muted-foreground")}>Follow up {formatDate(l.followUpAt)}</span>
                      )}
                      {l.tags.slice(0, 2).map((t) => <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">#{t}</span>)}
                    </span>
                  )}
                </span>
                <span className="hidden min-w-0 sm:block">
                  <span className="block truncate text-[13px] text-muted-foreground">via {l.cardLabel}</span>
                  {l.tags.length > 0 && (
                    <span className="mt-1 flex gap-1">
                      {l.tags.slice(0, 3).map((t) => <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{t}</span>)}
                    </span>
                  )}
                </span>
                <span className="hidden text-[13px] sm:block">
                  {l.followUpAt && (
                    <span className={cn("rounded-full px-2 py-0.5 text-[12px]", l.followUpAt <= today ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground")}>
                      Follow up {formatDate(l.followUpAt)}
                    </span>
                  )}
                </span>
                <span className="text-[12px] text-muted-foreground">{relativeTime(l.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function ConnectionsPage({ searchParams }: PageProps<"/app/connections">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Connections searchParams={searchParams} />
    </Suspense>
  );
}
