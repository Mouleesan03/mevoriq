import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ExternalLink, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/app-shell";
import { CardEditor } from "@/components/card-editor/card-editor";
import { DeleteCardButton, PublishToggle } from "@/components/cards/card-actions";
import { PageLoading } from "@/components/site/page-loading";
import { requireUser } from "@/lib/auth/session";
import { getCardForEdit } from "@/lib/data/cards";
import { mediaUrl, type CardContent } from "@/lib/cards/types";
import { displayCardUrl, publicCardPath } from "@/lib/cards/urls";
import { appUrl } from "@/lib/env";

export const metadata: Metadata = { title: "Edit card" };

async function EditCard({ params }: { params: PageProps<"/app/cards/[id]/edit">["params"] }) {
  const { id } = await params;
  const user = await requireUser();
  const found = await getCardForEdit(user.id, id);
  if (!found) notFound();
  const { card, locked, organization } = found;
  const published = card.status === "published";
  const content: CardContent = {
    label: card.label,
    context: card.context,
    fullName: card.fullName,
    pronouns: card.pronouns,
    headline: card.headline,
    company: card.company,
    bio: card.bio,
    contacts: card.contacts,
    links: card.links,
    theme: card.theme,
  };

  return (
    <>
      <PageHeader
        eyebrow={<Link href="/app/cards" className="hover:text-foreground">Cards</Link>}
        title={card.label}
        description={<span className="font-mono text-sm">{displayCardUrl(card.slug)}</span>}
        actions={
          <>
            {published && (
              <>
                <Button asChild variant="ghost" size="sm"><Link href={publicCardPath(card.slug)} target="_blank"><ExternalLink /> View</Link></Button>
                <Button asChild variant="outline" size="sm"><Link href={`/app/cards/${card.id}/share`}><QrCode /> Share</Link></Button>
              </>
            )}
            {card.status !== "suspended" && <PublishToggle cardId={card.id} published={published} />}
          </>
        }
      />
      {card.status === "suspended" && (
        <p role="alert" className="mb-8 rounded-2xl border border-danger/25 bg-danger/5 px-5 py-4 text-sm text-danger">
          This card was taken offline after a report. You can still edit it, but it can’t be published until our team restores it.
        </p>
      )}
      <CardEditor
        mode="editor"
        initial={content}
        initialSlug={card.slug}
        cardId={card.id}
        version={card.version}
        status={card.status}
        publicOrigin={appUrl()}
        avatarUrl={mediaUrl(card.avatarMediaId)}
        locked={locked}
        organizationName={organization?.name ?? null}
      />
      <div className="mt-16 flex flex-wrap items-center gap-4 rounded-2xl border border-danger/20 px-5 py-4">
        <p className="flex-1 text-sm text-muted-foreground">Deleting removes the card, its link and the contacts it collected.</p>
        <DeleteCardButton cardId={card.id} />
      </div>
    </>
  );
}

export default function EditCardPage({ params }: PageProps<"/app/cards/[id]/edit">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <EditCard params={params} />
    </Suspense>
  );
}
