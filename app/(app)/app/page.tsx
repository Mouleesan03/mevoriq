import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, CalendarDays, Pencil, Plus, QrCode, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessCard } from "@/components/cards/business-card";
import { CopyButton, NativeShareButton } from "@/components/cards/card-actions";
import { MiniCard } from "@/components/cards/mini-card";
import { FollowUpList } from "@/components/contacts/follow-up-list";
import { ReplyBanner } from "@/components/reply/reply-banner";
import { InstallCard } from "@/components/pwa/install-card";
import { Avatar } from "@/components/site/avatar";
import { PageLoading } from "@/components/site/page-loading";
import { requireUser } from "@/lib/auth/session";
import { getInsights } from "@/lib/data/analytics";
import { listCards } from "@/lib/data/cards";
import { getLiveEvent } from "@/lib/data/events";
import { getTeam } from "@/lib/data/orgs";
import { getActiveTeam } from "@/lib/team";
import { listLeads } from "@/lib/data/leads";
import { mediaUrl } from "@/lib/cards/types";
import { displayCardUrl, publicCardUrl } from "@/lib/cards/urls";
import { qrSvg } from "@/lib/qr";
import { relativeTime } from "@/lib/format";
import { dueFollowUps, todayIso } from "@/lib/follow-ups";

export const metadata: Metadata = { title: "Home" };

