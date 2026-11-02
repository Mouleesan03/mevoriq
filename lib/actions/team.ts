"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser, setActiveOrgId } from "@/lib/auth/session";
import { getFlag } from "@/lib/data/admin";
import { saveImage } from "@/lib/data/media";
import * as orgs from "@/lib/data/orgs";
import { LOCKABLE_FIELDS, type LockableField } from "@/lib/data/models";
import { TEMPLATE_KEYS, getTheme, resolveAccent } from "@/lib/cards/themes";
import { fieldErrors, safeUrl, slugSchema } from "@/lib/validation/card";
import { appUrl } from "@/lib/env";
import { toFormState, type FormState } from "@/lib/actions/shared";

const done = (message: string): FormState => {
  revalidatePath("/app", "layout");
  return { ok: true, message };
};

export async function createOrgAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!(await getFlag("teams"))) return { ok: false, message: "Teams are not available right now." };
  const parsed = z.object({ name: z.string().trim().min(2, "Use at least 2 characters.").max(80) }).safeParse({ name: formData.get("name") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const org = await orgs.createOrganization(user.id, parsed.data.name);
  await setActiveOrgId(org.id);
  revalidatePath("/app", "layout");
  redirect("/app/team");
}

export async function switchOrgAction(orgId: string) {
  const user = await requireUser();
  if ((await orgs.listMyOrganizations(user.id)).some((o) => o.org.id === orgId)) await setActiveOrgId(orgId);
  revalidatePath("/app", "layout");
}

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  role: z.enum(["admin", "manager", "member"]),
});

export async function inviteAction(orgId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  try {
    const { token } = await orgs.createInvitation(user.id, orgId, parsed.data.email, parsed.data.role);
    revalidatePath("/app/team", "layout");
    return { ok: true, message: `Invitation ready for ${parsed.data.email}`, data: { link: `${appUrl()}/invite/${token}` } };
  } catch (err) {
    return toFormState(err);
  }
}

export async function revokeInviteAction(invitationId: string): Promise<FormState> {
  const user = await requireUser();
  try {
    await orgs.revokeInvitation(user.id, invitationId);
    return done("Invitation cancelled");
  } catch (err) {
    return toFormState(err);
  }
}

export async function changeRoleAction(orgId: string, memberId: string, role: "admin" | "manager" | "member"): Promise<FormState> {
  const user = await requireUser();
  try {
    await orgs.changeRole(user.id, orgId, memberId, role);
    return done("Role updated");
  } catch (err) {
    return toFormState(err);
  }
}

export async function setMemberStatusAction(orgId: string, memberId: string, status: "active" | "deactivated"): Promise<FormState> {
  const user = await requireUser();
  try {
    await orgs.setMemberStatus(user.id, orgId, memberId, status);
    return done(status === "deactivated" ? "Access removed and company cards unpublished" : "Access restored");
  } catch (err) {
    return toFormState(err);
  }
}

export async function updateBrandAction(orgId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Use at least 2 characters.").max(80),
      company: z.string().trim().max(100),
      website: safeUrl,
      template: z.enum(TEMPLATE_KEYS),
      accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Some fields need attention." };
  const lockedFields = LOCKABLE_FIELDS.filter((f) => formData.get(`lock_${f}`) === "on") as LockableField[];
  try {
    const logo = formData.get("logo");
    const logoMediaId = logo instanceof File && logo.size > 0 ? (await saveImage(user.id, "logo", logo)).id : formData.get("removeLogo") === "on" ? null : undefined;
    const theme = getTheme(parsed.data.template);
    await orgs.updateBrand(user.id, orgId, {
      name: parsed.data.name,
      logoMediaId,
      brand: {
        template: parsed.data.template,
        accent: resolveAccent(theme, parsed.data.accent).value,
        company: parsed.data.company,
        website: parsed.data.website,
        lockedFields,
        adminsCanViewLeads: formData.get("adminsCanViewLeads") === "on",
      },
    });
    return done("Brand saved and applied to company cards");
  } catch (err) {
    return toFormState(err);
  }
}

export async function createCompanyCardAction(orgId: string, memberId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const slug = slugSchema.safeParse(formData.get("slug"));
  if (!slug.success) return { ok: false, errors: { slug: slug.error.issues[0].message } };
  try {
    await orgs.createCompanyCard(user.id, orgId, memberId, slug.data);
    return done("Company card created as a draft");
  } catch (err) {
    return toFormState(err);
  }
}

export async function acceptInviteAction(token: string): Promise<FormState> {
  const user = await requireUser();
  let orgId: string;
  try {
    orgId = (await orgs.acceptInvitation(user.id, token)).id;
  } catch (err) {
    return toFormState(err);
  }
  await setActiveOrgId(orgId);
  revalidatePath("/app", "layout");
  redirect("/app/team");
}

/** Business sign-up: registers the company (the person becomes its owner), then continues to their own card. */
export async function registerBusinessAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!(await getFlag("teams"))) return { ok: false, message: "Company accounts are not available right now." };
  const parsed = z
    .object({ name: z.string().trim().min(2, "Use at least 2 characters.").max(80, "Keep it under 80 characters."), website: safeUrl })
    .safeParse({ name: formData.get("name"), website: formData.get("website") ?? "" });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), message: "Some fields need attention." };
  const org = await orgs.createOrganization(user.id, parsed.data.name);
  if (parsed.data.website) {
    await orgs.updateBrand(user.id, org.id, { name: org.name, brand: { ...org.brand, company: org.name, website: parsed.data.website } });
  }
  await setActiveOrgId(org.id);
  revalidatePath("/app", "layout");
  redirect("/onboarding?for=me&company=1");
}
