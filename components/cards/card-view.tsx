import type { CSSProperties, ReactNode } from "react";
import {
  AtSign, BadgeCheck, BriefcaseBusiness, Briefcase, Calendar, Camera, ChevronRight, Code2, Globe, Link2, MapPin, MessageCircle, Phone, Play, QrCode, UserPlus,
} from "lucide-react";
import type { LinkKind, PublicCard } from "@/lib/cards/types";
import { getTheme, resolveAccent } from "@/lib/cards/themes";
import { BusinessCard } from "@/components/cards/business-card";
import { ExchangeForm } from "@/components/cards/exchange-form";
import { TrackedLink } from "@/components/cards/card-beacon";
import { formatPhone } from "@/lib/format";

const linkIcons: Record<LinkKind, typeof Globe> = {
  website: Globe,
  portfolio: Briefcase,
  linkedin: BriefcaseBusiness,
  github: Code2,
  x: AtSign,
  instagram: Camera,
  youtube: Play,
  calendar: Calendar,
  other: Link2,
};

// Country-code length varies, so numbers are shown exactly as stored (E.164) rather than guessed into groups.
const prettyPhone = formatPhone;
const prettyUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/**
 * Public card page body. Pure (no hooks) so it renders on the server for visitors
 * and inside the editor's live preview (`preview` disables links and forms).
 */
export function CardView({
  card,
  displayUrl,
  qrSvg,
  vcardHref,
  meetingHref,
  reportHref,
  exchangeEnabled = false,
  preview = false,
}: {
  card: PublicCard;
  displayUrl: string;
  qrSvg?: string;
  vcardHref?: string;
  meetingHref?: string;
  reportHref?: string;
  exchangeEnabled?: boolean;
  preview?: boolean;
}) {
  const theme = getTheme(card.theme.template);
  const accent = resolveAccent(theme, card.theme.accent);
  const style = {
    "--card-surface": theme.surface,
    "--card-text": theme.text,
    "--card-muted": theme.muted,
    "--card-border": theme.border,
    "--card-accent": accent.value,
    "--card-on-accent": accent.onAccent,
    color: theme.text,
  } as CSSProperties;
  const { contacts } = card;
  const firstName = (card.fullName || "them").split(" ")[0];

  const rows: { href: string; label: string; value: string; icon: ReactNode; external?: boolean }[] = [];
  if (contacts.phone) rows.push({ href: `tel:${contacts.phone}`, label: "Call", value: prettyPhone(contacts.phone), icon: <Phone /> });
  if (contacts.email) rows.push({ href: `mailto:${contacts.email}`, label: "Email", value: contacts.email, icon: <AtSign /> });
  if (contacts.whatsapp) rows.push({ href: `https://wa.me/${contacts.whatsapp.replace(/^\+/, "")}`, label: "WhatsApp", value: prettyPhone(contacts.whatsapp), icon: <MessageCircle />, external: true });
  if (contacts.website) rows.push({ href: contacts.website, label: "Website", value: prettyUrl(contacts.website), icon: <Globe />, external: true });

  const rowClass = "flex min-h-14 items-center gap-3.5 px-4";
  const Row = ({ href, external, children }: { href: string; external?: boolean; children: ReactNode }) =>
    preview ? (
      <div className={rowClass}>{children}</div>
    ) : (
      <TrackedLink
        href={href}
        external={external}
        className={`${rowClass} transition-colors hover:bg-[color-mix(in_srgb,var(--card-text)_4%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--card-text)_7%,transparent)] focus-visible:outline-none`}
      >
        {children}
      </TrackedLink>
    );

  const group = "divide-y divide-[var(--card-border)] overflow-hidden rounded-2xl border";
  const groupStyle = { background: "var(--card-surface)", borderColor: "var(--card-border)" };

  return (
    <div style={style} className={preview ? "pointer-events-none w-full select-none" : "w-full"}>
      <div className="mx-auto w-full max-w-[420px] space-y-4">
        <BusinessCard card={card} displayUrl={displayUrl} qrSvg={qrSvg} interactive={!preview} />

        {card.verifiedDomain && (
          <p className="flex justify-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium"
              style={{ background: "var(--card-surface)", borderColor: "var(--card-border)" }}
              title={`${firstName} signs in to Mevoriq with an @${card.verifiedDomain} email address.`}
            >
              <BadgeCheck className="size-4" style={{ color: "var(--card-accent)" }} aria-hidden />
              Verified at {card.verifiedDomain}
            </span>
          </p>
        )}

        <a
          href={preview ? undefined : vcardHref}
          tabIndex={preview ? -1 : undefined}
          className="mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-lg text-[15px] font-semibold transition-opacity hover:opacity-90 focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--card-accent)_35%,transparent)] focus-visible:outline-none"
          style={{ background: "var(--card-accent)", color: "var(--card-on-accent)" }}
        >
          <UserPlus className="size-[18px]" aria-hidden /> Save contact
        </a>

        {rows.length > 0 && (
          <ul className={group} style={groupStyle}>
            {rows.map((r) => (
              <li key={r.label}>
                <Row href={r.href} external={r.external}>
                  <span className="[&>svg]:size-[18px]" style={{ color: "var(--card-accent)" }} aria-hidden>{r.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px]" style={{ color: "var(--card-muted)" }}>{r.label}</span>
                    <span className="block truncate text-[15px] font-medium">{r.value}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 opacity-40" aria-hidden />
                </Row>
              </li>
            ))}
          </ul>
        )}

        {(card.bio || contacts.location) && (
          <section className="rounded-2xl border px-5 py-4" style={groupStyle} aria-label="About">
            {card.bio && <p className="text-[15px] leading-relaxed">{card.bio}</p>}
            {contacts.location && (
              <p className={`flex items-center gap-1.5 text-[13px] ${card.bio ? "mt-3" : ""}`} style={{ color: "var(--card-muted)" }}>
                <MapPin className="size-3.5" aria-hidden />
                {contacts.location}
              </p>
            )}
          </section>
        )}

        {card.links.length > 0 && (
          <ul className={group} style={groupStyle} aria-label="Links">
            {card.links.map((link, i) => {
              const Icon = linkIcons[link.kind] ?? Link2;
              return (
                <li key={`${link.url}-${i}`}>
                  <Row href={link.url} external>
                    <Icon className="size-[18px] shrink-0" style={{ color: "var(--card-accent)" }} aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{link.label}</span>
                    <span className="hidden max-w-[45%] truncate font-mono text-xs sm:block" style={{ color: "var(--card-muted)" }}>{prettyUrl(link.url)}</span>
                    <ChevronRight className="size-4 shrink-0 opacity-40" aria-hidden />
                  </Row>
                </li>
              );
            })}
          </ul>
        )}

        {exchangeEnabled && !preview && <ExchangeForm slug={card.slug} firstName={firstName} />}

        {!preview && (
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2 text-[13px]" style={{ color: "var(--card-muted)" }}>
            {meetingHref && (
              <a href={meetingHref} className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline">
                <QrCode className="size-3.5" aria-hidden /> Full-screen QR
              </a>
            )}
            {reportHref && <a href={reportHref} className="underline-offset-4 hover:underline">Report this card</a>}
          </div>
        )}
      </div>
    </div>
  );
}
