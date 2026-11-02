import "server-only";
import type { AccessCtx } from "@/lib/data/access";
import type { AuditLog } from "@/lib/data/models";
import { must, supabaseAdmin } from "@/lib/supabase/server";
import { toMember, toOrg } from "@/lib/data/supabase/map";

/** The signed-in user's active memberships and their organizations, for lib/data/access.ts. */
export async function accessCtx(userId: string): Promise<AccessCtx> {
  const db = supabaseAdmin();
  const memberships = must(await db.from("organization_members").select("*").eq("user_id", userId).eq("status", "active")).map(toMember);
  const ids = memberships.map((m) => m.organizationId);
  const orgs = ids.length ? must(await db.from("organizations").select("*").in("id", ids)).map(toOrg) : [];
  return { memberships, organizations: Object.fromEntries(orgs.map((o) => [o.id, o])) };
}

export async function writeAudit(entry: Omit<AuditLog, "id" | "createdAt">) {
  must(
    await supabaseAdmin().from("audit_logs").insert({
      actor_id: entry.actorId,
      organization_id: entry.organizationId,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      action: entry.action,
      metadata: entry.metadata,
    }),
  );
}

/** Postgres unique-violation code. */
export const isUniqueViolation = (err: unknown) => (err as { code?: string })?.code === "23505";
