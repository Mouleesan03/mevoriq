import { ImageResponse } from "next/og";

export const alt = "Mevoriq — Your identity. Every connection.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview for the site (link shares on LinkedIn, WhatsApp, Slack, X…). */
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFFFFF", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 620 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 17, background: "#2448E8", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <div style={{ color: "#FFFFFF", fontSize: 34, fontWeight: 800 }}>M</div>
              <div style={{ position: "absolute", top: 8, right: 8, width: 12, height: 12, borderRadius: 999, background: "#FFD54A" }} />
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1.5, color: "#12131A" }}>mevoriq</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3, color: "#12131A" }}>Your identity.</div>
            <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3, color: "#12131A" }}>Every connection.</div>
            <div style={{ marginTop: 24, fontSize: 30, color: "#3D3F4C" }}>Digital business cards, free during early access.</div>
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", flex: 1 }}>
          <div style={{ position: "absolute", top: 150, left: 40, width: 420, height: 240, borderRadius: 30, background: "#FF6B57", transform: "rotate(9deg)" }} />
          <div style={{ position: "absolute", top: 130, left: 20, width: 420, height: 240, borderRadius: 30, background: "#FFD54A", transform: "rotate(-6deg)" }} />
          <div style={{ position: "absolute", top: 110, left: 10, width: 420, height: 240, borderRadius: 30, background: "linear-gradient(140deg, #2448E8 0%, #6C3BEA 100%)", color: "#FFFFFF", padding: 32, display: "flex", flexDirection: "column" }}>
            <div style={{ width: 64, height: 64, borderRadius: 999, background: "#FFD54A", color: "#12131A", fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>EC</div>
            <div style={{ marginTop: "auto", fontSize: 40, fontWeight: 800, letterSpacing: -1.5 }}>Emma Carter</div>
            <div style={{ marginTop: 6, fontSize: 20, opacity: 0.85 }}>Product Designer, Northstar Studio</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
