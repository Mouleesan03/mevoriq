import "server-only";
import { randomUUID } from "node:crypto";
import type { Media } from "@/lib/data/models";
import { processImage } from "@/lib/data/shared";
import { MEDIA_BUCKET, maybe, must, supabaseAdmin } from "@/lib/supabase/server";
import { toMedia } from "@/lib/data/supabase/map";

/** Validates and re-encodes the image, stores it in the public bucket, then records it. */
export async function saveImage(userId: string, kind: Media["kind"], file: File): Promise<Media> {
  const { data, info } = await processImage(file, kind);
  const id = randomUUID();
  const path = `${userId}/${id}.webp`;
  must(await supabaseAdmin().storage.from(MEDIA_BUCKET).upload(path, data, { contentType: "image/webp", cacheControl: "31536000", upsert: false }));
  const row = must(
    await supabaseAdmin()
      .from("media")
      .insert({ id, owner_user_id: userId, kind, mime: "image/webp", width: info.width, height: info.height, bytes: data.length, storage_path: path })
      .select("*")
      .single(),
  );
  return toMedia(row);
}

/** Supabase serves files from its CDN; the media route redirects there. */
export async function readMedia(id: string): Promise<{ media: Media; url: string } | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const row = maybe(await supabaseAdmin().from("media").select("*").eq("id", id).maybeSingle());
  if (!row) return null;
  const { data } = supabaseAdmin().storage.from(MEDIA_BUCKET).getPublicUrl(row.storage_path);
  return { media: toMedia(row), url: data.publicUrl };
}

export async function deleteMediaFiles(ids: string[]) {
  if (!ids.length) return;
  const rows = must(await supabaseAdmin().from("media").select("storage_path").in("id", ids));
  if (rows.length) must(await supabaseAdmin().storage.from(MEDIA_BUCKET).remove(rows.map((r) => r.storage_path)));
}
