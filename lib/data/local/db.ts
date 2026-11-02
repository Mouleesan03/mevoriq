import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { isSupabaseConfigured } from "@/lib/env";
import type { Card, Profile } from "@/lib/cards/types";
import type { AbuseReport, AuditLog, ContactMessage, FeatureFlag, Invitation, Lead, Media, Membership, NetworkEvent, Organization } from "@/lib/data/models";
import { DEFAULT_FLAGS } from "@/lib/data/models";

/**
 * Development store: one JSON file (`.data/dev-db.json`) plus media files in `.data/media/`.
 * Stands in for Supabase until a project is connected. Every domain module in lib/data
 * goes through `read()` / `mutate()`, so swapping to Supabase replaces those modules' queries
 * without touching pages. Single process only; refuses to run in production.
 */
export interface DB {
  profiles: Record<string, Profile>;
  cards: Record<string, Card>;
  slugHistory: Record<string, string>; // old slug -> card id
  leads: Record<string, Lead>;
  networkEvents: Record<string, NetworkEvent>;
  media: Record<string, Media>;
  events: Record<string, number>; // `${cardId}|${YYYY-MM-DD}|${type}` -> count
  sourceViews: Record<string, number>; // `${cardId}|${YYYY-MM-DD}|${source}` -> count
  organizations: Record<string, Organization>;
  memberships: Membership[];
  invitations: Record<string, Invitation>;
  reports: Record<string, AbuseReport>;
  messages: Record<string, ContactMessage>;
  audit: AuditLog[];
  flags: Record<string, FeatureFlag>;
}

export const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "dev-db.json");
let queue: Promise<unknown> = Promise.resolve();

function guard() {
  if (isSupabaseConfigured()) {
    throw new Error("Supabase is configured but the Supabase data layer is not implemented yet. Unset the Supabase env vars to use the local store.");
  }
  if (process.env.NODE_ENV === "production" && process.env.MEVORIQ_ALLOW_LOCAL_STORE !== "1") {
    throw new Error("The local development store is disabled in production. Connect Supabase, or set MEVORIQ_ALLOW_LOCAL_STORE=1 for a local production test.");
  }
}

function withDefaults(raw: Partial<DB>): DB {
  const flags = { ...Object.fromEntries(DEFAULT_FLAGS.map((f) => [f.key, f])), ...(raw.flags ?? {}) };
  return {
    profiles: raw.profiles ?? {},
    cards: raw.cards ?? {},
    slugHistory: raw.slugHistory ?? {},
    leads: raw.leads ?? {},
    networkEvents: raw.networkEvents ?? {},
    media: raw.media ?? {},
    events: raw.events ?? {},
    sourceViews: raw.sourceViews ?? {},
    organizations: raw.organizations ?? {},
    memberships: raw.memberships ?? [],
    invitations: raw.invitations ?? {},
    reports: raw.reports ?? {},
    messages: raw.messages ?? {},
    audit: raw.audit ?? [],
    flags,
  };
}

export async function read(): Promise<DB> {
  guard();
  try {
    return withDefaults(JSON.parse(await fs.readFile(FILE, "utf8")));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return withDefaults({});
    throw err;
  }
}

async function save(db: DB) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, FILE);
}

/** Runs read-modify-write operations one at a time; the change is saved only if `fn` succeeds. */
export function mutate<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await read();
    const result = await fn(db);
    await save(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const now = () => new Date().toISOString();
export const newId = () => randomUUID();

export function audit(db: DB, entry: Omit<AuditLog, "id" | "createdAt">) {
  db.audit.push({ ...entry, id: newId(), createdAt: now() });
  if (db.audit.length > 2000) db.audit.splice(0, db.audit.length - 2000);
}

export { ForbiddenError, NotFoundError } from "@/lib/data/errors";
