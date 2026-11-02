import "server-only";
import { audit, ForbiddenError, mutate, newId, NotFoundError, now, read } from "@/lib/data/local/db";
import type { AbuseReport, ContactMessage, ReportReason } from "@/lib/data/models";
import type { Profile } from "@/lib/cards/types";
import { isPlatformAdmin } from "@/lib/data/shared";

function requireAdmin(user: Profile) {
  if (!isPlatformAdmin(user)) throw new ForbiddenError();
}

export async function getFlag(key: string): Promise<boolean> {
  return (await read()).flags[key]?.enabled ?? false;
}

export function createReport(cardId: string, slug: string, reason: ReportReason, details: string, reporterEmail: string): Promise<AbuseReport> {
  return mutate((db) => {
    if (!db.cards[cardId]) throw new NotFoundError("Card not found.");
    const report: AbuseReport = { id: newId(), cardId, slug, reason, details, reporterEmail, state: "open", createdAt: now(), resolvedAt: null, resolvedBy: null };
    db.reports[report.id] = report;
    return report;
  });
}

export function createMessage(input: Pick<ContactMessage, "name" | "email" | "topic" | "message">): Promise<ContactMessage> {
  return mutate((db) => {
    const msg: ContactMessage = { ...input, id: newId(), state: "new", createdAt: now() };
    db.messages[msg.id] = msg;
    return msg;
  });
}

export function setMessageState(user: Profile, id: string, state: ContactMessage["state"]): Promise<void> {
  requireAdmin(user);
  return mutate((db) => {
    if (db.messages[id]) db.messages[id].state = state;
  });
}

export async function getAdminOverview(user: Profile) {
  requireAdmin(user);
  const db = await read();
  const cards = Object.values(db.cards);
  const reports = Object.values(db.reports)
    .sort((a, b) => (a.state === "open" ? 0 : 1) - (b.state === "open" ? 0 : 1) || b.createdAt.localeCompare(a.createdAt))
    .map((r) => ({ ...r, card: db.cards[r.cardId] ?? null, ownerEmail: db.profiles[db.cards[r.cardId]?.ownerUserId ?? ""]?.email ?? "" }));
  return {
    stats: {
      people: Object.keys(db.profiles).length,
      cards: cards.length,
      published: cards.filter((c) => c.status === "published").length,
      suspended: cards.filter((c) => c.status === "suspended").length,
      organizations: Object.keys(db.organizations).length,
      contacts: Object.keys(db.leads).length,
      openReports: reports.filter((r) => r.state === "open").length,
      newMessages: Object.values(db.messages).filter((m) => m.state === "new").length,
    },
    reports,
    flags: Object.values(db.flags),
    messages: Object.values(db.messages).sort((a, b) => (a.state === b.state ? b.createdAt.localeCompare(a.createdAt) : a.state === "new" ? -1 : 1)),
    audit: [...db.audit].reverse().slice(0, 40).map((a) => ({ ...a, actorEmail: db.profiles[a.actorId]?.email ?? a.actorId.slice(0, 8) })),
  };
}

/** suspend = take the card offline; restore = back to draft for the owner; dismiss = no action. */
export function resolveReport(user: Profile, reportId: string, action: "suspend" | "restore" | "dismiss"): Promise<void> {
  requireAdmin(user);
  return mutate((db) => {
    const report = db.reports[reportId];
    if (!report) throw new NotFoundError();
    const card = db.cards[report.cardId];
    if (card && action === "suspend") db.cards[card.id] = { ...card, status: "suspended", version: card.version + 1, updatedAt: now() };
    if (card && action === "restore" && card.status === "suspended") db.cards[card.id] = { ...card, status: "draft", version: card.version + 1, updatedAt: now() };
    report.state = action === "dismiss" ? "dismissed" : "actioned";
    report.resolvedAt = now();
    report.resolvedBy = user.id;
    audit(db, { actorId: user.id, organizationId: card?.organizationId ?? null, entityType: "report", entityId: reportId, action: `report.${action}`, metadata: { cardId: report.cardId } });
  });
}

export function setFlag(user: Profile, key: string, enabled: boolean): Promise<void> {
  requireAdmin(user);
  return mutate((db) => {
    const flag = db.flags[key];
    if (!flag) throw new NotFoundError();
    flag.enabled = enabled;
    audit(db, { actorId: user.id, organizationId: null, entityType: "flag", entityId: key, action: "flag.updated", metadata: { enabled } });
  });
}
