import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, EmptyState } from "@/components/site/app-shell";
import { PageLoading } from "@/components/site/page-loading";
import { MiniCard } from "@/components/cards/mini-card";
import { TeamHeader } from "@/components/team/team-header";
import { CreateOrgForm } from "@/components/team/team-forms";
import { requireUser } from "@/lib/auth/session";
import { getTeam, getTeamActivity } from "@/lib/data/orgs";
import { getFlag } from "@/lib/data/admin";
import { getActiveTeam } from "@/lib/team";
import { relativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Team" };

async function Team() {
  const user = await requireUser();
  const { orgs, active } = await getActiveTeam(user.id);

  if (!active) {
    const enabled = await getFlag("teams");
    return (
      <>
        <PageHeader title="Team" description="Give everyone at your company a consistent, up-to-date card. Free during early access." />
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-bold">Create a team</h2>
            <p className="mt-1 mb-5 text-sm text-muted-foreground">You’ll be the owner. Invite people next, then set your brand.</p>
            {enabled ? <CreateOrgForm /> : <p className="text-sm text-muted-foreground">Teams are paused right now.</p>}
          </div>
          <dl className="divide-y border-y text-[15px]">
            {[
              ["Brand presets", "Template, accent, company name and logo, set once."],
              ["Locked fields", "Keep design and company details consistent on every card."],
              ["Safe offboarding", "Removing someone unpublishes their company card. Personal cards stay theirs."],
            ].map(([t, d]) => (
              <div key={t} className="py-4"><dt className="font-semibold">{t}</dt><dd className="text-muted-foreground">{d}</dd></div>
            ))}
          </dl>
        </div>
      </>
    );
  }

  const team = (await getTeam(user.id, active.org.id))!;
  const activity = await getTeamActivity(user.id, team.org.id);
  const live = team.cards.filter((c) => c.status === "published").length;

  return (
    <>
      <TeamHeader org={team.org} role={team.role} orgs={orgs} current="overview" />
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-[14px] border bg-border">
        {[
          ["Members", team.members.filter((m) => m.status === "active").length],
          ["Company cards", team.cards.length],
          ["Live", live],
        ].map(([l, v]) => (
          <div key={l} className="bg-surface px-5 py-4">
            <dt className="text-[13px] text-muted-foreground">{l}</dt>
            <dd className="mt-1 font-display text-3xl font-extrabold tracking-tight">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="mb-4 text-lg font-bold">Company cards</h2>
          {team.cards.length === 0 ? (
            <EmptyState title="No company cards yet" text="Create one for each member from the Members tab. They’ll finish and publish it themselves." />
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2">
              {team.cards.map((c) => (
                <li key={c.id}>
                  <MiniCard card={c} href={team.role === "owner" || team.role === "admin" || c.ownerUserId === user.id ? `/app/cards/${c.id}/edit` : "/app/team/members"} />
                </li>
              ))}
            </ul>
          )}
        </section>
        {(team.role === "owner" || team.role === "admin") && (
          <section>
            <h2 className="mb-4 text-lg font-bold">Recent activity</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing yet.</p>
            ) : (
              <ul className="space-y-3 text-[14px]">
                {activity.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-border" />
                    <span className="min-w-0 flex-1">
                      <span className="font-medium">{a.actorName}</span>{" "}
                      <span className="text-muted-foreground">{a.action.replace(/^[a-z]+\./, "").replace(/_/g, " ")}</span>
                      <span className="block text-[12px] text-muted-foreground">{relativeTime(a.createdAt)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}

export default function TeamPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Team />
    </Suspense>
  );
}
