import { z } from "zod";
import { CARD_CONTEXTS, LINK_KINDS } from "@/lib/cards/types";
import { TEMPLATE_KEYS } from "@/lib/cards/themes";

/** Slugs that would collide with app routes or invite impersonation (docs/product-plan.md §8). */
export const RESERVED_SLUGS = new Set([
  "admin", "app", "api", "u", "login", "logout", "signup", "register", "pricing", "features", "templates",
  "onboarding", "settings", "help", "support", "about", "contact", "privacy", "terms", "cookies", "blog",
  "mevoriq", "official", "team", "teams", "meet", "root", "system", "null", "undefined", "www",
]);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use at least 3 characters.")
  .max(40, "Use at most 40 characters.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens.")
  .refine((s) => !RESERVED_SLUGS.has(s), "This address is reserved.");

const optionalText = (max: number) => z.string().trim().max(max).default("");

/** Only http(s) URLs; blocks javascript:, data: and other unsafe schemes. Adds https:// when missing. */
export const safeUrl = z
  .string()
  .trim()
  .max(500)
  .transform((v) => (v && !/^[a-z][a-z0-9+.-]*:/i.test(v) ? `https://${v}` : v))
  .refine((v) => {
    if (!v) return true;
    try {
      const u = new URL(v);
      return (u.protocol === "https:" || u.protocol === "http:") && u.hostname.includes(".");
    } catch {
      return false;
    }
  }, "Enter a valid web address.");

/** International phone in E.164: "+" then 8–15 digits. Spaces, dashes and brackets are stripped. */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-().]/g, ""))
  .refine((v) => v === "" || /^\+[1-9]\d{7,14}$/.test(v), "Use international format, e.g. +44 7700 900123.");

export const cardContentSchema = z.object({
  label: z.string().trim().min(1, "Give this card a name.").max(60),
  context: z.enum(CARD_CONTEXTS),
  fullName: z.string().trim().min(1, "Your name is required.").max(100),
  pronouns: optionalText(30),
  headline: optionalText(100),
  company: optionalText(100),
  bio: optionalText(280),
  contacts: z.object({
    email: z.union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid email.").max(254)]).default(""),
    phone: phoneSchema.default(""),
    whatsapp: phoneSchema.default(""),
    website: safeUrl.default(""),
    location: optionalText(100),
  }),
  links: z
    .array(
      z.object({
        id: z.string().min(1).max(40),
        kind: z.enum(LINK_KINDS),
        label: z.string().trim().min(1, "Add a label.").max(40),
        url: safeUrl.refine((v) => v !== "", "Add a link."),
      }),
    )
    .max(12, "Up to 12 links."),
  theme: z.object({
    template: z.enum(TEMPLATE_KEYS),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  }),
});

export type CardContentInput = z.input<typeof cardContentSchema>;

/** Flattens zod issues into { "contacts.email": "message" } for form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}
