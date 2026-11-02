"use client";

import { useActionState, useState, useTransition } from "react";
import { Check, Copy, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changeRoleAction, createCompanyCardAction, createOrgAction, inviteAction, revokeInviteAction, setMemberStatusAction, switchOrgAction, updateBrandAction,
} from "@/lib/actions/team";
import type { FormState } from "@/lib/actions/shared";
import { THEMES, TEMPLATE_KEYS, resolveAccent, type TemplateKey } from "@/lib/cards/themes";
import { LOCKABLE_FIELDS, type LockableField, type Organization } from "@/lib/data/models";
import { slugify } from "@/lib/validation/card";
import { cn } from "@/lib/utils";

const msg = (s: FormState) => s.message && <span className={cn("text-[13px]", s.ok ? "text-mint-ink" : "text-danger")} aria-live="polite">{s.message}</span>;
const selectClass = "h-12 w-full rounded-2xl border-0 bg-fill px-4 text-[15px] outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--mevoriq-indigo),0_0_0_5px_var(--mevoriq-sky)]";

export function CreateOrgForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createOrgAction, { ok: false });
  return (
    <form action={action} className="flex max-w-md flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="name" className="sr-only">Organization name</Label>
        <Input id="name" name="name" placeholder="Organization name" aria-invalid={!!state.errors?.name} />
        {state.errors?.name && <p className="text-[13px] text-danger">{state.errors.name}</p>}
        {msg(state)}
      </div>
      <Button type="submit" disabled={pending} className="h-11">{pending && <Loader2 className="animate-spin" />} Create team</Button>
    </form>
  );
}

export function TeamSwitcher({ current, orgs }: { current: string; orgs: { id: string; name: string }[] }) {
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Switch team"
      defaultValue={current}
      disabled={pending}
      onChange={(e) => start(() => switchOrgAction(e.target.value))}
      className="h-10 rounded-full border bg-surface px-3 text-[13px]"
    >
      {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  );
}

export function InviteForm({ orgId }: { orgId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(inviteAction.bind(null, orgId), { ok: false });
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-3">
      <form action={action} className="grid gap-3 sm:grid-cols-[1fr_160px_auto] sm:items-start">
        <div className="space-y-1">
          <Label htmlFor="invite-email" className="sr-only">Email</Label>
          <Input id="invite-email" name="email" type="email" placeholder="name@company.com" aria-invalid={!!state.errors?.email} />
          {state.errors?.email && <p className="text-[13px] text-danger">{state.errors.email}</p>}
        </div>
        <select name="role" defaultValue="member" aria-label="Role" className={selectClass}>
          <option value="member">Member</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <Button type="submit" disabled={pending} className="h-11">{pending ? <Loader2 className="animate-spin" /> : <Plus />} Invite</Button>
      </form>
      {state.ok && state.data?.link ? (
        <div className="rounded-2xl border border-mint/40 bg-mint/8 p-4">
          <p className="text-sm font-medium">{state.message}. Send them this link (valid for 7 days):</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-surface px-3 py-2 font-mono text-[12.5px]">{state.data.link}</code>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(state.data!.link);
                setCopied(true);
              }}
            >
              {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">Invitation emails will be sent automatically once email delivery is connected.</p>
        </div>
      ) : (
        msg(state)
      )}
    </div>
  );
}

export function RevokeInviteButton({ invitationId }: { invitationId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => start(async () => void (await revokeInviteAction(invitationId)))}>
      Cancel
    </Button>
  );
}

export function MemberControls({ orgId, memberId, role, status, canAdmin }: { orgId: string; memberId: string; role: string; status: "active" | "deactivated"; canAdmin: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  if (!canAdmin || role === "owner") return null;
  const run = (fn: () => Promise<FormState>) =>
    start(async () => {
      const res = await fn();
      setError(res.ok ? null : (res.message ?? null));
    });
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {status === "active" && (
        <select
          aria-label="Role"
          defaultValue={role}
          disabled={pending}
          onChange={(e) => run(() => changeRoleAction(orgId, memberId, e.target.value as "admin" | "manager" | "member"))}
          className="h-8 rounded-full border bg-surface px-2.5 text-[13px]"
        >
          <option value="member">Member</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      )}
      <Button
        type="button"
        size="sm"
        variant={status === "active" ? "ghost" : "outline"}
        className={status === "active" ? "text-danger hover:bg-danger/8 hover:text-danger" : ""}
        disabled={pending}
        onClick={() => {
          if (status === "active" && !window.confirm("Remove this person’s access? Their company cards are unpublished; their personal cards aren’t affected.")) return;
          run(() => setMemberStatusAction(orgId, memberId, status === "active" ? "deactivated" : "active"));
        }}
      >
        {pending && <Loader2 className="animate-spin" />} {status === "active" ? "Remove access" : "Restore access"}
      </Button>
      {error && <p className="w-full text-right text-[12px] text-danger">{error}</p>}
    </div>
  );
}

