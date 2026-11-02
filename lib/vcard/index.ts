import type { PublicCard } from "@/lib/cards/types";

/**
 * vCard 3.0 (RFC 2426) generator.
 * - Escapes backslash, comma, semicolon and newlines in text values.
 * - CRLF line endings; lines folded at 75 octets without splitting UTF-8 characters.
 */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

const encoder = new TextEncoder();

export function foldLine(line: string): string {
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  let limit = 75;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
      limit = 74; // continuation lines start with a space
    }
    current += ch;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

/** "Ada Lovelace King" → family "King", given "Ada Lovelace". Single names go to given. */
export function splitName(fullName: string): { given: string; family: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { given: parts[0] ?? "", family: "" };
  return { given: parts.slice(0, -1).join(" "), family: parts[parts.length - 1] };
}

export function buildVCard(card: PublicCard, publicUrl: string): string {
  const { given, family } = splitName(card.fullName);
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${escapeText(card.fullName)}`, `N:${escapeText(family)};${escapeText(given)};;;`];

  if (card.company) lines.push(`ORG:${escapeText(card.company)}`);
  if (card.headline) lines.push(`TITLE:${escapeText(card.headline)}`);
  if (card.contacts.phone) lines.push(`TEL;TYPE=CELL,VOICE:${card.contacts.phone}`);
  if (card.contacts.whatsapp && card.contacts.whatsapp !== card.contacts.phone) {
    lines.push(`TEL;TYPE=CELL:${card.contacts.whatsapp}`);
  }
  if (card.contacts.email) lines.push(`EMAIL;TYPE=INTERNET,PREF:${card.contacts.email}`);
  if (card.contacts.website) lines.push(`URL:${card.contacts.website}`);
  if (card.contacts.location) lines.push(`ADR;TYPE=WORK:;;${escapeText(card.contacts.location)};;;;`);
  card.links.forEach((link, i) => {
    lines.push(`item${i + 1}.URL:${link.url}`, `item${i + 1}.X-ABLabel:${escapeText(link.label)}`);
  });
  lines.push(`item${card.links.length + 1}.URL:${publicUrl}`, `item${card.links.length + 1}.X-ABLabel:Mevoriq card`);
  if (card.bio) lines.push(`NOTE:${escapeText(card.bio)}`);
  lines.push("END:VCARD");

  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function vcardFilename(card: PublicCard): string {
  const base = card.slug || "contact";
  return `${base}.vcf`;
}
