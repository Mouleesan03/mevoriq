import { appUrl } from "@/lib/env";

export const publicCardPath = (slug: string) => `/u/${slug}`;
export const publicCardUrl = (slug: string) => `${appUrl()}${publicCardPath(slug)}`;
export const vcardPath = (slug: string) => `/api/v1/public/cards/${slug}/vcard`;
export const qrPath = (slug: string, format: "svg" | "png" = "svg", source?: string) => `/api/v1/public/cards/${slug}/qr?format=${format}${source ? `&s=${source}` : ""}`;
/** Human-readable card address for printing on the card face, e.g. "mevoriq.com/u/amara". */
export const displayCardUrl = (slug: string) => `${appUrl().replace(/^https?:\/\//, "")}${publicCardPath(slug)}`;
