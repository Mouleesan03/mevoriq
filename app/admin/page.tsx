import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { PageLoading } from "@/components/site/page-loading";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminOverview } from "@/lib/data/admin";
import { REPORT_REASONS } from "@/lib/data/models";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FlagToggle, MessageToggle, ReportActions } from "./admin-controls";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const reasonLabel = Object.fromEntries(REPORT_REASONS.map((r) => [r.value, r.label]));

async function Admin() {
  const user = await requireAdmin();
  const { stats, reports, flags, audit, messages } = await getAdminOverview(user);
  return (
    <>
      <h1 className="text-[clamp(28px,3.6vw,40px)] leading-[1.05] font-extrabold tracking-[-0.03em]">Platform</h1>
      <p className="mt-2 text-muted-foreground">Signed in as {user.email}. Every action here is recorded in the audit log.</p>

      <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border bg-border sm:grid-cols-4 lg:grid-cols-8">
        {[
          ["People", stats.people],
          ["Cards", stats.cards],
          ["Live", stats.published],
          ["Suspended", stats.suspended],
          ["Teams", stats.organizations],
          ["Contacts", stats.contacts],
          ["Open reports", stats.openReports],
          ["New messages", stats.newMessages],
        ].map(([l, v]) => (
          <div key={l} className="bg-surface px-4 py-4">
            <dt className="text-[12px] text-muted-foreground">{l}</dt>
            <dd className="mt-1 font-display text-2xl font-extrabold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-14">
        <h2 className="mb-4 text-lg font-bold">Reports</h2>
        {reports.length === 0 ? (
          <p className="rounded-2xl border border-dashed px-5 py-8 text-sm text-muted-foreground">No reports. When someone reports a card, it shows up here.</p>
        ) : (
          <ul className="divide-y overflow-hidden rounded-[14px] border bg-surface">
            {reports.map((r) => (
              <li key={r.id} className={cn("grid gap-3 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center", r.state !== "open" && "opacity-60")}>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{reasonLabel[r.reason]}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", r.state === "open" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground")}>{r.state}</span>
                    <span className="text-[12px] text-muted-foreground">{relativeTime(r.createdAt)}</span>
                  </p>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    <Link href={`/u/${r.card?.slug ?? r.slug}`} className="font-mono hover:underline" target="_blank">/u/{r.card?.slug ?? r.slug}</Link>
                    {" · "}{r.card ? `${r.card.fullName} · ${r.card.status}` : "card deleted"}
                    {r.ownerEmail && ` · owner ${r.ownerEmail}`}
                  </p>
                  {r.details && <p className="mt-2 text-[14px]">{r.details}</p>}
                  {r.reporterEmail && <p className="mt-1 text-[12px] text-muted-foreground">Reporter: {r.reporterEmail}</p>}
                </div>
                {r.card && <ReportActions reportId={r.id} open={r.state === "open"} suspended={r.card.status === "suspended"} />}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-14">
        <h2 className="mb-4 text-lg font-bold">Messages</h2>
        {messages.length === 0 ? (
          <p className="rounded-[14px] bg-fill px-5 py-8 text-sm text-muted-foreground">No messages yet. Contact form submissions appear here.</p>
        ) : (
          <ul className="divide-y overflow-hidden rounded-[14px] border bg-surface">
            {messages.map((m) => (
              <li key={m.id} className={cn("grid gap-3 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-start", m.state === "done" && "opacity-60")}>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{m.name}</span>
                    <a href={`mailto:${m.email}`} className="text-[13px] text-blue hover:underline">{m.email}</a>
                    <span className="rounded-full bg-fill px-2 py-0.5 text-[11px] font-semibold">{m.topic}</span>
                    <span className="text-[12px] text-muted-foreground">{relativeTime(m.createdAt)}</span>
                  </p>
                  <p className="mt-2 text-[14px] whitespace-pre-line">{m.message}</p>
                </div>
                <MessageToggle id={m.id} done={m.state === "done"} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-bold">Feature flags</h2>
          <ul className="divide-y overflow-hidden rounded-[14px] border bg-surface">
            {flags.map((f) => (
              <li key={f.key} className="flex items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[13px] font-medium">{f.key}</p>
                  <p className="text-[13px] text-muted-foreground">{f.description}</p>
                </div>
                <FlagToggle flagKey={f.key} enabled={f.enabled} />
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="mb-4 text-lg font-bold">Audit log</h2>
          <ul className="max-h-[420px] divide-y overflow-auto rounded-[14px] border bg-surface text-[13px]">
            {audit.length === 0 && <li className="px-5 py-4 text-muted-foreground">No entries yet.</li>}
            {audit.map((a) => (
              <li key={a.id} className="flex gap-3 px-5 py-3">
                <span className="w-20 shrink-0 text-muted-foreground">{relativeTime(a.createdAt)}</span>
                <span className="min-w-0 flex-1 truncate"><span className="font-mono">{a.action}</span> <span className="text-muted-foreground">by {a.actorEmail}</span></span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

export default function AdminPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
          <Link href="/app" aria-label="Back to app"><Logo height={24} tone="light" /></Link>
          <span className="rounded-full bg-navy px-2.5 py-0.5 text-[11px] font-semibold text-white">Admin</span>
          <Link href="/app" className="ml-auto text-sm text-muted-foreground hover:text-foreground">Back to app</Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <Suspense fallback={<PageLoading />}>
          <Admin />
        </Suspense>
      </main>
    </div>
  );
}
