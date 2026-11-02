/**
 * Single source of brand identity for the app.
 *
 * The logo is expected to change. To swap it, replace the files in `public/brand/`
 * (keeping the same names) or point the paths below at new files, and change
 * `wordmark` if the name treatment changes. No component outside `components/brand/`
 * may reference logo files directly.
 */
export const brand = {
  name: "Mevoriq",
  /** Lowercase wordmark set in Plus Jakarta Sans ExtraBold next to the symbol. */
  wordmark: "mevoriq",
  tagline: "Your identity. Every connection.",
  description:
    "Create a modern digital business card, share one permanent link or QR code, and make introductions effortless.",
  themeColor: "#2448E8",
  logo: {
    symbol: {
      onLight: "/brand/mevoriq-symbol.svg",
      onDark: "/brand/mevoriq-symbol-white.svg",
      mono: "/brand/mevoriq-symbol-monochrome.svg",
    },
  },
  icons: {
    svg: "/brand/mevoriq-favicon.svg",
    png16: "/brand/favicon-16.png",
    png32: "/brand/favicon-32.png",
    apple: "/brand/apple-touch-icon-180.png",
    social: "/brand/social-avatar-1024.png",
  },
} as const;
