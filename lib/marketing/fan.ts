import { THEMES, resolveAccent, type TemplateKey } from "@/lib/cards/themes";

/** Example people shown on marketing pages (fictional). */
export const FAN_PEOPLE: Record<TemplateKey, { name: string; slug: string; role: string; accent: string }> = {
  "minimal-white": { name: "James Walker", slug: "james-walker", role: "Architect, Walker & Lane", accent: "#12131A" },
  "midnight-executive": { name: "Olivia Hayes", slug: "olivia-hayes", role: "Managing Partner, Hayes Capital", accent: "#2FD08A" },
  "aurora-gradient": { name: "Emma Carter", slug: "emma-carter", role: "Product Designer, Northstar Studio", accent: "#FFD54A" },
  "editorial-studio": { name: "Sophie Bennett", slug: "sophie-bennett", role: "Writer and Editor, Margins", accent: "#8C3A1F" },
  "modern-corporate": { name: "Daniel Brooks", slug: "daniel-brooks", role: "Sales Director, Helix Systems", accent: "#12131A" },
};

export const FRONT_PERSON = FAN_PEOPLE["aurora-gradient"];

/** Avatar colors for the sample cards (dark faces use a bright accent with ink text). */
export function avatarFor(key: TemplateKey) {
  const p = FAN_PEOPLE[key];
  return key === "aurora-gradient" || key === "midnight-executive" ? { value: p.accent, onAccent: "#12131A" } : resolveAccent(THEMES[key], p.accent);
}
