import Link from "next/link";
import { BusinessCard } from "@/components/cards/business-card";
import { mediaUrl, type Card } from "@/lib/cards/types";
import { displayCardUrl } from "@/lib/cards/urls";

const statusLabel: Record<Card["status"], string> = { published: "Live", draft: "Draft", archived: "Archived", suspended: "Suspended" };

/** Card thumbnail used in lists: the business card face plus its status. */
export function MiniCard({ card, href, organizationName }: { card: Card; href: string; organizationName?: string | null }) {
  return (
    <Link href={href} className="group block focus-visible:outline-none">
      <div className="rounded-[14px] p-1 ring-2 ring-transparent transition-shadow group-hover:ring-border group-focus-visible:ring-indigo">
        <BusinessCard
          interactive={false}
          displayUrl={displayCardUrl(card.slug)}
          card={{ fullName: card.fullName, pronouns: card.pronouns, headline: card.headline, company: card.company, theme: card.theme, avatarUrl: mediaUrl(card.avatarMediaId), logoUrl: null }}
        />
      </div>
      <div className="mt-3 flex items-center gap-2 px-1">
        <span className="truncate font-semibold">{card.label}</span>
        <span
          className={
            card.status === "published"
              ? "rounded-full bg-mint/15 px-2 py-0.5 text-[11px] font-semibold text-mint-ink"
              : card.status === "suspended"
                ? "rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-semibold text-danger"
                : "rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
          }
        >
          {statusLabel[card.status]}
        </span>
        {organizationName && <span className="ml-auto truncate text-[12px] text-muted-foreground">{organizationName}</span>}
      </div>
    </Link>
  );
}
