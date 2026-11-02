import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BadgeCheck, Download, ExternalLink, Maximize2, Pencil, UserPlus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/app-shell";
import { BusinessCard } from "@/components/cards/business-card";
import { CopyButton, NativeShareButton, PublishToggle } from "@/components/cards/card-actions";
import { PageLoading } from "@/components/site/page-loading";
import { ReplyBanner } from "@/components/reply/reply-banner";
import { requireUser } from "@/lib/auth/session";
import { getCardForEdit } from "@/lib/data/cards";
import { qrSvg } from "@/lib/qr";
import { mediaUrl } from "@/lib/cards/types";
import { QR_SOURCES, withSource } from "@/lib/cards/sources";
import { verifiedDomain } from "@/lib/cards/verified";
import { appleWalletConfigured } from "@/lib/wallet/apple";
import { googleWalletConfigured } from "@/lib/wallet/google";
import { displayCardUrl, publicCardPath, publicCardUrl, qrPath, vcardPath } from "@/lib/cards/urls";

export const metadata: Metadata = { title: "Share card" };

async function Share({ params, searchParams }: { params: PageProps<"/app/cards/[id]/share">["params"]; searchParams: PageProps<"/app/cards/[id]/share">["searchParams"] }) {
  const { id } = await params;
  const isNew = (await searchParams).new === "1";
  const user = await requireUser();
  const found = await getCardForEdit(user.id, id);
  if (!found) notFound();
  const { card } = found;
  const url = publicCardUrl(card.slug);
  const published = card.status === "published";
  const svg = await qrSvg(url);
  const off = published ? "" : "pointer-events-none opacity-45";
  const verified = verifiedDomain(user.email, card.contacts);
  const accountDomain = user.email.split("@")[1] ?? "";
  const wallets = { apple: appleWalletConfigured(), google: googleWalletConfigured() };
  const showWallet = wallets.apple || wallets.google || process.env.NODE_ENV !== "production";

  return (
    <>
      <PageHeader
        eyebrow={<Link href="/app/cards" className="hover:text-foreground">Cards</Link>}
        title={isNew ? "Your card is live." : published ? "Share your card" : "Not live yet"}
        description={published ? "Send the link, or let people scan the QR code. Tap the card to flip it." : "Publish this card to turn on its link and QR code."}
        actions={<Button asChild variant="outline" size="sm"><Link href={`/app/cards/${card.id}/edit`}><Pencil /> Edit card</Link></Button>}
      />

      {published && <div className="-mt-4 mb-8"><ReplyBanner userId={user.id} /></div>}

      {!published && (
        <div className="mb-10 flex flex-wrap items-center gap-3 rounded-[14px] border bg-surface px-5 py-4 text-sm">
          <p className="flex-1">Visitors see “not available” until you publish.</p>
          {card.status !== "suspended" && <PublishToggle cardId={card.id} published={false} size="default" />}
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-16">
        <div className="mx-auto w-full max-w-[460px] lg:mx-0">
          <BusinessCard
            card={{ fullName: card.fullName, pronouns: card.pronouns, headline: card.headline, company: card.company, theme: card.theme, avatarUrl: mediaUrl(card.avatarMediaId), logoUrl: null }}
            displayUrl={displayCardUrl(card.slug)}
            qrSvg={svg}
            intro={isNew}
          />
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-[13px] font-medium text-muted-foreground">Permanent link</h2>
            <p className="mt-2 font-mono text-lg break-all">{url}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <CopyButton value={url} variant="default" />
              <NativeShareButton url={url} title={card.fullName} />
              {published && <Button asChild variant="ghost"><Link href={publicCardPath(card.slug)} target="_blank"><ExternalLink /> Open</Link></Button>}
            </div>
          </section>

          <section className="divide-y border-y">
            <div className="flex flex-wrap items-center gap-4 py-5">
              <Maximize2 className="size-5 text-indigo" aria-hidden />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">Meeting Mode</h2>
                <p className="text-sm text-muted-foreground">Full-screen QR for events and in-person introductions.</p>
              </div>
              <Button asChild variant="outline" size="sm" className={off}><Link href={`${publicCardPath(card.slug)}/meeting?from=app`}>Open</Link></Button>
            </div>
            {showWallet && (
              <div className="flex flex-wrap items-center gap-4 py-5">
                <Wallet className="size-5 text-indigo" aria-hidden />
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">Add to your phone’s wallet</h2>
                  <p className="text-sm text-muted-foreground">
                    {wallets.apple || wallets.google
                      ? "Your QR is one swipe away, even offline. Re-add it after you edit the card."
                      : "Not set up yet: add the Apple and Google Wallet keys to the server (see docs/deploy.md)."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {wallets.apple && <Button asChild variant="ink" size="sm" className={off}><a href={`/api/v1/cards/${card.id}/wallet/apple`}>Apple Wallet</a></Button>}
                  {wallets.google && <Button asChild variant="ink" size="sm" className={off}><a href={`/api/v1/cards/${card.id}/wallet/google`}>Google Wallet</a></Button>}
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 py-5">
              <Download className="size-5 text-indigo" aria-hidden />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">QR code for print</h2>
                <p className="text-sm text-muted-foreground">Stays the same when you edit the card.</p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className={off}><a href={`${qrPath(card.slug, "svg")}&download=1`} download>SVG</a></Button>
                <Button asChild variant="outline" size="sm" className={off}><a href={`${qrPath(card.slug, "png")}&download=1`} download>PNG</a></Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 py-5">
              <BadgeCheck className="size-5 text-indigo" aria-hidden />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{verified ? `Verified at ${verified}` : "Verified badge"}</h2>
                <p className="text-sm text-muted-foreground">
                  {verified
                    ? "Shown on your card because you sign in with an email on this domain."
                    : `Add a website or contact email on your company domain${accountDomain ? ` (@${accountDomain})` : ""} to show a verified badge. Personal email providers like Gmail don’t qualify.`}
                </p>
              </div>
              {!verified && <Button asChild variant="outline" size="sm"><Link href={`/app/cards/${card.id}/edit`}>Edit card</Link></Button>}
            </div>
            <div className="flex flex-wrap items-center gap-4 py-5">
              <UserPlus className="size-5 text-indigo" aria-hidden />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">Contact file (.vcf)</h2>
                <p className="text-sm text-muted-foreground">The same file people get from “Save contact”.</p>
              </div>
              <Button asChild variant="outline" size="sm" className={off}><a href={vcardPath(card.slug)}>Download</a></Button>
            </div>
          </section>

          <section aria-labelledby="sources-heading">
            <h2 id="sources-heading" className="font-semibold">A QR for each place</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use a different QR on your brochure, badge or slides. Insights then shows which one people scan most. It still opens the same card.</p>
            <ul className={`mt-4 divide-y overflow-hidden rounded-[14px] border bg-surface ${off}`}>
              {QR_SOURCES.map((src) => (
                <li key={src.key} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 sm:px-5">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{src.label}</span>
                    <span className="block text-[13px] text-muted-foreground">{src.hint}</span>
                  </span>
                  <span className="flex gap-1.5">
                    <CopyButton value={withSource(url, src.key)} label="Copy link" variant="secondary" size="sm" />
                    <Button asChild variant="outline" size="sm"><a href={`${qrPath(card.slug, "svg", src.key)}&download=1`} download>SVG</a></Button>
                    <Button asChild variant="outline" size="sm"><a href={`${qrPath(card.slug, "png", src.key)}&download=1`} download>PNG</a></Button>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}

export default function ShareCardPage({ params, searchParams }: PageProps<"/app/cards/[id]/share">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Share params={params} searchParams={searchParams} />
    </Suspense>
  );
}
