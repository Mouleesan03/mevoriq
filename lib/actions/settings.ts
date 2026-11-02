"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { endSession, requireUser } from "@/lib/auth/session";
import { saveImage } from "@/lib/data/media";
import { deleteAccount, updateProfile } from "@/lib/data/profiles";
import { fieldErrors } from "@/lib/validation/card";
import { toFormState, type FormState } from "@/lib/actions/shared";

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = z.object({ displayName: z.string().trim().min(1, "Enter your name.").max(80) }).safeParse({ displayName: formData.get("displayName") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  try {
    const photo = formData.get("photo");
    let avatarMediaId: string | null | undefined;
    if (photo instanceof File && photo.size > 0) avatarMediaId = (await saveImage(user.id, "avatar", photo)).id;
    if (formData.get("removePhoto") === "on") avatarMediaId = null;
    await updateProfile(user.id, { displayName: parsed.data.displayName, ...(avatarMediaId !== undefined && { avatarMediaId }) });
  } catch (err) {
    return toFormState(err);
  }
  revalidatePath("/app", "layout");
  return { ok: true, message: "Profile saved" };
}

export async function deleteAccountAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (String(formData.get("confirm") ?? "").trim().toLowerCase() !== user.email.toLowerCase()) {
    return { ok: false, errors: { confirm: "Type your email address exactly to confirm." } };
  }
  try {
    await deleteAccount(user.id);
  } catch (err) {
    return toFormState(err);
  }
  await endSession();
  redirect("/?deleted=1");
}
