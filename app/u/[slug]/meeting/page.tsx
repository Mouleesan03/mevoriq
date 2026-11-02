import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { X } from "lucide-react";
import { loadPublicCard } from "@/lib/cards/public";
import { displayCardUrl, publicCardPath, publicCardUrl } from "@/lib/cards/urls";
import { qrSvg } from "@/lib/qr";

export const metadata: Metadata = { title: "Meeting Mode", robots: { index: false, follow: false } };

/** Mevoriq Meet session screen: full-bleed indigo, QR always on white (sub-brand guidelines). */
async function Meeting({ params, searchParams }: { params: PageProps<"/u/[slug]/meeting">["params"]; searchParams: PageProps<"/u/[slug]/meeting">["searchParams"] }) {
  const { slug } = await params;
  const fromApp = (await searchParams).from === "app";
  const { card } = await loadPublicCard(slug, "/meeting");
  const svg = await qrSvg(publicCardUrl(card.slug));
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-indigo px-6 py-12 text-white">
      <Link
        href={fromApp ? "/app" : publicCardPath(card.slug)}
        aria-label="Close Meeting Mode"
        className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-4 flex size-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 focus-visible:ring-[3px] focus-visible:ring-white/60 focus-visible:outline-none"
      >
        <X className="size-5" />
      </Link>
      <div className="relative">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            className="absolute rounded-[16px] border-2 border-mint motion-safe:animate-[ping_1.6s_cubic-bezier(0,0,0.2,1)_1]"
            style={{ inset: `${-10 - i * 10}px`, opacity: [0.4, 0.25, 0.1][i], animationDelay: `${i * 120}ms` }}
          />
        ))}
        <div
          className="relative size-[min(76vw,340px)] overflow-hidden rounded-[12px] bg-white p-4 [&>svg]:h-full [&>svg]:w-full"
          role="img"
          aria-label={`QR code for ${card.fullName}'s card`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      <h1 className="mt-14 text-center text-[clamp(28px,7vw,40px)] leading-tight font-extrabold">{card.fullName}</h1>
      {(card.headline || card.company) && <p className="mt-2 text-center text-lg text-white/85">{[card.headline, card.company].filter(Boolean).join(" · ")}</p>}
      <p className="mt-8 font-mono text-sm text-white/80">{displayCardUrl(card.slug)}</p>
      <p className="mt-6 text-center text-sm text-white/75">Scan to save my details. Turn your screen brightness up.</p>
    </div>
  );
}

export default function MeetingPage({ params, searchParams }: PageProps<"/u/[slug]/meeting">) {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<div className="min-h-dvh bg-indigo" />}>
        <Meeting params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
