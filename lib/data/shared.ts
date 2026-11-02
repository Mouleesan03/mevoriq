import "server-only";
import sharp, { type OutputInfo } from "sharp";
import type { Profile } from "@/lib/cards/types";
import type { LeadStatus } from "@/lib/data/models";
import { UploadError } from "@/lib/data/errors";

/** Pure helpers and types used by both data backends. */

export const CONSENT_VERSION = "2026-11-01";
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const INVITE_DAYS = 7;

export interface LeadInput {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  marketingConsent: boolean;
}

export interface LeadFilters {
  status?: LeadStatus | "all";
  cardId?: string;
  q?: string;
}

/** Platform admins are listed in MEVORIQ_ADMIN_EMAILS (comma-separated). */
export function isPlatformAdmin(user: Pick<Profile, "email"> | null): boolean {
  if (!user) return false;
  const list = (process.env.MEVORIQ_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return list.includes(user.email.toLowerCase());
}

/** Checks the file signature, not the extension (docs/product-plan.md §7). */
export function sniffImage(buf: Buffer): "jpeg" | "png" | "webp" | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

/** Validates an upload and re-encodes it as WebP without metadata (avatars 512px square, logos fit in 512px). */
export async function processImage(file: File, kind: "avatar" | "logo"): Promise<{ data: Buffer; info: OutputInfo }> {
  if (file.size === 0) throw new UploadError("Choose an image to upload.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("Images must be 5 MB or smaller.");
  const input = Buffer.from(await file.arrayBuffer());
  if (!sniffImage(input)) throw new UploadError("Use a JPG, PNG or WebP image.");
  try {
    const pipeline = sharp(input, { limitInputPixels: 40_000_000 }).rotate();
    const resized = kind === "avatar" ? pipeline.resize(512, 512, { fit: "cover", position: "attention" }) : pipeline.resize(512, 512, { fit: "inside", withoutEnlargement: true });
    return await resized.webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  } catch {
    throw new UploadError("That image could not be read. Try another file.");
  }
}

export interface LeadCsvRow {
  name: string; email: string; phone: string; company: string; message: string; cardLabel: string; status: string; tags: string[]; followUpAt: string | null; marketingConsent: boolean; createdAt: string;
}

/** RFC 4180 CSV; neutralizes spreadsheet formula injection. */
export function leadsToCsv(rows: LeadCsvRow[]): string {
  const cell = (v: string) => {
    const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const header = ["Name", "Email", "Phone", "Company", "Message", "Card", "Status", "Tags", "Follow up", "Marketing consent", "Received"];
  const lines = rows.map((r) =>
    [r.name, r.email, r.phone, r.company, r.message, r.cardLabel, r.status, r.tags.join("; "), r.followUpAt ?? "", r.marketingConsent ? "yes" : "no", r.createdAt].map(cell).join(","),
  );
  return [header.join(","), ...lines].join("\r\n") + "\r\n";
}
