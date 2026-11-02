import type { Card } from "@/lib/cards/types";
import { getTheme, resolveAccent } from "@/lib/cards/themes";

/** What both wallet passes show: the card face and its QR, nothing private. Pure, so it is unit-tested. */
export interface PassContent {
  serial: string; // changes when the card changes, so wallets show the latest version
  name: string;
  role: string;
  company: string;
  url: string;
  displayUrl: string;
  background: string;
  foreground: string;
}

export function passContent(card: Card, url: string, displayUrl: string): PassContent {
  const accent = resolveAccent(getTheme(card.theme.template), card.theme.accent);
  return {
    serial: `${card.id}-v${card.version}`,
    name: card.fullName || "Mevoriq card",
    role: card.headline,
    company: card.company,
    url,
    displayUrl,
    background: accent.value,
    foreground: accent.onAccent,
  };
}

export const hexToRgb = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};
