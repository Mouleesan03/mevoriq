"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { deleteEvent, endEvent, followUpEventContacts, startEvent } from "@/lib/data/events";
import { fieldErrors } from "@/lib/validation/card";
import { toFormState, type FormState } from "@/lib/actions/shared";

const startSchema = z.object({ name: z.string().trim().min(1, "Name the event, for example “DevFest Colombo”.").max(80, "Keep it under 80 characters.") });

function refresh() {
  revalidatePath("/app", "layout");
}

export async function startEventAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = startSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Some fields need attention." };
  try {
    await startEvent(user.id, parsed.data.name);
  } catch (err) {
    return toFormState(err);
  }
  refresh();
  return { ok: true, message: "Event started" };
}

export async function endEventAction(eventId: string): Promise<void> {
  const user = await requireUser();
  await endEvent(user.id, eventId);
  refresh();
  redirect(`/app/events/${eventId}`);
}

/** Puts every new contact from the event on tomorrow's follow-up list. */
export async function followUpAllAction(eventId: string): Promise<void> {
  const user = await requireUser();
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  await followUpEventContacts(user.id, eventId, tomorrow);
  refresh();
}

export async function deleteEventAction(eventId: string): Promise<void> {
  const user = await requireUser();
  await deleteEvent(user.id, eventId);
  refresh();
  redirect("/app/events");
}
