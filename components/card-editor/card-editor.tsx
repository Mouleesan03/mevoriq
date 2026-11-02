"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Camera, Check, Eye, Loader2, Lock, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BusinessCard, initials } from "@/components/cards/business-card";
import { PhonePreview } from "@/components/card-editor/phone-preview";
import { checkSlugAction, removeCardPhotoAction, saveCardAction, uploadCardPhotoAction } from "@/lib/actions/cards";
import type { FormState } from "@/lib/actions/shared";
import { CARD_CONTEXTS, LINK_KINDS, type CardContent, type CardStatus, type LinkKind, type PublicCard } from "@/lib/cards/types";
import { THEMES, TEMPLATE_KEYS, resolveAccent } from "@/lib/cards/themes";
import type { LockableField } from "@/lib/data/models";
import { slugify } from "@/lib/validation/card";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "identity", question: "What’s your name?", hint: "This is how your card introduces you." },
  { key: "contact", question: "How can people reach you?", hint: "Add only what you’re happy to share. You can add links later." },
  { key: "design", question: "Pick a look.", hint: "Every combination stays easy to read." },
  { key: "publish", question: "Choose your link.", hint: "Your QR code points here. It never needs reprinting." },
] as const;
type StepKey = (typeof STEPS)[number]["key"];

const SECTIONS = [
  { id: "identity", label: "Identity" },
  { id: "photo", label: "Photo" },
  { id: "contact", label: "Contact" },
  { id: "links", label: "Links" },
  { id: "design", label: "Design" },
  { id: "address", label: "Address" },
];

const contextLabels: Record<(typeof CARD_CONTEXTS)[number], string> = {
  professional: "Professional",
  freelancer: "Freelance",
  event: "Event",
  creator: "Creator",
  personal: "Personal",
};

const linkLabels: Record<LinkKind, string> = {
  website: "Website",
  portfolio: "Portfolio",
  linkedin: "LinkedIn",
  github: "GitHub",
  x: "X",
  instagram: "Instagram",
  youtube: "YouTube",
  calendar: "Book a meeting",
  other: "Link",
};

function stepHasError(errors: Record<string, string>, step: StepKey) {
  return Object.keys(errors).some((e) =>
    step === "identity" ? /^(label|context|fullName|pronouns|headline|company|bio)/.test(e)
    : step === "contact" ? /^(contacts|links)/.test(e)
    : step === "design" ? /^theme/.test(e)
    : e === "slug",
  );
}

export interface CardEditorProps {
  mode: "wizard" | "editor";
  initial: CardContent;
  initialSlug: string;
  cardId?: string;
  version?: number;
  status?: CardStatus;
  publicOrigin: string;
  avatarUrl?: string | null;
  locked?: LockableField[];
  organizationName?: string | null;
}

