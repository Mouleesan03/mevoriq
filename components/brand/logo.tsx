import Image from "next/image";
import { brand } from "@/lib/brand/config";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark" | "mono";

/** Background the logo sits on: "light" (default) → blue symbol + ink wordmark; "dark" → white symbol + white wordmark. */
function symbolSrc(tone: Tone) {
  return tone === "dark" ? brand.logo.symbol.onDark : tone === "mono" ? brand.logo.symbol.mono : brand.logo.symbol.onLight;
}

/**
 * Symbol + wordmark lockup. The wordmark is live text in the brand font (loaded app-wide),
 * so changing the name or font never needs new artwork; the symbol comes from `public/brand/`.
 */
export function Logo({ height = 30, tone = "light", className, priority }: { height?: number; tone?: Tone; className?: string; priority?: boolean }) {
  return (
    <span className={cn("inline-flex items-center select-none", className)} style={{ gap: Math.round(height * 0.3) }}>
      <Image src={symbolSrc(tone)} width={height} height={height} alt="" priority={priority} unoptimized />
      <span
        className={cn("font-display leading-none font-extrabold", tone === "dark" ? "text-white" : "text-ink")}
        style={{ fontSize: Math.round(height * 0.74), letterSpacing: "-0.03em" }}
      >
        {brand.wordmark}
      </span>
      <span className="sr-only">{brand.name}</span>
    </span>
  );
}

export function LogoSymbol({ size = 30, tone = "light", className }: { size?: number; tone?: Tone; className?: string }) {
  return <Image src={symbolSrc(tone)} width={size} height={size} alt={brand.name} className={cn("select-none", className)} unoptimized />;
}
