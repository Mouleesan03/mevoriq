import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Building2, Check, UserRound } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CardEditor } from "@/components/card-editor/card-editor";
import { PageLoading } from "@/components/site/page-loading";
import { requireUser } from "@/lib/auth/session";
import { emptyCardContent, mediaUrl } from "@/lib/cards/types";
import { listCards } from "@/lib/data/cards";
import { appUrl } from "@/lib/env";
import { getActiveTeam } from "@/lib/team";
import { RegisterBusinessForm } from "./register-business-form";

export const metadata: Metadata = { title: "Create your card", robots: { index: false } };

function Choice() {
  const options = [
    {
      href: "/onboarding?for=me",
      icon: UserRound,
      title: "Just me",
      text: "A personal card for freelancers, founders and professionals.",
      points: ["Your own link and QR code", "Contacts, follow-ups and events", "Add it to your company later"],
      tone: "bg-sky",
    },
    {
      href: "/onboarding?for=business",
      icon: Building2,
      title: "My company",
      text: "Register your business and give every employee a matching card.",
      points: ["Company brand on every card", "Invite and remove employees", "Cards unpublish when people leave"],
      tone: "bg-cream",
    },
  ];
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-[30px] leading-[1.1] tracking-[-0.03em] sm:text-[42px]">Who is this card for?</h1>
      <p className="mt-3 text-[17px] text-body">You can change this later. Personal cards stay yours even if you join a company.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {options.map((o) => (
          <li key={o.href}>
            <Link href={o.href} className="group flex h-full flex-col rounded-[16px] border bg-surface p-6 transition-shadow hover:shadow-[0_0_0_2px_var(--mevoriq-indigo)] focus-visible:shadow-[0_0_0_3px_var(--mevoriq-indigo)] focus-visible:outline-none sm:p-7">
              <span className={`flex size-12 items-center justify-center rounded-2xl ${o.tone}`}><o.icon className="size-6" aria-hidden /></span>
              <span className="mt-5 text-xl font-bold">{o.title}</span>
              <span className="mt-1.5 text-body">{o.text}</span>
              <span className="mt-5 space-y-2 text-[14px]">
                {o.points.map((p) => (
                  <span key={p} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-mint-ink" aria-hidden />{p}</span>
                ))}
              </span>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-semibold text-blue">Continue <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Business() {
  return (
    <div className="mx-auto max-w-xl">
      <Link href="/onboarding" className="text-[13px] text-muted-foreground hover:text-foreground">Back</Link>
      <h1 className="mt-3 text-[30px] leading-[1.1] tracking-[-0.03em] sm:text-[42px]">Register your company</h1>
      <p className="mt-3 mb-8 text-[17px] text-body">You’ll be the owner. Next you’ll make your own card, then invite your employees from Team.</p>
      <RegisterBusinessForm />
    </div>
  );
}

async function Wizard({ searchParams }: { searchParams: PageProps<"/onboarding">["searchParams"] }) {
  const sp = await searchParams;
  const user = await requireUser();
  const [cards, team] = await Promise.all([listCards(user.id), getActiveTeam(user.id)]);
  const path = sp.for === "business" ? "business" : sp.for === "me" ? "me" : cards.length === 0 && !team.active ? "choice" : "me";
  if (path === "choice") return <Choice />;
  if (path === "business") return <Business />;

  const company = sp.company === "1" ? team.active?.org : undefined;
  const base = emptyCardContent(user.displayName);
  return (
    <>
      {company && (
        <p role="status" className="mb-8 flex items-center gap-3 rounded-[14px] bg-leaf px-4 py-3.5 text-[15px] text-mint-ink sm:px-5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mint text-ink"><Check className="size-4" /></span>
          <span><b>{company.name}</b> is registered. Make your own card now; you can invite your team right after.</span>
        </p>
      )}
      <CardEditor
        mode="wizard"
        initial={{
          ...base,
          label: "Work card",
          company: company ? company.brand.company || company.name : "",
          contacts: { ...base.contacts, email: user.email, website: company?.brand.website ?? "" },
        }}
        initialSlug=""
        publicOrigin={appUrl()}
        avatarUrl={mediaUrl(user.avatarMediaId)}
      />
    </>
  );
}

export default function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="Mevoriq home"><Logo height={26} tone="light" /></Link>
        <Link href="/app/cards" className="text-sm text-muted-foreground hover:text-foreground">Skip for now</Link>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 lg:py-14">
        <Suspense fallback={<PageLoading />}>
          <Wizard searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
