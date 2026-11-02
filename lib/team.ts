import "server-only";
import { getActiveOrgId } from "@/lib/auth/session";
import { listMyOrganizations } from "@/lib/data/orgs";

/** The organization shown on team pages: the one chosen in the switcher, else the first. */
export async function getActiveTeam(userId: string) {
  const orgs = await listMyOrganizations(userId);
  const chosen = await getActiveOrgId();
  const active = orgs.find((o) => o.org.id === chosen) ?? orgs[0] ?? null;
  return { orgs, active };
}
