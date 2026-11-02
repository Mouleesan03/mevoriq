import "server-only";
import { pick } from "@/lib/data/backend";
import { isSupabaseConfigured } from "@/lib/env";
import type { Media } from "@/lib/data/models";
import * as local from "@/lib/data/local/media";
import * as remote from "@/lib/data/supabase/media";

/** Media data access: Supabase in production, the local store in development (see lib/data/backend.ts). */
export const saveImage = ((...args: Parameters<typeof local.saveImage>) => (pick(local, remote).saveImage as typeof local.saveImage)(...args)) as typeof local.saveImage;
export const deleteMediaFiles = ((...args: Parameters<typeof local.deleteMediaFiles>) => (pick(local, remote).deleteMediaFiles as typeof local.deleteMediaFiles)(...args)) as typeof local.deleteMediaFiles;

export { UploadError } from "@/lib/data/errors";
export { MAX_UPLOAD_BYTES, sniffImage } from "@/lib/data/shared";

/** Local store returns the file bytes; Supabase returns its public CDN URL. */
export async function readMedia(id: string): Promise<{ media: Media; data: Buffer } | { media: Media; url: string } | null> {
  return isSupabaseConfigured() ? remote.readMedia(id) : local.readMedia(id);
}
