import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/site/app-shell";
import { MiniCard } from "@/components/cards/mini-card";
import { PageLoading } from "@/components/site/page-loading";
import { requireUser } from "@/lib/auth/session";
import { listCards } from "@/lib/data/cards";

export const metadata: Metadata = { title: "Cards" };

async function Cards() {
  const user = await requireUser();
  const cards = await listCards(user.id);
  return (
    <>
      <PageHeader
        title="Cards"
        description="One card per side of you: work, freelance, an event. Each has its own link and QR code."
        actions={<Button asChild><Link href="/app/cards/new"><Plus /> New card</Link></Button>}
      />
      {cards.length === 0 ? (
        <EmptyState title="No cards yet" text="Your first card takes about three minutes." action={<Button asChild><Link href="/onboarding">Create your first card</Link></Button>} />
      ) : (
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.id}>
              <MiniCard card={card} href={`/app/cards/${card.id}/edit`} organizationName={card.organizationName} />
            </li>
          ))}
          <li>
            <Link
              href="/app/cards/new"
              className="flex aspect-[1.75] items-center justify-center gap-2 rounded-[14px] border-2 border-dashed text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              <Plus className="size-5" /> New card
            </Link>
          </li>
        </ul>
      )}
    </>
  );
}

export default function CardsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Cards />
    </Suspense>
  );
}
