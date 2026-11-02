"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getFlag } from "@/lib/data/admin";
import { recordEvent } from "@/lib/data/analytics";
import { findPublishedBySlug } from "@/lib/data/cards";
import { createLead, deleteLead, updateLead } from "@/lib/data/leads";
import { LEAD_STATUSES } from "@/lib/data/models";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { fieldErrors, phoneSchema } from "@/lib/validation/card";
import { toFormState, type FormState } from "@/lib/actions/shared";

const exchangeSchema = z.object({
  slug: z.string().min(1).max(60),
  name: z.string().trim().min(1, "Enter your name.").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
  phone: phoneSchema.default(""),
  company: z.string().trim().max(100).default(""),
  message: z.string().trim().max(500).default(""),
  consent: z.literal("on", { message: "Tick the box to share your details." }),
  marketing: z.string().optional(),
  website: z.string().max(0).optional(), // honeypot: real people never fill this
});

/** Public, no login: a visitor shares their details back with the card owner (LEAD-01/02). */
export async function exchangeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await getFlag("contact_exchange"))) return { ok: false, message: "Sharing details is turned off right now." };
  const parsed = exchangeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { ok: true }; // silently drop bots
    return { ok: false, errors: fieldErrors(parsed.error), message: "Some fields need attention." };
  }
  const key = await clientKey();
  if (!(await rateLimit(`exchange:${key}:${parsed.data.slug}`, 3, 10 * 60_000)) || !(await rateLimit(`exchange:${key}`, 10, 60 * 60_000))) {
    return { ok: false, message: "Too many submissions from this device. Try again in a few minutes." };
  }
  const found = await findPublishedBySlug(parsed.data.slug);
  if (!found || !("card" in found)) return { ok: false, message: "This card is no longer available." };

  const { name, email, phone, company, message, marketing } = parsed.data;
  await createLead(found.card.id, { name, email, phone, company, message, marketingConsent: marketing === "on" });
  await recordEvent(found.card.id, "exchange");
  return { ok: true, message: `Sent. ${found.card.fullName.split(" ")[0]} now has your details.` };
}

const updateSchema = z.object({
  status: z.enum(LEAD_STATUSES as [string, ...string[]]),
  tags: z.string().max(300).transform((v) => [...new Set(v.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 10)),
  note: z.string().max(2000),
  followUpAt: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
});

export async function updateLeadAction(leadId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Some fields need attention." };
  try {
    await updateLead(user.id, leadId, {
      status: parsed.data.status as (typeof LEAD_STATUSES)[number],
      tags: parsed.data.tags,
      note: parsed.data.note,
      followUpAt: parsed.data.followUpAt || null,
    });
  } catch (err) {
    return toFormState(err);
  }
  revalidatePath("/app/connections", "layout");
  return { ok: true, message: "Changes saved", savedAt: new Date().toISOString() };
}

export async function deleteLeadAction(leadId: string): Promise<FormState> {
  const user = await requireUser();
  try {
    await deleteLead(user.id, leadId);
  } catch (err) {
    return toFormState(err);
  }
  revalidatePath("/app/connections", "layout");
  redirect("/app/connections");
}

/** One-tap "done" from a follow-up reminder. */
export async function completeFollowUpAction(leadId: string): Promise<void> {
  const user = await requireUser();
  await updateLead(user.id, leadId, { status: "done" });
  revalidatePath("/app", "layout");
}
