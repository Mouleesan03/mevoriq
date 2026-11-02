import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { loadPublicCard } from "@/lib/cards/public";
import { publicCardPath } from "@/lib/cards/urls";
import { ReportForm } from "./report-form";

export const metadata: Metadata = { title: "Report a card", robots: { index: false, follow: false } };

async function Report({ params }: { params: PageProps<"/u/[slug]/report">["params"] }) {
  const { slug } = await params;
  const { card } = await loadPublicCard(slug, "/report");
  return (
    <>
      <Link href={publicCardPath(card.slug)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to {card.fullName}
      </Link>
      <h1 className="mt-6 text-3xl font-bold">Report this card</h1>
      <p className="mt-2 text-muted-foreground">
        Tell us what’s wrong with <span className="font-mono text-sm text-foreground">{publicCardPath(card.slug)}</span>. Reports are private; the card owner won’t see who sent them.
      </p>
      <ReportForm slug={card.slug} />
    </>
  );
}

export default function ReportPage({ params }: PageProps<"/u/[slug]/report">) {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
      <Logo height={26} className="mb-10" />
      <Suspense>
        <Report params={params} />
      </Suspense>
    </main>
  );
}