async function Dashboard() {
  const user = await requireUser();
  const cards = await listCards(user.id);
  if (cards.length === 0) redirect("/onboarding");
  const [insights, leads, liveEvent, { active }] = await Promise.all([getInsights(user.id, 7), listLeads(user.id), getLiveEvent(user.id), getActiveTeam(user.id)]);
  const ownTeam = active && (active.role === "owner" || active.role === "admin") ? await getTeam(user.id, active.org.id) : null;
  const inviteNudge = ownTeam && ownTeam.members.filter((m) => m.status === "active").length <= 1 ? ownTeam.org : null;
  const primary = cards.find((c) => c.status === "published") ?? cards[0];
  const svg = primary.status === "published" ? await qrSvg(publicCardUrl(primary.slug)) : undefined;
  const firstName = user.displayName.split(" ")[0];
  const today = todayIso();
  const due = dueFollowUps(leads, today);
  const stats = [
    { label: "Views", value: insights.totals.view },
    { label: "Saved to contacts", value: insights.totals.save_contact },
    { label: "Shared back", value: insights.totals.exchange },
  ];

  return (
    <>
      <p className="text-[13px] text-muted-foreground">{new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</p>
      <h1 className="mt-1 text-[28px] leading-[1.1] tracking-[-0.03em] sm:text-[36px] lg:text-[42px]">Hi {firstName}.</h1>

      <ReplyBanner userId={user.id} />
      <InstallCard offlinePaths={cards.filter((c) => c.status === "published").flatMap((c) => [`/u/${c.slug}`, `/u/${c.slug}/meeting`])} />

      {inviteNudge && (
        <Link href="/app/team/members" className="mt-5 flex items-center gap-3 rounded-[14px] bg-cream px-4 py-3.5 hover:bg-yellow/40 sm:px-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-yellow"><UserPlus className="size-4" aria-hidden /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Invite your team to {inviteNudge.name}</span>
            <span className="block text-[13px] text-body">Each employee gets a company card with your brand.</span>
          </span>
          <ArrowRight className="size-4 shrink-0" aria-hidden />
        </Link>
      )}

      {liveEvent && (
        <Link href="/app/events" className="mt-5 flex items-center gap-3 rounded-[14px] bg-blue px-4 py-3.5 text-white hover:bg-blue-deep sm:px-5">
          <span className="relative flex size-2.5 shrink-0"><span className="absolute inset-0 rounded-full bg-mint motion-safe:animate-ping" /><span className="relative size-2.5 rounded-full bg-mint" /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">Live at {liveEvent.name}</span>
            <span className="block text-[13px] text-white/80">{liveEvent.contactCount} {liveEvent.contactCount === 1 ? "person" : "people"} so far</span>
          </span>
          <ArrowRight className="size-4 shrink-0" aria-hidden />
        </Link>
      )}

      <section className="mt-6 grid items-center gap-8 sm:mt-10 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-16" aria-label="Your main card">
        <div className="mx-auto w-full max-w-[440px] lg:mx-0">
          <BusinessCard
            card={{ fullName: primary.fullName, pronouns: primary.pronouns, headline: primary.headline, company: primary.company, theme: primary.theme, avatarUrl: mediaUrl(primary.avatarMediaId), logoUrl: null }}
            displayUrl={displayCardUrl(primary.slug)}
            qrSvg={svg}
            interactive={Boolean(svg)}
          />
        </div>
        <div>
          <p className="text-[13px] text-muted-foreground">{primary.label} · {primary.status === "published" ? "Live" : "Draft"}</p>
          <p className="mt-2 font-mono text-[15px] break-all">{displayCardUrl(primary.slug)}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {primary.status === "published" ? (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto"><Link href={`/u/${primary.slug}/meeting?from=app`}><QrCode /> Show my QR</Link></Button>
                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                  <NativeShareButton url={publicCardUrl(primary.slug)} title={primary.fullName} />
                  <CopyButton value={publicCardUrl(primary.slug)} />
                </div>
              </>
            ) : (
              <Button asChild><Link href={`/app/cards/${primary.id}/edit`}>Finish and publish</Link></Button>
            )}
            <Button asChild variant="ghost"><Link href={`/app/cards/${primary.id}/edit`}><Pencil /> Edit</Link></Button>
            {!liveEvent && primary.status === "published" && <Button asChild variant="ghost"><Link href="/app/events"><CalendarDays /> Start an event</Link></Button>}
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-[12px] bg-fill px-3 py-3 sm:px-4 sm:py-4">
                <dt className="text-[12px] leading-tight text-muted-foreground sm:text-[13px]">{s.label}</dt>
                <dd className="mt-1.5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-[12px] text-muted-foreground">Last 7 days, all cards.</p>
        </div>
      </section>

      {due.length > 0 && (
        <section aria-labelledby="due-heading" className="mt-12 sm:mt-16">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="due-heading" className="text-lg font-bold">Follow up today <span className="ml-1 rounded-full bg-yellow px-2 py-0.5 text-[13px]">{due.length}</span></h2>
            {due.length > 5 && <Link href="/app/connections?due=1" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">All {due.length} <ArrowRight className="size-3.5" /></Link>}
          </div>
          <FollowUpList leads={due.slice(0, 5)} today={today} />
        </section>
      )}

      <section className="mt-12 grid gap-10 sm:mt-16 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent contacts</h2>
            <Link href="/app/connections" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">All contacts <ArrowRight className="size-3.5" /></Link>
          </div>
          {leads.length === 0 ? (
            <p className="rounded-2xl border border-dashed px-5 py-8 text-sm text-muted-foreground">When someone shares their details from your card, they appear here.</p>
          ) : (
            <ul className="divide-y overflow-hidden rounded-[14px] border bg-surface">
              {leads.slice(0, 5).map((l) => (
                <li key={l.id}>
                  <Link href={`/app/connections/${l.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
                    <Avatar name={l.name} size={36} className="bg-muted text-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="truncate">{l.name}</span>
                        {l.status === "new" && <span className="size-1.5 shrink-0 rounded-full bg-mint" aria-label="New" />}
                      </span>
                      <span className="block truncate text-[13px] text-muted-foreground">{l.company || l.email}</span>
                    </span>
                    <span className="shrink-0 text-[12px] text-muted-foreground">{relativeTime(l.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Your cards</h2>
            <Button asChild variant="ghost" size="sm"><Link href="/app/cards/new"><Plus /> New card</Link></Button>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2">
            {cards.slice(0, 4).map((c) => (
              <li key={c.id}><MiniCard card={c} href={`/app/cards/${c.id}/edit`} organizationName={c.organizationName} /></li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Dashboard />
    </Suspense>
  );
}