export function CompanyCardForm({ orgId, memberId, suggested }: { orgId: string; memberId: string; suggested: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(createCompanyCardAction.bind(null, orgId, memberId), { ok: false });
  if (state.ok) return <span className="text-[12px] text-mint-ink">{state.message}</span>;
  if (!open) return <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}><Plus /> Company card</Button>;
  return (
    <form action={action} className="flex flex-wrap items-start justify-end gap-2">
      <div>
        <Input name="slug" defaultValue={slugify(suggested)} aria-label="Card address" className="h-8 w-44 font-mono text-[13px]" aria-invalid={!!state.errors?.slug} />
        {state.errors?.slug && <p className="mt-1 text-[12px] text-danger">{state.errors.slug}</p>}
      </div>
      <Button type="submit" size="sm" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Create</Button>
      {state.message && <p className={cn("w-full text-right text-[12px]", state.ok ? "text-mint-ink" : "text-danger")}>{state.message}</p>}
    </form>
  );
}

const LOCK_LABEL: Record<LockableField, string> = { theme: "Template and accent", company: "Company name", website: "Website" };

export function BrandForm({ org, logoUrl }: { org: Organization; logoUrl: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateBrandAction.bind(null, org.id), { ok: false });
  const [template, setTemplate] = useState<TemplateKey>(org.brand.template);
  const [accent, setAccent] = useState(org.brand.accent);
  const theme = THEMES[template];
  const current = resolveAccent(theme, accent).value;
  return (
    <form action={action} className="max-w-3xl space-y-10">
      <section className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="org-name" className="text-[13px]">Team name</Label>
          <Input id="org-name" name="name" defaultValue={org.name} aria-invalid={!!state.errors?.name} />
          {state.errors?.name && <p className="text-[13px] text-danger">{state.errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company" className="text-[13px]">Company name on cards</Label>
          <Input id="company" name="company" defaultValue={org.brand.company} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="website" className="text-[13px]">Company website</Label>
          <Input id="website" name="website" defaultValue={org.brand.website} placeholder="company.com" aria-invalid={!!state.errors?.website} />
          {state.errors?.website && <p className="text-[13px] text-danger">{state.errors.website}</p>}
        </div>
        <div className="space-y-1.5">
          <span className="text-[13px] font-medium">Logo</span>
          <div className="flex min-w-0 items-center gap-3">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Current logo" className="size-11 rounded-xl border object-contain p-1" />
            )}
            <input type="file" name="logo" accept="image/jpeg,image/png,image/webp" className="w-full min-w-0 text-[13px] file:mr-3 file:rounded-full file:border file:bg-surface file:px-3 file:py-1.5 file:text-[13px]" />
          </div>
          {logoUrl && <label className="flex items-center gap-2 text-[13px] text-muted-foreground"><input type="checkbox" name="removeLogo" /> Remove logo</label>}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-bold">Card design</h2>
        <input type="hidden" name="template" value={template} />
        <input type="hidden" name="accent" value={current} />
        <div role="radiogroup" aria-label="Template" className="flex flex-wrap gap-2">
          {TEMPLATE_KEYS.map((k) => (
            <button key={k} type="button" role="radio" aria-checked={template === k} onClick={() => setTemplate(k)} className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px]", template === k ? "border-navy bg-navy text-white" : "hover:bg-muted")}>
              <span className="size-3 rounded-full border border-white/40" style={{ background: THEMES[k].face }} /> {THEMES[k].name}
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="Accent" className="flex flex-wrap gap-2.5">
          {theme.accents.map((a) => (
            <button key={a.value} type="button" role="radio" aria-checked={current === a.value} aria-label={a.name} onClick={() => setAccent(a.value)} className={cn("flex size-9 items-center justify-center rounded-full ring-offset-2", current === a.value && "ring-2 ring-navy")} style={{ background: a.value, color: a.onAccent }}>
              {current === a.value && <Check className="size-4" />}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Lock for members</h2>
        <p className="text-sm text-muted-foreground">Locked fields use the values above on every company card. Admins can still edit them.</p>
        <div className="divide-y overflow-hidden rounded-[14px] border bg-surface">
          {LOCKABLE_FIELDS.map((f) => (
            <label key={f} className="flex items-center justify-between gap-4 px-4 py-3.5 text-[15px]">
              {LOCK_LABEL[f]}
              <input type="checkbox" name={`lock_${f}`} defaultChecked={org.brand.lockedFields.includes(f)} className="size-4 accent-[var(--mevoriq-navy)]" />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">Contacts privacy</h2>
        <label className="flex items-start gap-3 rounded-[14px] border bg-surface px-4 py-3.5 text-[15px]">
          <input type="checkbox" name="adminsCanViewLeads" defaultChecked={org.brand.adminsCanViewLeads} className="mt-1 size-4 accent-[var(--mevoriq-navy)]" />
          <span>
            Admins can see contacts collected by company cards
            <span className="block text-[13px] text-muted-foreground">Off by default. Tell your team before turning this on.</span>
          </span>
        </label>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending && <Loader2 className="animate-spin" />} Save and apply</Button>
        {msg(state)}
      </div>
    </form>
  );
}
