"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import { emailSignInAction, googleSignInAction } from "@/lib/actions/auth";
import type { FormState } from "@/lib/actions/shared";
import { slugify } from "@/lib/validation/card";

const pill =
  "h-[58px] w-full rounded-full border-0 bg-fill px-5.5 text-[17px] text-ink outline-none placeholder:text-muted-foreground focus:shadow-[inset_0_0_0_2px_var(--mevoriq-indigo),0_0_0_5px_var(--mevoriq-sky)] aria-invalid:shadow-[inset_0_0_0_2px_var(--mevoriq-danger)]";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() : "?";
}

/** Sign-in form plus the live card preview on the blue panel (shares the typed name). */
export function LoginExperience({ host, logo, mode }: { host: string; logo: ReactNode; mode: "supabase" | "demo" }) {
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  const linkError = params.get("error");
  const [state, action, pending] = useActionState<FormState, FormData>(emailSignInAction, { ok: false });
  const [name, setName] = useState("");
  const errors = state.errors ?? {};
  const shown = name.trim() || "Your name";

  return (
    <>
      <main className="flex min-w-0 flex-[1_1_500px] flex-col px-[clamp(8px,4vw,48px)] pt-4 pb-8">
      {logo}
      <div className="mx-auto my-auto w-full max-w-[440px] py-12">
        <h1 className="text-[clamp(32px,3.4vw,44px)] leading-[1.05] tracking-[-0.035em]">Let’s make your card.</h1>
        <p className="mt-4.5 text-lg leading-normal text-body">Use the same email next time to get back to your cards.</p>
        {state.ok && state.message === "sent" ? (
          <div role="status" className="mt-9 rounded-[14px] bg-leaf p-6">
            <span className="grid size-11 place-items-center rounded-full bg-white"><MailCheck className="size-5 text-mint-ink" /></span>
            <p className="mt-4 text-lg font-bold">Check your email</p>
            <p className="mt-1 text-body">We sent a sign-in link to <span className="font-semibold text-ink">{state.data?.email}</span>. Open it on this device to continue. The link expires in an hour.</p>
          </div>
        ) : (
          <>
            {mode === "supabase" && (
              <>
                <form action={googleSignInAction} className="mt-9">
                  <input type="hidden" name="next" value={next} />
                  <button type="submit" className="flex h-[58px] w-full items-center justify-center gap-3 rounded-full bg-white text-[17px] font-semibold shadow-[inset_0_0_0_2px_var(--mevoriq-border)] hover:shadow-[inset_0_0_0_2px_var(--mevoriq-navy)]">
                    <svg viewBox="0 0 24 24" className="size-5" aria-hidden><path fill="#4285F4" d="M22.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-7.9Z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9l3.7-2.8Z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4Z"/></svg>
                    Continue with Google
                  </button>
                </form>
                <div className="my-6 flex items-center gap-4 text-[13px] text-muted-foreground" aria-hidden><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
              </>
            )}
            <form action={action} className={mode === "supabase" ? "flex flex-col gap-4.5" : "mt-9 flex flex-col gap-4.5"} noValidate>
              <input type="hidden" name="next" value={next} />
              {(state.message || linkError) && !state.ok && (
                <p role="alert" className="rounded-[12px] bg-pink px-4.5 py-3.5 text-sm text-[#7A1B2A]">
                  {state.message ?? (linkError === "google" ? "Google sign-in didn’t work. Try again or use your email." : "That sign-in link has expired or was already used. Request a new one.")}
                </p>
              )}
              <div>
                <label htmlFor="displayName" className="mb-2 block text-[15px] font-semibold">Your name {mode === "supabase" && <span className="font-normal text-muted-foreground">(new accounts)</span>}</label>
                <input id="displayName" name="displayName" autoComplete="name" placeholder="Emma Carter" value={name} onChange={(e) => setName(e.target.value)} className={pill} aria-invalid={!!errors.displayName} />
                {errors.displayName && <p className="mt-2 pl-5 text-sm text-danger">{errors.displayName}</p>}
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-[15px] font-semibold">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" className={pill} aria-invalid={!!errors.email} />
                {errors.email && <p className="mt-2 pl-5 text-sm text-danger">{errors.email}</p>}
              </div>
              <button type="submit" disabled={pending} className="mt-1.5 flex h-[58px] items-center justify-center gap-2 rounded-full bg-blue text-[17px] font-semibold text-white shadow-cta hover:bg-blue-deep disabled:opacity-60">
                {pending && <Loader2 className="size-5 animate-spin" />} {mode === "supabase" ? "Email me a sign-in link" : "Continue"}
              </button>
            </form>
          </>
        )}
        {mode === "demo" ? (
          <p className="mt-7 rounded-[12px] bg-cream px-4.5 py-3.5 text-sm leading-normal text-body">
            Demo sign-in: accounts are kept on this computer until email and Google sign-in are connected. No password needed.
          </p>
        ) : (
          <p className="mt-7 text-[13px] leading-normal text-muted-foreground">
            No password needed. By continuing you agree to our <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy policy</a>.
          </p>
        )}
      </div>
      </main>

      <aside className="relative flex min-h-[640px] min-w-0 flex-[1_1_520px] flex-col justify-center gap-12 overflow-hidden rounded-[14px] bg-blue p-[clamp(32px,5vw,72px)] text-white max-lg:hidden" aria-label="Card preview">
        <div className="relative h-[280px] w-full max-w-[420px] self-center">
          <div aria-hidden className="absolute inset-[20px_0_0_0] rotate-[8deg] rounded-[26px] bg-coral" />
          <div aria-hidden className="absolute inset-[10px_0_10px_0] -rotate-6 rounded-[26px] bg-yellow" />
          <div className="absolute inset-[0_0_20px_0] flex flex-col rounded-[26px] bg-white p-7 text-ink shadow-[0_34px_60px_-24px_rgba(10,20,80,0.6)]">
            <div className="flex items-center justify-between">
              <span className="grid size-14 place-items-center rounded-full bg-blue text-[19px] font-bold text-white">{initials(name)}</span>
              <span className="rounded-full bg-leaf px-3 py-1.5 text-[13px] font-semibold text-mint-ink">Live preview</span>
            </div>
            <p className="mt-auto truncate text-[28px] leading-none font-extrabold tracking-[-0.03em]">{shown}</p>
            <p className="mt-2.5 truncate font-mono text-[13px] text-muted-foreground">{host}/u/{slugify(name) || "your-name"}</p>
          </div>
        </div>
        <div className="relative max-w-[460px] self-center">
          <h2 className="text-[clamp(26px,2.6vw,36px)] leading-[1.08]">“Where did we meet?” You’ll know.</h2>
          <p className="mt-4 text-[17px] leading-[1.55] text-[#DCE3FF]">Every contact who shares back arrives tagged with your card. Notes and follow-up dates live next to them.</p>
        </div>
      </aside>
    </>
  );
}
