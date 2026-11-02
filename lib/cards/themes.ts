/**
 * Public card templates (docs/product-plan.md §5 "Five initial design themes").
 * Each template is data, not markup: the renderer reads these tokens.
 * Accents are limited to presets that keep text and buttons at WCAG AA on that template.
 */
export const TEMPLATE_KEYS = ["minimal-white", "midnight-executive", "editorial-studio", "aurora-gradient", "modern-corporate"] as const;
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export interface CardTheme {
  key: TemplateKey;
  name: string;
  description: string;
  page: string; // page background (CSS)
  surface: string;
  text: string;
  muted: string;
  border: string;
  heading: "display" | "serif";
  cover: string; // decorative band (CSS), used in thumbnails
  /** The business-card face: background, text and secondary text. */
  face: string;
  faceText: string;
  faceMuted: string;
  faceBorder: string;
  /** Accent presets valid on this template; button text color for each. */
  accents: { value: string; name: string; onAccent: string }[];
}

const lightAccents = [
  { value: "#2448E8", name: "Blue", onAccent: "#FFFFFF" },
  { value: "#12131A", name: "Ink", onAccent: "#FFFFFF" },
  { value: "#0B5C3B", name: "Green", onAccent: "#FFFFFF" },
  { value: "#6C3BEA", name: "Violet", onAccent: "#FFFFFF" },
  { value: "#C0262D", name: "Red", onAccent: "#FFFFFF" },
];

const darkAccents = [
  { value: "#2FD08A", name: "Green", onAccent: "#12131A" },
  { value: "#FFD54A", name: "Yellow", onAccent: "#12131A" },
  { value: "#9DB0FF", name: "Sky", onAccent: "#12131A" },
  { value: "#FF6B57", name: "Coral", onAccent: "#12131A" },
];

export const THEMES: Record<TemplateKey, CardTheme> = {
  "minimal-white": {
    key: "minimal-white",
    name: "Minimal White",
    description: "Clean, quiet and universal.",
    page: "#F2F3F7",
    surface: "#FFFFFF",
    text: "#12131A",
    muted: "#5A5C6A",
    border: "#ECECF1",
    heading: "display",
    cover: "#FFFFFF",
    face: "#FFFFFF",
    faceText: "#12131A",
    faceMuted: "#5A5C6A",
    faceBorder: "#ECECF1",
    accents: lightAccents,
  },
  "midnight-executive": {
    key: "midnight-executive",
    name: "Midnight Executive",
    description: "Deep navy with a confident glow.",
    page: "#0B1022",
    surface: "#141B33",
    text: "#FFFFFF",
    muted: "#C4C6D2",
    border: "#26304F",
    heading: "display",
    cover: "#141B33",
    face: "#141B33",
    faceText: "#FFFFFF",
    faceMuted: "#C4C6D2",
    faceBorder: "rgba(255,255,255,0.08)",
    accents: darkAccents,
  },
  "editorial-studio": {
    key: "editorial-studio",
    name: "Editorial Studio",
    description: "Warm paper tones and serif headlines.",
    page: "#FFF5F7",
    surface: "#FFFFFF",
    text: "#2A1410",
    muted: "#6B4A42",
    border: "#F5D9E0",
    heading: "serif",
    cover: "#FFE3EA",
    face: "#FFE3EA",
    faceText: "#2A1410",
    faceMuted: "#6B4A42",
    faceBorder: "#F5D0DA",
    accents: [
      { value: "#8C3A1F", name: "Terracotta", onAccent: "#FFFFFF" },
      { value: "#2A1410", name: "Ink", onAccent: "#FFFFFF" },
      { value: "#2448E8", name: "Blue", onAccent: "#FFFFFF" },
      { value: "#0B5C3B", name: "Green", onAccent: "#FFFFFF" },
    ],
  },
  "aurora-gradient": {
    key: "aurora-gradient",
    name: "Aurora Gradient",
    description: "Vivid gradient for creators.",
    page: "#F2F3F7",
    surface: "#FFFFFF",
    text: "#12131A",
    muted: "#5A5C6A",
    border: "#ECECF1",
    heading: "display",
    cover: "linear-gradient(140deg, #2448E8 0%, #6C3BEA 100%)",
    face: "linear-gradient(140deg, #2448E8 0%, #6C3BEA 100%)",
    faceText: "#FFFFFF",
    faceMuted: "#DCE3FF",
    faceBorder: "rgba(255,255,255,0.14)",
    accents: lightAccents,
  },
  "modern-corporate": {
    key: "modern-corporate",
    name: "Modern Corporate",
    description: "Structured and brand-forward for teams.",
    page: "#FFFAE6",
    surface: "#FFFFFF",
    text: "#12131A",
    muted: "#5A5C6A",
    border: "#F2E6BF",
    heading: "display",
    cover: "#FFD54A",
    face: "#FFD54A",
    faceText: "#12131A",
    faceMuted: "#3D3F4C",
    faceBorder: "#F0C93A",
    accents: lightAccents,
  },
};

export function getTheme(key: string): CardTheme {
  return THEMES[key as TemplateKey] ?? THEMES["minimal-white"];
}

/** Returns a valid accent for the template, falling back to its first preset. */
export function resolveAccent(theme: CardTheme, accent: string) {
  return theme.accents.find((a) => a.value.toLowerCase() === accent.toLowerCase()) ?? theme.accents[0];
}
