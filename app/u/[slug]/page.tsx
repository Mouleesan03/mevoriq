import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CardView } from "@/components/cards/card-view";
import { CardBeacon } from "@/components/cards/card-beacon";
import { LogoSymbol } from "@/components/brand/logo";
import { getTheme } from "@/lib/cards/themes";
import { findPublicCard, loadPublicCard } from "@/lib/cards/public";
import { displayCardUrl, publicCardPath, publicCardUrl, vcardPath } from "@/lib/cards/urls";
import { getFlag } from "@/lib/data/admin";
import { qrSvg } from "@/lib/qr";

// Personal contact pages are not indexed unless the owner opts in (docs/product-plan.md §11).
export async function generateMetadata({ params }: PageProps<"/u/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await findPublicCard(slug);
  if (!found) return { title: "Mevoriq card", robots: { index: false } };
  const { card } = found;
  const description = [card.headline, card.company].filter(Boolean).join(" · ") || "Digital business card";
  return {
    title: card.fullName,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: publicCardPath(card.slug) },
    openGraph: { title: card.fullName, description, type: "profile", url: publicCardPath(card.slug) },
  };
}

async function PublicCardContent({ params }: { params: PageProps<"/u/[slug]">["params"] }) {
  const { slug } = await params;
  const { card } = await loadPublicCard(slug);
  const theme = getTheme(card.theme.template);
  const [svg, exchangeEnabled, maintenance] = await Promise.all([qrSvg(publicCardUrl(card.slug)), getFlag("contact_exchange"), getFlag("maintenance_mode")]);
  return (
    <div className="flex min-h-dvh flex-1 flex-col items-center px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+2.5rem)] sm:pt-14" style={{ background: theme.page }}>
      {maintenance && (
        <p className="mb-4 w-full max-w-[420px] rounded-xl bg-[#FEF3C7] px-4 py-2 text-center text-[13px] text-[#78350F]">
          Mevoriq is undergoing maintenance. Some features may be unavailable.
        </p>
      )}
      <CardBeacon slug={card.slug}>
        <CardView
          card={card}
          displayUrl={displayCardUrl(card.slug)}
          qrSvg={svg}
          vcardHref={vcardPath(card.slug)}
          meetingHref={`${publicCardPath(card.slug)}/meeting`}
          reportHref={`${publicCardPath(card.slug)}/report`}
          exchangeEnabled={exchangeEnabled}
        />
      </CardBeacon>
      <Link
        href={`/r/${encodeURIComponent(card.slug)}`}
        className="mt-10 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
        style={{ color: theme.muted, borderColor: theme.border }}
      >
        <LogoSymbol size={16} /> Make your own on Mevoriq
      </Link>
    </div>
  );
}

export default function PublicCardPage({ params }: PageProps<"/u/[slug]">) {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<div className="min-h-dvh" />}>
        <PublicCardContent params={params} />
      </Suspense>
    </main>
  );
}
