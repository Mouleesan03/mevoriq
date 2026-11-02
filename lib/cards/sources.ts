/**
 * QR source labels: one QR per place you put your card. The QR adds `?s=<key>` to the card link,
 * and views are counted per source per day. Nothing about the visitor is stored.
 */
export const QR_SOURCES = [
  { key: "print", label: "Print", hint: "Business cards, brochures, flyers" },
  { key: "badge", label: "Event badge", hint: "Name badges and lanyards" },
  { key: "signature", label: "Email signature", hint: "The link under your emails" },
  { key: "slides", label: "Slides and screens", hint: "Talks, webinars, booth screens" },
  { key: "social", label: "Social bio", hint: "LinkedIn, Instagram, X" },
] as const;

export type QrSource = (typeof QR_SOURCES)[number]["key"];

export const isQrSource = (v: unknown): v is QrSource => QR_SOURCES.some((s) => s.key === v);

export const sourceLabel = (key: QrSource) => QR_SOURCES.find((s) => s.key === key)!.label;

/** Card link tagged with a source, e.g. https://mevoriq.com/u/emma?s=print */
export const withSource = (url: string, source: QrSource | null) => (source ? `${url}?s=${source}` : url);
