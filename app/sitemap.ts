import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/env";

/** Public marketing pages only; personal cards are never listed (they are noindex by default). */
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/features", "/templates", "/teams", "/pricing", "/about", "/contact", "/privacy", "/terms", "/cookies"].map((path) => ({
    url: `${appUrl()}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
