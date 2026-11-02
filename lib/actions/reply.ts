"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth/session";
import { getFlag } from "@/lib/data/admin";
import { recordEvent } from "@/lib/data/analytics";
import { createLead } from "@/lib/data/leads";
import { publicCardUrl } from "@/lib/cards/urls";
import { rateLimit } from "@/lib/rate-limit";
import { getReplyTarget, REPLY_COOKIE } from "@/lib/reply";

/** Sends the signed-in person's card back to the card they came from, as a contact with their consent (this tap). */
export async function sendCardBackAction(): Promise<void> {
  const user = await requireUser();
  const target = await getReplyTarget(user.id);
  if (!target?.myCard || !(await getFlag("contact_exchange"))) return;
  if (!(await rateLimit(`reply:${user.id}`, 5, 60 * 60_000))) return;
  await createLead(target.cardId, {
    name: user.displayName.slice(0, 100),
    email: user.email,
    phone: "",
    company: target.myCard.company,
    message: `Here’s my card: ${publicCardUrl(target.myCard.slug)}`,
    marketingConsent: false,
  });
  await recordEvent(target.cardId, "exchange");
  (await cookies()).set(REPLY_COOKIE, `sent:${target.slug}`, { maxAge: 60, httpOnly: true, sameSite: "lax", path: "/" });
  revalidatePath("/app", "layout");
}

export async function dismissReplyAction(): Promise<void> {
  (await cookies()).delete(REPLY_COOKIE);
  revalidatePath("/app", "layout");
}
