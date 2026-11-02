import { ImageResponse } from "next/og";
import { findPublicCard } from "@/lib/cards/public";
import { getTheme } from "@/lib/cards/themes";

export const alt = "Digital business card on Mevoriq";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const initials = (n: string) => n.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";

/** Link preview for a published card: the card face, as people will see it. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await findPublicCard(slug);
  const card = found?.card;
  const theme = getTheme(card?.theme.template ?? "aurora-gradient");
  const name = card?.fullName ?? "Mevoriq";
  const role = card ? [card.headline, card.company].filter(Boolean).join(" · ") : "Digital business cards";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#F2F3F7", fontFamily: "sans-serif" }}>
        <div style={{ position: "relative", display: "flex", width: 840, height: 480 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 44, background: "#FFD54A", transform: "rotate(-4deg)" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 44, background: theme.face, color: theme.faceText, padding: 56, display: "flex", flexDirection: "column", border: `2px solid ${theme.faceBorder}` }}>
            <div style={{ width: 110, height: 110, borderRadius: 999, background: card?.theme.accent ?? "#2448E8", color: "#FFFFFF", fontSize: 40, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{initials(name)}</div>
            <div style={{ marginTop: "auto", fontSize: 68, fontWeight: 800, letterSpacing: -2.5 }}>{name}</div>
            <div style={{ marginTop: 10, fontSize: 30, color: theme.faceMuted }}>{role}</div>
            <div style={{ marginTop: 22, fontSize: 22, color: theme.faceMuted }}>{`mevoriq · /u/${slug}`}</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
