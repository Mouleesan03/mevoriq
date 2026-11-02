"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { exchangeAction } from "@/lib/actions/leads";
import type { FormState } from "@/lib/actions/shared";

const field =
  "h-11 w-full rounded-xl border bg-transparent px-3.5 text-[15px] outline-none placeholder:opacity-60 focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--card-accent)_30%,transparent)]";

/** Visitor shares their details back with the card owner. No account needed (LEAD-01). */
export function ExchangeForm({ slug, firstName }: { slug: string; firstName: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(exchangeAction, { ok: false });
  const errors = state.errors ?? {};
  const borderStyle = { borderColor: "var(--card-border)" };

  if (state.ok && state.message) {
    return (
      <div role="status" className="rounded-2xl border px-5 py-4" style={{ background: "var(--card-surface)", ...borderStyle }}>
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mint text-navy"><Check className="size-4" /></span>
          <p className="text-[15px] font-medium">{state.message}</p>
        </div>
        <a
          href={`/r/${encodeURIComponent(slug)}`}
          className="mt-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-[14px] font-semibold text-white"
          style={{ background: "var(--card-accent)" }}
        >
          Make your own card and send it to {firstName}
          <ArrowRight className="size-4 shrink-0" aria-hidden />
        </a>
        <p className="mt-2 text-[12px]" style={{ color: "var(--card-muted)" }}>Free, about a minute. You choose what to share.</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border" style={{ background: "var(--card-surface)", ...borderStyle }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-none"
      >
        <span>
          <span className="block text-[15px] font-semibold">Share your details with {firstName}</span>
          <span className="block text-[13px]" style={{ color: "var(--card-muted)" }}>So they can follow up. No account needed.</span>
        </span>
        <span className="text-xl leading-none" style={{ color: "var(--card-accent)" }} aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <form action={action} className="space-y-3 px-5 pb-5" noValidate>
          <input type="hidden" name="slug" value={slug} />
          <div className="hidden" aria-hidden>
            <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
          </div>
          {state.message && !state.ok && <p role="alert" className="text-sm text-[#B91C1C]">{state.message}</p>}
          <div>
            <label htmlFor="ex-name" className="mb-1 block text-[13px] font-medium">Name</label>
            <input id="ex-name" name="name" autoComplete="name" required className={field} style={borderStyle} aria-invalid={!!errors.name} />
            {errors.name && <p className="mt-1 text-xs text-[#B91C1C]">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="ex-email" className="mb-1 block text-[13px] font-medium">Email</label>
            <input id="ex-email" name="email" type="email" autoComplete="email" required className={field} style={borderStyle} aria-invalid={!!errors.email} />
            {errors.email && <p className="mt-1 text-xs text-[#B91C1C]">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ex-phone" className="mb-1 block text-[13px] font-medium">Phone <span style={{ color: "var(--card-muted)" }}>(optional)</span></label>
              <input id="ex-phone" name="phone" type="tel" autoComplete="tel" placeholder="+44…" className={field} style={borderStyle} aria-invalid={!!errors.phone} />
              {errors.phone && <p className="mt-1 text-xs text-[#B91C1C]">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="ex-company" className="mb-1 block text-[13px] font-medium">Company <span style={{ color: "var(--card-muted)" }}>(optional)</span></label>
              <input id="ex-company" name="company" autoComplete="organization" className={field} style={borderStyle} />
            </div>
          </div>
          <div>
            <label htmlFor="ex-message" className="mb-1 block text-[13px] font-medium">Note <span style={{ color: "var(--card-muted)" }}>(optional)</span></label>
            <textarea id="ex-message" name="message" rows={2} maxLength={500} placeholder="Where you met, what to talk about" className={`${field} h-auto py-2.5`} style={borderStyle} />
          </div>
          <label className="flex items-start gap-2.5 text-[13px] leading-snug">
            <input type="checkbox" name="consent" className="mt-0.5 size-4 accent-[var(--card-accent)]" required />
            <span>I agree to share these details with {firstName}, who can use them to contact me.{errors.consent && <span className="block text-[#B91C1C]">{errors.consent}</span>}</span>
          </label>
          <label className="flex items-start gap-2.5 text-[13px] leading-snug" style={{ color: "var(--card-muted)" }}>
            <input type="checkbox" name="marketing" className="mt-0.5 size-4 accent-[var(--card-accent)]" />
            <span>{firstName} may also send me occasional updates. (Optional)</span>
          </label>
          <button
            type="submit"
            disabled={pending}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[15px] font-semibold disabled:opacity-60"
            style={{ background: "var(--card-accent)", color: "var(--card-on-accent)" }}
          >
            {pending && <Loader2 className="size-4 animate-spin" />} Send my details
          </button>
          <p className="text-center text-xs" style={{ color: "var(--card-muted)" }}>Only {firstName} can see what you send.</p>
        </form>
      )}
    </section>
  );
}
