import { describe, expect, it } from "vitest";
import { dueFollowUps, dueLabel } from "@/lib/follow-ups";
import { isQrSource, withSource } from "@/lib/cards/sources";
import { verifiedDomain } from "@/lib/cards/verified";
import { buildSourceCounts } from "@/lib/data/insights";
import { formatPhone } from "@/lib/format";

describe("follow-up reminders", () => {
  const today = "2026-11-02";
  it("lists open contacts due today or earlier, oldest first", () => {
    const leads = [
      { id: "a", followUpAt: "2026-11-02", status: "following_up" as const },
      { id: "b", followUpAt: "2026-10-30", status: "new" as const },
      { id: "c", followUpAt: "2026-11-05", status: "new" as const },
      { id: "d", followUpAt: "2026-10-01", status: "done" as const },
      { id: "e", followUpAt: null, status: "new" as const },
    ];
    expect(dueFollowUps(leads, today).map((l) => l.id)).toEqual(["b", "a"]);
  });
  it("labels how late a follow-up is", () => {
    expect(dueLabel("2026-11-02", today)).toBe("Today");
    expect(dueLabel("2026-11-01", today)).toBe("Yesterday");
    expect(dueLabel("2026-10-30", today)).toBe("3 days overdue");
  });
});

describe("QR sources", () => {
  it("accepts only known labels", () => {
    expect(isQrSource("print")).toBe(true);
    expect(isQrSource("billboard")).toBe(false);
    expect(withSource("https://mevoriq.com/u/emma", "badge")).toBe("https://mevoriq.com/u/emma?s=badge");
  });
  it("totals views per source in range, busiest first", () => {
    const rows = [
      { cardId: "c1", date: "2026-11-02", source: "print" as const, count: 2 },
      { cardId: "c1", date: "2026-11-01", source: "badge" as const, count: 5 },
      { cardId: "c1", date: "2026-09-01", source: "print" as const, count: 50 },
      { cardId: "other", date: "2026-11-02", source: "slides" as const, count: 9 },
    ];
    expect(buildSourceCounts(["c1"], rows, 7, new Date("2026-11-02T12:00:00Z"))).toEqual([
      { source: "badge", label: "Event badge", views: 5 },
      { source: "print", label: "Print", views: 2 },
    ]);
  });
});

describe("verified badge", () => {
  const contacts = (email: string, website: string) => ({ email, website });
  it("matches the sign-in domain to the card's website or email", () => {
    expect(verifiedDomain("kavin@infonits.io", contacts("", "https://www.infonits.io"))).toBe("infonits.io");
    expect(verifiedDomain("kavin@infonits.io", contacts("", "https://shop.infonits.io/about"))).toBe("infonits.io");
    expect(verifiedDomain("kavin@infonits.io", contacts("hello@infonits.io", ""))).toBe("infonits.io");
  });
  it("never verifies free mail or mismatched domains", () => {
    expect(verifiedDomain("kavin@gmail.com", contacts("kavin@gmail.com", "https://gmail.com"))).toBeNull();
    expect(verifiedDomain("kavin@infonits.io", contacts("", "https://infonits.io.evil.com"))).toBeNull();
    expect(verifiedDomain("kavin@infonits.io", contacts("", "not a url"))).toBeNull();
  });
});


describe("phone display", () => {
  it("groups common country formats", () => {
    expect(formatPhone("+94771234567")).toBe("+94 77 123 4567");
    expect(formatPhone("+447700900123")).toBe("+44 7700 900123");
    expect(formatPhone("+14155550132")).toBe("+1 415 555 0132");
    expect(formatPhone("+919876543210")).toBe("+91 98765 43210");
    expect(formatPhone("+33612345678")).toBe("+33 612 345 678");
  });
});
