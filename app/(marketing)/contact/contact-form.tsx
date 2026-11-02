"use client";

import { useActionState } from "react";
import { Check, Loader2 } from "lucide-react";
import { contactAction } from "@/lib/actions/admin";
import type { FormState } from "@/lib/actions/shared";

const field =
  "w-full rounded-[14px] border-0 bg-fill px-5 text-[16px] text-ink outline-none placeholder:text-muted-foreground focus:shadow-[inset_0_0_0_2px_var(--mevoriq-indigo),0_0_0_5px_var(--mevoriq-sky)] aria-invalid:shadow-[inset_0_0_0_2px_var(--mevoriq-danger)]";

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(contactAction, { ok: false });
  const errors = state.errors ?? {};
  if (state.ok) {
    return (
      <div role="status" className="flex items-start gap-4 rounded-[12px] bg-leaf p-8">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint"><Check className="size-5 text-ink" strokeWidth={3} /></span>
        <p className="text-lg font-semibold text-mint-ink">{state.message}</p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-5 rounded-[12px] bg-white p-[clamp(20px,3vw,36px)] shadow-[0_0_0_1px_#ECECF1,0_30px_60px_-40px_rgba(18,19,26,0.35)]" noValidate>
      {state.message && <p role="alert" className="rounded-[12px] bg-pink px-4 py-3 text-sm text-[#7A1B2A]">{state.message}</p>}
      <div className="hidden" aria-hidden><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-2 block text-[15px] font-semibold">Name</label>
          <input id="c-name" name="name" autoComplete="name" className={`${field} h-14`} aria-invalid={!!errors.name} />
          {errors.name && <p className="mt-2 text-sm text-danger">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="c-email" className="mb-2 block text-[15px] font-semibold">Email</label>
          <input id="c-email" name="email" type="email" autoComplete="email" className={`${field} h-14`} aria-invalid={!!errors.email} />
          {errors.email && <p className="mt-2 text-sm text-danger">{errors.email}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="c-topic" className="mb-2 block text-[15px] font-semibold">Topic</label>
        <select id="c-topic" name="topic" defaultValue="general" className={`${field} h-14`}>
          <option value="general">General question</option>
          <option value="support">Help with my account</option>
          <option value="teams">Teams and organizations</option>
          <option value="privacy">Privacy or data request</option>
          <option value="press">Press</option>
        </select>
      </div>
      <div>
        <label htmlFor="c-message" className="mb-2 block text-[15px] font-semibold">Message</label>
        <textarea id="c-message" name="message" rows={6} maxLength={3000} className={`${field} py-4`} aria-invalid={!!errors.message} />
        {errors.message && <p className="mt-2 text-sm text-danger">{errors.message}</p>}
      </div>
      <button type="submit" disabled={pending} className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-blue text-[17px] font-semibold text-white shadow-cta hover:bg-blue-deep disabled:opacity-60 sm:w-auto sm:px-10">
        {pending && <Loader2 className="size-5 animate-spin" />} Send message
      </button>
    </form>
  );
}