function Field({ id, label, error, hint, locked, children }: { id: string; label: string; error?: string; hint?: string; locked?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-1.5 text-[13px] font-medium">
        {label}
        {locked && <Lock className="size-3 text-muted-foreground" aria-label="Set by your organization" />}
      </Label>
      {children}
      {error ? <p id={`${id}-error`} className="text-[13px] text-danger">{error}</p> : hint ? <p className="text-[13px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const selectClass =
  "h-12 w-full rounded-2xl border-0 bg-fill px-4 text-[15px] outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--mevoriq-indigo),0_0_0_5px_var(--mevoriq-sky)]";

export function CardEditor({ mode, initial, initialSlug, cardId, version, status, publicOrigin, avatarUrl: initialAvatar = null, locked = [], organizationName }: CardEditorProps) {
  const [content, setContent] = useState<CardContent>(initial);
  const [slugInput, setSlugInput] = useState(initialSlug);
  const [slugTouched, setSlugTouched] = useState(Boolean(cardId));
  const slug = slugTouched ? slugInput : slugify(content.fullName);
  const [slugCheck, setSlugCheck] = useState<{ ok: boolean; message: string } | null>(null);
  const [step, setStep] = useState<StepKey>("identity");
  const [showPreview, setShowPreview] = useState(false);
  const [intent, setIntent] = useState<"draft" | "publish">("draft");
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveCardAction, { ok: true });
  const [currentVersion, setCurrentVersion] = useState(version);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);
  const [photoPending, startPhoto] = useTransition();
  const [dirty, setDirty] = useState(false);
  const [, startCheck] = useTransition();
  const errors = state.errors ?? {};
  const formRef = useRef<HTMLFormElement>(null);
  const isLocked = (f: LockableField) => locked.includes(f);

  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    if (state.ok && state.version) {
      setCurrentVersion(state.version);
      setDirty(false);
    }
    if (mode === "wizard" && state.errors) {
      const first = STEPS.find((s) => stepHasError(state.errors!, s.key));
      if (first) setStep(first.key);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => startCheck(async () => setSlugCheck(slug ? await checkSlugAction(slug, cardId) : null)), slug ? 350 : 0);
    return () => clearTimeout(t);
  }, [slug, cardId]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty || mode === "wizard") return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, mode]);

  const update = (fn: (c: CardContent) => CardContent) => {
    setContent(fn);
    setDirty(true);
  };
  const set = <K extends keyof CardContent>(key: K, value: CardContent[K]) => update((c) => ({ ...c, [key]: value }));
  const setContact = (key: keyof CardContent["contacts"], value: string) => update((c) => ({ ...c, contacts: { ...c.contacts, [key]: value } }));

  const theme = THEMES[content.theme.template];
  const host = publicOrigin.replace(/^https?:\/\//, "");
  const displayUrl = `${host}/u/${slug || "your-name"}`;
  const preview: PublicCard = useMemo(
    () => ({
      slug,
      fullName: content.fullName,
      pronouns: content.pronouns,
      headline: content.headline,
      company: content.company,
      bio: content.bio,
      contacts: content.contacts,
      links: content.links.filter((l) => l.label && l.url),
      theme: content.theme,
      avatarUrl,
      logoUrl: null,
    }),
    [content, slug, avatarUrl],
  );

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const show = (k: StepKey) => mode === "editor" || step === k;
  const submit = (next: "draft" | "publish") => {
    setIntent(next);
    requestAnimationFrame(() => formRef.current?.requestSubmit());
  };

  const uploadPhoto = (file: File) => {
    if (!cardId) return;
    const fd = new FormData();
    fd.append("photo", file);
    startPhoto(async () => {
      const res = await uploadCardPhotoAction(cardId, fd);
      setPhotoMessage(res.message ?? null);
      if (res.ok && res.url) {
        setAvatarUrl(res.url);
        if (res.version) setCurrentVersion(res.version);
      }
    });
  };

  const section = "scroll-mt-24 space-y-5 border-b pb-10";
  const heading = (title: string, text?: string) =>
    mode === "editor" ? (
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {text && <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>}
      </div>
    ) : null;

  const lockNote = organizationName && locked.length > 0 && (
    <p className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
      <Lock className="size-4 shrink-0" /> Fields with a lock are set by {organizationName}.
    </p>
  );

  return (
    <div className={cn("grid gap-10", mode === "editor" ? "xl:grid-cols-[160px_minmax(0,1fr)_360px] lg:grid-cols-[minmax(0,1fr)_360px]" : "lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16")}>
      {mode === "editor" && (
        <nav aria-label="Sections" className="hidden xl:block">
          <ul className="sticky top-24 space-y-0.5 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">{s.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <form ref={formRef} action={formAction} className="min-w-0 space-y-10" noValidate>
        <input type="hidden" name="payload" value={JSON.stringify(content)} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="intent" value={intent} />
        {cardId && <input type="hidden" name="cardId" value={cardId} />}
        {currentVersion !== undefined && <input type="hidden" name="version" value={currentVersion} />}

        {mode === "wizard" && (
          <div>
            <div className="flex items-center justify-between text-[13px] text-muted-foreground">
              <span>Step {stepIndex + 1} of {STEPS.length}</span>
              {stepIndex > 0 && (
                <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setStep(STEPS[stepIndex - 1].key)}>
                  <ArrowLeft className="size-3.5" /> Back
                </button>
              )}
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={stepIndex + 1}>
              <div className="h-full rounded-full bg-navy transition-[width] duration-500" style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
            </div>
            <h1 className="mt-10 text-[clamp(32px,4.5vw,48px)] leading-[1.02] font-extrabold tracking-[-0.035em]">{STEPS[stepIndex].question}</h1>
            <p className="mt-3 text-muted-foreground">{STEPS[stepIndex].hint}</p>
          </div>
        )}

        {state.message && !state.ok && (
          <div role="alert" className="rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">{state.message}</div>
        )}
        {mode === "editor" && lockNote}

        {show("identity") && (
          <section id="identity" className={mode === "editor" ? section : "space-y-5"}>
            {heading("Identity", "Your name and role, as they appear on the card.")}
            <Field id="fullName" label="Full name" error={errors.fullName}>
              <Input id="fullName" value={content.fullName} onChange={(e) => set("fullName", e.target.value)} autoComplete="name" aria-invalid={!!errors.fullName} className={mode === "wizard" ? "h-14 text-lg" : ""} autoFocus={mode === "wizard"} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="headline" label="Job title" error={errors.headline}>
                <Input id="headline" value={content.headline} onChange={(e) => set("headline", e.target.value)} autoComplete="organization-title" placeholder="e.g. Product Designer" />
              </Field>
              <Field id="company" label="Organization" error={errors.company} locked={isLocked("company")}>
                <Input id="company" value={content.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" disabled={isLocked("company")} />
              </Field>
            </div>
            {mode === "editor" && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="pronouns" label="Pronouns (optional)">
                    <Input id="pronouns" value={content.pronouns} onChange={(e) => set("pronouns", e.target.value)} placeholder="e.g. she/her" />
                  </Field>
                  <Field id="context" label="Used for">
                    <select id="context" value={content.context} onChange={(e) => set("context", e.target.value as CardContent["context"])} className={selectClass}>
                      {CARD_CONTEXTS.map((c) => <option key={c} value={c}>{contextLabels[c]}</option>)}
                    </select>
                  </Field>
                </div>
                <Field id="bio" label="Short bio" error={errors.bio} hint={`${content.bio.length} of 280 characters`}>
                  <Textarea id="bio" value={content.bio} onChange={(e) => set("bio", e.target.value)} rows={3} maxLength={280} placeholder="One or two sentences about what you do." />
                </Field>
              </>
            )}
          </section>
        )}

        {mode === "editor" && (
          <section id="photo" className={section}>
            {heading("Photo", "A clear photo helps people remember who they met.")}
            <div className="flex flex-wrap items-center gap-5">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Your card photo" className="size-20 rounded-full object-cover" />
              ) : (
                <span className="flex size-20 items-center justify-center rounded-full bg-muted text-xl font-bold text-muted-foreground">{initials(content.fullName)}</span>
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" asChild disabled={photoPending}>
                  <label className="cursor-pointer">
                    {photoPending ? <Loader2 className="animate-spin" /> : <Camera />} {avatarUrl ? "Replace photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadPhoto(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </Button>
                {avatarUrl && cardId && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={photoPending}
                    onClick={() =>
                      startPhoto(async () => {
                        const res = await removeCardPhotoAction(cardId);
                        if (res.ok) {
                          setAvatarUrl(null);
                          if (res.version) setCurrentVersion(res.version);
                        }
                        setPhotoMessage(res.message ?? null);
                      })
                    }
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className="w-full text-[13px] text-muted-foreground" aria-live="polite">{photoMessage ?? "JPG, PNG or WebP, up to 5 MB. We crop it to a square."}</p>
            </div>
          </section>
        )}

        {show("contact") && (
          <section id="contact" className={mode === "editor" ? section : "space-y-5"}>
            {heading("Contact", "These become the buttons on your card and the details in “Save contact”.")}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="email" label="Email" error={errors["contacts.email"]}>
                <Input id="email" type="email" value={content.contacts.email} onChange={(e) => setContact("email", e.target.value)} autoComplete="email" aria-invalid={!!errors["contacts.email"]} />
              </Field>
              <Field id="phone" label="Phone" error={errors["contacts.phone"]} hint="Include the country code, e.g. +44 7700 900123">
                <Input id="phone" type="tel" value={content.contacts.phone} onChange={(e) => setContact("phone", e.target.value)} autoComplete="tel" aria-invalid={!!errors["contacts.phone"]} />
              </Field>
              <Field id="whatsapp" label="WhatsApp (optional)" error={errors["contacts.whatsapp"]}>
                <Input id="whatsapp" type="tel" value={content.contacts.whatsapp} onChange={(e) => setContact("whatsapp", e.target.value)} aria-invalid={!!errors["contacts.whatsapp"]} />
              </Field>
              <Field id="website" label="Website" error={errors["contacts.website"]} locked={isLocked("website")}>
                <Input id="website" type="url" value={content.contacts.website} onChange={(e) => setContact("website", e.target.value)} placeholder="example.com" disabled={isLocked("website")} aria-invalid={!!errors["contacts.website"]} />
              </Field>
            </div>
            <Field id="location" label="City (optional)" error={errors["contacts.location"]}>
              <Input id="location" value={content.contacts.location} onChange={(e) => setContact("location", e.target.value)} placeholder="London, United Kingdom" />
            </Field>
          </section>
        )}

        {mode === "editor" && (
          <section id="links" className={section}>
            {heading("Links", "Portfolio, LinkedIn, a booking page. Up to 12.")}
            {content.links.length === 0 && <p className="text-sm text-muted-foreground">No links yet.</p>}
            <ul className="space-y-3">
              {content.links.map((link, i) => (
                <li key={link.id} className="grid gap-2 rounded-[14px] border bg-surface p-3 sm:grid-cols-[150px_1fr_1.4fr_auto] sm:items-start">
                  <select
                    aria-label={`Link ${i + 1} type`}
                    value={link.kind}
                    onChange={(e) => {
                      const kind = e.target.value as LinkKind;
                      set("links", content.links.map((l) => (l.id === link.id ? { ...l, kind, label: !l.label || l.label === linkLabels[l.kind] ? linkLabels[kind] : l.label } : l)));
                    }}
                    className={selectClass}
                  >
                    {LINK_KINDS.map((k) => <option key={k} value={k}>{linkLabels[k]}</option>)}
                  </select>
                  <div>
                    <Input aria-label={`Link ${i + 1} label`} value={link.label} onChange={(e) => set("links", content.links.map((l) => (l.id === link.id ? { ...l, label: e.target.value } : l)))} aria-invalid={!!errors[`links.${i}.label`]} />
                    {errors[`links.${i}.label`] && <p className="mt-1 text-xs text-danger">{errors[`links.${i}.label`]}</p>}
                  </div>
                  <div>
                    <Input aria-label={`Link ${i + 1} address`} type="url" placeholder="https://" value={link.url} onChange={(e) => set("links", content.links.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l)))} aria-invalid={!!errors[`links.${i}.url`]} />
                    {errors[`links.${i}.url`] && <p className="mt-1 text-xs text-danger">{errors[`links.${i}.url`]}</p>}
                  </div>
                  <Button type="button" variant="ghost" size="icon" aria-label={`Remove link ${i + 1}`} onClick={() => set("links", content.links.filter((l) => l.id !== link.id))}>
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              disabled={content.links.length >= 12}
              onClick={() => set("links", [...content.links, { id: crypto.randomUUID(), kind: "linkedin", label: "LinkedIn", url: "" }])}
            >
              <Plus /> Add link
            </Button>
          </section>
        )}

        {show("design") && (
          <section id="design" className={mode === "editor" ? section : "space-y-6"}>
            {heading("Design", isLocked("theme") ? `Set by ${organizationName ?? "your organization"}.` : "Choose a template, then an accent color.")}
            <div role="radiogroup" aria-label="Template" className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {TEMPLATE_KEYS.map((key) => {
                const t = THEMES[key];
                const selected = content.theme.template === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={isLocked("theme")}
                    onClick={() => set("theme", { template: key, accent: resolveAccent(t, content.theme.accent).value })}
                    className="group text-left focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className={cn("block rounded-[12px] p-1 ring-2 transition-shadow", selected ? "ring-navy" : "ring-transparent group-hover:ring-border group-focus-visible:ring-indigo")}>
                      <BusinessCard interactive={false} displayUrl={displayUrl} card={{ ...preview, theme: { template: key, accent: resolveAccent(t, content.theme.accent).value } }} />
                    </span>
                    <span className="mt-2 flex items-center gap-1.5 px-1 text-sm font-medium">
                      {selected && <Check className="size-3.5" />} {t.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <div>
              <p className="mb-3 text-[13px] font-medium" id="accent-label">Accent</p>
              <div role="radiogroup" aria-labelledby="accent-label" className="flex flex-wrap gap-2.5">
                {theme.accents.map((a) => {
                  const selected = resolveAccent(theme, content.theme.accent).value === a.value;
                  return (
                    <button
                      key={a.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={a.name}
                      title={a.name}
                      disabled={isLocked("theme")}
                      onClick={() => set("theme", { ...content.theme, accent: a.value })}
                      className={cn("flex size-10 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-shadow focus-visible:ring-[3px] focus-visible:ring-indigo focus-visible:outline-none disabled:opacity-60", selected && "ring-2 ring-navy")}
                      style={{ background: a.value, color: a.onAccent }}
                    >
                      {selected && <Check className="size-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {show("publish") && (
          <section id="address" className={mode === "editor" ? "scroll-mt-24 space-y-5" : "space-y-5"}>
            {heading("Address", "If you change it, the old address keeps redirecting here.")}
            <Field id="slug" label="Card address" error={errors.slug ?? (slugCheck && !slugCheck.ok ? slugCheck.message : undefined)}>
              <div className="flex h-12 items-stretch overflow-hidden rounded-2xl bg-fill focus-within:shadow-[inset_0_0_0_2px_var(--mevoriq-indigo),0_0_0_5px_var(--mevoriq-sky)]">
                <span className="flex items-center pl-3.5 font-mono text-[13px] whitespace-nowrap text-muted-foreground">{host}/u/</span>
                <input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setDirty(true);
                    setSlugInput(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  className="min-w-0 flex-1 bg-transparent pr-2 font-mono text-[14px] outline-none"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-invalid={!!errors.slug || (slugCheck ? !slugCheck.ok : false)}
                />
                <span className="flex items-center pr-3.5" aria-live="polite">
                  {slugCheck?.ok && <Check className="size-4 text-success" aria-label="Available" />}
                  {slugCheck && !slugCheck.ok && <X className="size-4 text-danger" aria-label={slugCheck.message} />}
                </span>
              </div>
            </Field>
            <Field id="label" label="Card name (only you see this)" error={errors.label}>
              <Input id="label" value={content.label} onChange={(e) => set("label", e.target.value)} placeholder="e.g. Work card" />
            </Field>
          </section>
        )}

        <div className={cn("flex flex-wrap items-center gap-3", mode === "editor" ? "sticky bottom-[calc(var(--bottom-nav,0px)+0.75rem)] z-20 rounded-[14px] border bg-background/95 px-3 py-2.5 shadow-[0_12px_30px_-18px_rgba(18,19,26,0.35)] backdrop-blur-xl sm:px-4" : "sticky bottom-[calc(var(--bottom-nav,0px)+0.75rem)] z-20 -mx-1 rounded-[14px] bg-background/95 px-1 py-2 backdrop-blur-xl md:static md:bg-transparent md:p-0")}>
          <Button type="button" variant="outline" className="lg:hidden" onClick={() => setShowPreview(true)}>
            <Eye /> Preview
          </Button>
          {mode === "editor" && (
            <span className="text-[13px] text-muted-foreground" aria-live="polite">
              {pending ? "Saving…" : dirty ? "Unsaved changes" : state.ok && state.savedAt ? "All changes saved" : ""}
            </span>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {mode === "wizard" && stepIndex < STEPS.length - 1 && (
              <Button type="button" size="lg" onClick={() => setStep(STEPS[stepIndex + 1].key)} disabled={step === "identity" && !content.fullName.trim()}>
                Continue <ArrowRight />
              </Button>
            )}
            {mode === "wizard" && step === "publish" && (
              <Button type="button" size="lg" onClick={() => submit("publish")} disabled={pending || (slugCheck ? !slugCheck.ok : false)}>
                {pending && <Loader2 className="animate-spin" />} Publish my card
              </Button>
            )}
            {mode === "editor" && (
              <>
                <Button type="button" variant={status === "published" ? "default" : "outline"} onClick={() => submit("draft")} disabled={pending || !dirty}>
                  {pending && intent === "draft" && <Loader2 className="animate-spin" />} Save changes
                </Button>
                {status !== "published" && status !== "suspended" && (
                  <Button type="button" onClick={() => submit("publish")} disabled={pending}>
                    {pending && intent === "publish" && <Loader2 className="animate-spin" />} Save and publish
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </form>

      <aside aria-label="Live preview" className="hidden lg:block">
        <div className="sticky top-24">
          <p className="mb-4 text-center text-[13px] text-muted-foreground">Live preview</p>
          <PhonePreview card={preview} displayUrl={displayUrl} />
        </div>
      </aside>

      {showPreview && (
        <div role="dialog" aria-modal="true" aria-label="Card preview" className="fixed inset-0 z-50 overflow-auto bg-background/95 p-4 backdrop-blur lg:hidden">
          <div className="mb-4 flex justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowPreview(false)} autoFocus>
              <X /> Close preview
            </Button>
          </div>
          <PhonePreview card={preview} displayUrl={displayUrl} />
        </div>
      )}
    </div>
  );
}
