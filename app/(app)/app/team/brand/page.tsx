import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageLoading } from "@/components/site/page-loading";
import { TeamHeader } from "@/components/team/team-header";
import { BrandForm } from "@/components/team/team-forms";
import { requireUser } from "@/lib/auth/session";
import { getTeam } from "@/lib/data/orgs";
import { getActiveTeam } from "@/lib/team";
import { mediaUrl } from "@/lib/cards/types";

export const metadata: Metadata = { title: "Team brand" };

async function Brand() {
  const user = await requireUser();
  const { orgs, active } = await getActiveTeam(user.id);
  if (!active) redirect("/app/team");
  const team = (await getTeam(user.id, active.org.id))!;
  if (team.role !== "owner" && team.role !== "admin") redirect("/app/team");
  return (
    <>
      <TeamHeader org={team.org} role={team.role} orgs={orgs} current="brand" />
      <BrandForm org={team.org} logoUrl={mediaUrl(team.org.logoMediaId)} />
    </>
  );
}

export default function BrandPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Brand />
    </Suspense>
  );
}
