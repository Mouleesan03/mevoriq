"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import * as cards from "@/lib/data/cards";
import { saveImage } from "@/lib/data/media";
import { publicCardPath } from "@/lib/cards/urls";
import { cardContentSchema, fieldErrors, slugSchema } from "@/lib/validation/card";
import { toFormState, type FormState } from "@/lib/actions/shared";

const saveSchema = z.object({
  cardId: z.string().optional(),
  version: z.coerce.number().int().optional(),
  slug: z.string(),
  intent: z.enum(["draft", "publish"]),
  payload: z.string().max(50_000),
});

function revalidateCard(slug: string) {
  revalidatePath("/app", "layout");
  revalidatePath(publicCardPath(slug));
}

/** Creates or updates a card from the editor. Ownership always comes from the session. */
export async function saveCardAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const form = saveSchema.safeParse(Object.fromEntries(formData));
  if (!form.success) return { ok: false, message: "Something went wrong. Reload the page and try again." };

  let raw: unknown;
  try {
    raw = JSON.parse(form.data.payload);
  } catch {
    return { ok: false, message: "The form could not be read. Reload the page and try again." };
  }
  const content = cardContentSchema.safeParse(raw);
  const slug = slugSchema.safeParse(form.data.slug);
  if (!content.success || !slug.success) {
    return {
      ok: false,
      message: "Some fields need attention.",
      errors: { ...(content.success ? {} : fieldErrors(content.error)), ...(slug.success ? {} : { slug: slug.error.issues[0].message }) },
    };
  }

  let card;
  try {
    card = form.data.cardId
      ? await cards.updateCard(user.id, form.data.cardId, content.data, form.data.version ?? -1, slug.data)
      : await cards.createCard(user.id, content.data, slug.data);
    if (form.data.intent === "publish" && card.status !== "published") card = await cards.setStatus(user.id, card.id, "published");
  } catch (err) {
    return toFormState(err);
  }
  revalidateCard(card.slug);
  if (!form.data.cardId || form.data.intent === "publish") redirect(`/app/cards/${card.id}/share${form.data.cardId ? "" : "?new=1"}`);
  return { ok: true, version: card.version, savedAt: card.updatedAt, message: "Changes saved" };
}

export async function checkSlugAction(slug: string, cardId?: string): Promise<{ ok: boolean; message: string }> {
  await requireUser();
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return (await cards.isSlugAvailable(parsed.data, cardId)) ? { ok: true, message: "Available" } : { ok: false, message: "Already taken" };
}

export async function setCardStatusAction(cardId: string, status: "published" | "draft"): Promise<FormState> {
  const user = await requireUser();
  try {
    const card = await cards.setStatus(user.id, cardId, status);
    revalidateCard(card.slug);
    return { ok: true, message: status === "published" ? "Published" : "Unpublished" };
  } catch (err) {
    return toFormState(err);
  }
}

export async function deleteCardAction(cardId: string): Promise<FormState> {
  const user = await requireUser();
  let slug: string;
  try {
    slug = (await cards.deleteCard(user.id, cardId)).slug;
  } catch (err) {
    return toFormState(err);
  }
  revalidateCard(slug);
  redirect("/app/cards");
}

export async function uploadCardPhotoAction(cardId: string, formData: FormData): Promise<FormState & { url?: string }> {
  const user = await requireUser();
  const file = formData.get("photo");
  if (!(file instanceof File)) return { ok: false, message: "Choose an image to upload." };
  try {
    const media = await saveImage(user.id, "avatar", file);
    const card = await cards.setCardAvatar(user.id, cardId, media.id);
    revalidateCard(card.slug);
    return { ok: true, url: `/api/v1/media/${media.id}`, version: card.version, message: "Photo updated" };
  } catch (err) {
    return toFormState(err);
  }
}

export async function removeCardPhotoAction(cardId: string): Promise<FormState> {
  const user = await requireUser();
  try {
    const card = await cards.setCardAvatar(user.id, cardId, null);
    revalidateCard(card.slug);
    return { ok: true, version: card.version, message: "Photo removed" };
  } catch (err) {
    return toFormState(err);
  }
}
