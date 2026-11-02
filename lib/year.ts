import { cacheLife } from "next/cache";

/** The current year for copyright lines, cached so static pages can prerender it. */
export async function currentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
