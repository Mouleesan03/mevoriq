"use client";

/** Last-resort error page when the root layout itself fails. Renders its own document and styles. */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'Helvetica Neue', Arial, sans-serif", color: "#12131A", background: "#FFFFFF" }}>
        <title>Something went wrong · Mevoriq</title>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
          <div>
            <h1 style={{ fontSize: 32, margin: 0, letterSpacing: "-0.03em" }}>Something went wrong</h1>
            <p style={{ color: "#3D3F4C", marginTop: 12 }}>Mevoriq couldn’t load. Please try again.</p>
            <button
              type="button"
              onClick={() => retry()}
              style={{ marginTop: 24, height: 48, padding: "0 24px", borderRadius: 999, border: 0, background: "#2448E8", color: "#FFFFFF", fontSize: 16, fontWeight: 600, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
