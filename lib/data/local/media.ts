import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { DATA_DIR, mutate, newId, now, read } from "@/lib/data/local/db";
import type { Media } from "@/lib/data/models";
import { processImage } from "@/lib/data/shared";

const MEDIA_DIR = path.join(DATA_DIR, "media");
/** Validates, strips metadata, and stores a square WebP (avatars 512px, logos fit in 512px). */
export async function saveImage(userId: string, kind: Media["kind"], file: File): Promise<Media> {
  const { data: output, info } = await processImage(file, kind);
  const media: Media = { id: newId(), ownerUserId: userId, kind, mime: "image/webp", width: info.width, height: info.height, bytes: output.length, createdAt: now() };
  await fs.mkdir(MEDIA_DIR, { recursive: true });
  await fs.writeFile(path.join(MEDIA_DIR, `${media.id}.webp`), output);
  await mutate((db) => {
    db.media[media.id] = media;
  });
  return media;
}

export async function readMedia(id: string): Promise<{ media: Media; data: Buffer } | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const media = (await read()).media[id];
  if (!media) return null;
  try {
    return { media, data: await fs.readFile(path.join(MEDIA_DIR, `${id}.webp`)) };
  } catch {
    return null;
  }
}

export async function deleteMediaFiles(ids: string[]) {
  await Promise.all(ids.map((id) => fs.rm(path.join(MEDIA_DIR, `${id}.webp`), { force: true })));
}
