import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Avatar } from "@/components/site/avatar";
import { PageLoading } from "@/components/site/page-loading";
import { ROLE, TeamHeader } from "@/components/team/team-header";
import { CompanyCardForm, InviteForm, MemberControls, RevokeInviteButton } from "@/components/team/team-forms";
import { requireUser } from "@/lib/auth/session";
import { getTeam } from "@/lib/data/orgs";
import { getActiveTeam } from "@/lib/team";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Team members" };

async function Members() {
  const user = await requireUser();
  const { orgs, active } = await getActiveTeam(user.id);
  if (!active) redirect("/app/team");
  const team = (await getTeam(user.id, active.org.id))!;
  const isAdmin = team.role === "owner" || team.role === "admin";
  const canCards = isAdmin || team.role === "manager";

  return (
    <>
      <TeamHeader org={team.org} role={team.role} orgs={orgs} current="members" />

      {isAdmin && (
        <section className="mb-12">
          <h2 className="mb-1 text-lg font-bold">Invite someone</h2>
          <p className="mb-4 text-sm text-muted-foreground">They join with the same email you invite. Admins manage people and brand; managers create company cards.</p>
          <InviteForm orgId={team.org.id} />
          {team.invitations.length > 0 && (
            <ul className="mt-6 divide-y overflow-hidden rounded-[14px] border bg-surface">
              {team.invitations.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-[14px]">
                  <span className="min-w-0 flex-1 truncate font-medium">{i.email}</span>
                  <span className="text-muted-foreground">{ROLE[i.role]} · expires {formatDate(i.expiresAt)}</span>
                  <RevokeInviteButton invitationId={i.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-bold">People</h2>
        <ul className="divide-y overflow-hidden rounded-[14px] border bg-surface">
          {team.members.map((m) => (
            <li key={m.userId} className={`grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-5 ${m.status === "deactivated" ? "opacity-60" : ""}`}>
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={m.displayName} size={40} />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    <span className="truncate">{m.displayName}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{ROLE[m.role]}</span>
                    {m.status === "deactivated" && <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-semibold text-danger">No access</span>}
                  </p>
                  <p className="truncate text-[13px] text-muted-foreground">{m.email} · {m.cardCount} company {m.cardCount === 1 ? "card" : "cards"}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {canCards && m.status === "active" && <CompanyCardForm orgId={team.org.id} memberId={m.userId} suggested={`${m.displayName}-${team.org.slug}`} />}
                <MemberControls orgId={team.org.id} memberId={m.userId} role={m.role} status={m.status} canAdmin={isAdmin} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Members />
    </Suspense>
  );
}
