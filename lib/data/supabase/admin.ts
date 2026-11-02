import "server-only";
import type { Profile } from "@/lib/cards/types";
import { ForbiddenError, NotFoundError } from "@/lib/data/errors";
import type { AbuseReport, ContactMessage, ReportReason } from "@/lib/data/models";
import { isPlatformAdmin } from "@/lib/data/shared";
import { maybe, must, supabaseAdmin } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/data/supabase/context";
import { toAudit, toCard, toMessage, toReport } from "@/lib/data/supabase/map";

const db = () => supabaseAdmin();

function requireAdmin(user: Profile) {
  if (!isPlatformAdmin(user)) throw new ForbiddenError();
}

export async function getFlag(key: string): Promise<boolean> {
  const row = maybe(await db().from("feature_flags").select("enabled").eq("key", key).maybeSingle());
  return row?.enabled ?? false;
}

export async function createReport(cardId: string, slug: string, reason: ReportReason, details: string, reporterEmail: string): Promise<AbuseReport> {
  return toReport(must(await db().from("abuse_reports").insert({ card_id: cardId, slug, reason, details, reporter_email: reporterEmail }).select("*").single()));
}

export async function createMessage(input: Pick<ContactMessage, "name" | "email" | "topic" | "message">): Promise<ContactMessage> {
  return toMessage(must(await db().from("contact_messages").insert(input).select("*").single()));
}

export async function setMessageState(user: Profile, id: string, state: ContactMessage["state"]): Promise<void> {
  requireAdmin(user);
  must(await db().from("contact_messages").update({ state }).eq("id", id));
}

async function count(table: string) {
  const { count: n, error } = await db().from(table).select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return n ?? 0;
}

export async function getAdminOverview(user: Profile) {
  requireAdmin(user);
  const exact = { count: "exact" as const, head: true };
  const [people, cards, published, suspended, organizations, contacts, openReports, newMessages] = await Promise.all([
    count("profiles"),
    count("cards"),
    db().from("cards").select("*", exact).eq("status", "published").then((r) => r.count ?? 0),
    db().from("cards").select("*", exact).eq("status", "suspended").then((r) => r.count ?? 0),
    count("organizations"),
    count("leads"),
    db().from("abuse_reports").select("*", exact).eq("state", "open").then((r) => r.count ?? 0),
    db().from("contact_messages").select("*", exact).eq("state", "new").then((r) => r.count ?? 0),
  ]);
  const reportRows = must(await db().from("abuse_reports").select("*").order("created_at", { ascending: false }).limit(100)).map(toReport);
  const cardIds = [...new Set(reportRows.map((r) => r.cardId))];
  const reportCards = cardIds.length ? must(await db().from("cards").select("*").in("id", cardIds)).map(toCard) : [];
  const cardsById = new Map(reportCards.map((c) => [c.id, c]));
  const ownerIds = [...new Set(reportCards.map((c) => c.ownerUserId))];
  const owners = ownerIds.length ? must(await db().from("profiles").select("id, email").in("id", ownerIds)) : [];
  const ownerEmail = new Map(owners.map((o) => [o.id, o.email as string]));
  const reports = reportRows
    .sort((a, b) => (a.state === "open" ? 0 : 1) - (b.state === "open" ? 0 : 1) || b.createdAt.localeCompare(a.createdAt))
    .map((r) => {
      const card = cardsById.get(r.cardId) ?? null;
      return { ...r, card, ownerEmail: card ? (ownerEmail.get(card.ownerUserId) ?? "") : "" };
    });
  const flags = must(await db().from("feature_flags").select("*").order("key"));
  const messages = must(await db().from("contact_messages").select("*").order("created_at", { ascending: false }).limit(100))
    .map(toMessage)
    .sort((a, b) => (a.state === b.state ? b.createdAt.localeCompare(a.createdAt) : a.state === "new" ? -1 : 1));
  const auditRows = must(await db().from("audit_logs").select("*").order("created_at", { ascending: false }).limit(40)).map(toAudit);
  const actorIds = [...new Set(auditRows.map((a) => a.actorId))];
  const actors = actorIds.length ? must(await db().from("profiles").select("id, email").in("id", actorIds)) : [];
  const actorEmail = new Map(actors.map((a) => [a.id, a.email as string]));
  return {
    stats: { people, cards, published, suspended, organizations, contacts, openReports, newMessages },
    reports,
    flags: flags.map((f) => ({ key: f.key, description: f.description, enabled: f.enabled })),
    messages,
    audit: auditRows.map((a) => ({ ...a, actorEmail: actorEmail.get(a.actorId) ?? a.actorId.slice(0, 8) })),
  };
}

export async function resolveReport(user: Profile, reportId: string, action: "suspend" | "restore" | "dismiss"): Promise<void> {
  requireAdmin(user);
  const report = maybe(await db().from("abuse_reports").select("*").eq("id", reportId).maybeSingle());
  if (!report) throw new NotFoundError();
  const cardRow = maybe(await db().from("cards").select("*").eq("id", report.card_id).maybeSingle());
  const card = cardRow ? toCard(cardRow) : null;
  if (card && action === "suspend") must(await db().from("cards").update({ status: "suspended", version: card.version + 1 }).eq("id", card.id));
  if (card && action === "restore" && card.status === "suspended") must(await db().from("cards").update({ status: "draft", version: card.version + 1 }).eq("id", card.id));
  must(await db().from("abuse_reports").update({ state: action === "dismiss" ? "dismissed" : "actioned", resolved_at: new Date().toISOString(), resolved_by: user.id }).eq("id", reportId));
  await writeAudit({ actorId: user.id, organizationId: card?.organizationId ?? null, entityType: "report", entityId: reportId, action: `report.${action}`, metadata: { cardId: report.card_id } });
}

export async function setFlag(user: Profile, key: string, enabled: boolean): Promise<void> {
  requireAdmin(user);
  const rows = must(await db().from("feature_flags").update({ enabled }).eq("key", key).select("key"));
  if (!rows.length) throw new NotFoundError();
  await writeAudit({ actorId: user.id, organizationId: null, entityType: "flag", entityId: key, action: "flag.updated", metadata: { enabled } });
}
