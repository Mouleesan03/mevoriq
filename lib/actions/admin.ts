"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createMessage, createReport, resolveReport, setFlag, setMessageState } from "@/lib/data/admin";
import { findPublishedBySlug } from "@/lib/data/cards";
import { REPORT_REASONS, type ReportReason } from "@/lib/data/models";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { fieldErrors } from "@/lib/validation/card";
import { toFormState, type FormState } from "@/lib/actions/shared";

const reportSchema = z.object({
  slug: z.string().min(1).max(60),
  reason: z.enum(REPORT_REASONS.map((r) => r.value) as [ReportReason, ...ReportReason[]], { message: "Choose a reason." }),
  details: z.string().trim().max(1000).default(""),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid email address.")]).default(""),
});

/** Public: anyone can report a card for impersonation, spam or abuse (ADMIN-02). */
export async function reportCardAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  if (!(await rateLimit(`report:${await clientKey()}`, 5, 60 * 60_000))) return { ok: false, message: "Too many reports from this device. Try again later." };
  const found = await findPublishedBySlug(parsed.data.slug);
  if (!found || !("card" in found)) return { ok: false, message: "This card is no longer available." };
  await createReport(found.card.id, found.card.slug, parsed.data.reason, parsed.data.details, parsed.data.email);
  return { ok: true, message: "Report sent. Our team reviews every report." };
}

const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  topic: z.enum(["general", "support", "teams", "privacy", "press"]),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(3000),
  website: z.string().max(0).optional(), // honeypot
});

/** Public contact form; messages appear in the admin console. */
export async function contactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { ok: true, message: "Thanks — your message is on its way." };
    return { ok: false, errors: fieldErrors(parsed.error), message: "Some fields need attention." };
  }
  if (!(await rateLimit(`contact:${await clientKey()}`, 5, 60 * 60_000))) return { ok: false, message: "Too many messages from this device. Try again later." };
  const { name, email, topic, message } = parsed.data;
  await createMessage({ name, email, topic, message });
  return { ok: true, message: "Thanks — your message is on its way. We’ll reply to the email address you gave us." };
}

export async function setMessageStateAction(id: string, state: "new" | "done"): Promise<FormState> {
  const user = await requireAdmin();
  await setMessageState(user, id, state);
  revalidatePath("/admin");
  return { ok: true };
}

export async function resolveReportAction(reportId: string, action: "suspend" | "restore" | "dismiss"): Promise<FormState> {
  const user = await requireAdmin();
  try {
    await resolveReport(user, reportId, action);
  } catch (err) {
    return toFormState(err);
  }
  revalidatePath("/admin");
  revalidatePath("/u/[slug]", "page");
  return { ok: true, message: action === "suspend" ? "Card suspended" : action === "restore" ? "Card restored to draft" : "Report dismissed" };
}

export async function setFlagAction(key: string, enabled: boolean): Promise<FormState> {
  const user = await requireAdmin();
  try {
    await setFlag(user, key, enabled);
  } catch (err) {
    return toFormState(err);
  }
  revalidatePath("/admin");
  return { ok: true, message: `${key} ${enabled ? "on" : "off"}` };
}
