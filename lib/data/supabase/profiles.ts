import "server-only";
import type { Profile } from "@/lib/cards/types";
import { ForbiddenError } from "@/lib/data/errors";
import { maybe, must, supabaseAdmin } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/data/supabase/context";
import { deleteMediaFiles } from "@/lib/data/supabase/media";
import { toCard, toLead, toMedia, toMember, toProfile } from "@/lib/data/supabase/map";

const db = () => supabaseAdmin();

export async function getProfile(userId: string): Promise<Profile | null> {
  const row = maybe(await db().from("profiles").select("*").eq("id", userId).maybeSingle());
  return row ? toProfile(row) : null;
}

/** Normally created by the database trigger on sign-up; this is a fallback for older accounts. */
export async function ensureProfile(userId: string, email: string, displayName: string): Promise<Profile> {
  const existing = await getProfile(userId);
  if (existing) return existing;
  const row = must(await db().from("profiles").upsert({ id: userId, email, display_name: displayName }, { onConflict: "id" }).select("*").single());
  return toProfile(row);
}

export async function updateProfile(userId: string, patch: Partial<Pick<Profile, "displayName" | "avatarMediaId">>): Promise<Profile> {
  const row = must(
    await db()
      .from("profiles")
      .update({
        ...(patch.displayName !== undefined && { display_name: patch.displayName }),
        ...(patch.avatarMediaId !== undefined && { avatar_media_id: patch.avatarMediaId }),
      })
      .eq("id", userId)
      .select("*")
      .single(),
  );
  return toProfile(row);
}

/** Everything we hold about the person, for the "Download my data" button. */
export async function exportAccount(userId: string) {
  const profile = await getProfile(userId);
  const cards = must(await db().from("cards").select("*").eq("owner_user_id", userId)).map(toCard);
  const contacts = cards.length ? must(await db().from("leads").select("*").in("card_id", cards.map((c) => c.id))).map(toLead) : [];
  const memberships = must(await db().from("organization_members").select("*, organizations(name)").eq("user_id", userId)).map((r) => ({ ...toMember(r), organization: r.organizations?.name }));
  const media = must(await db().from("media").select("*").eq("owner_user_id", userId)).map(toMedia);
  return { exportedAt: new Date().toISOString(), profile, cards, contacts, memberships, media };
}

/**
 * Deletes the account. Owners must remove other members (or the team) first.
 * Deleting the auth user cascades to the profile and everything that references it.
 */
export async function deleteAccount(userId: string): Promise<void> {
  const owned = must(await db().from("organizations").select("id, name").eq("owner_id", userId));
  for (const org of owned) {
    const others = must(await db().from("organization_members").select("user_id").eq("organization_id", org.id).eq("status", "active").neq("user_id", userId));
    if (others.length) throw new ForbiddenError(`You own ${org.name}, which still has members. Remove them first.`);
  }
  const media = must(await db().from("media").select("id").eq("owner_user_id", userId)).map((m) => m.id as string);
  await deleteMediaFiles(media);
  if (owned.length) must(await db().from("organizations").delete().in("id", owned.map((o) => o.id)));
  await writeAudit({ actorId: userId, organizationId: null, entityType: "account", entityId: userId, action: "account.deleted", metadata: {} });
  const { error } = await db().auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
}
