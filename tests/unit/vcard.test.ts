import { describe, expect, it } from "vitest";
import { buildVCard, escapeText, foldLine, splitName } from "@/lib/vcard";
import type { PublicCard } from "@/lib/cards/types";

const card: PublicCard = {
  slug: "amara-perera",
  fullName: "Amara Perera",
  pronouns: "",
  headline: "Designer, Product",
  company: "Northstar; Studio",
  bio: "Line one\nLine two",
  contacts: { email: "amara@example.com", phone: "+94771234567", whatsapp: "", website: "https://example.com", location: "Colombo" },
  links: [{ kind: "linkedin", label: "LinkedIn", url: "https://linkedin.com/in/amara" }],
  theme: { template: "minimal-white", accent: "#5265E8" },
  avatarUrl: null,
  logoUrl: null,
};

describe("vCard", () => {
  it("escapes special characters", () => {
    expect(escapeText("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne");
  });

  it("splits names with family name last", () => {
    expect(splitName("Ada Lovelace King")).toEqual({ given: "Ada Lovelace", family: "King" });
    expect(splitName("Prince")).toEqual({ given: "Prince", family: "" });
  });

  it("builds a valid 3.0 card with CRLF endings", () => {
    const v = buildVCard(card, "https://mevoriq.test/u/amara-perera");
    expect(v.startsWith("BEGIN:VCARD\r\nVERSION:3.0\r\n")).toBe(true);
    expect(v.endsWith("END:VCARD\r\n")).toBe(true);
    expect(v).not.toMatch(/[^\r]\n/);
    expect(v).toContain("N:Perera;Amara;;;");
    expect(v).toContain("ORG:Northstar\\; Studio");
    expect(v).toContain("TITLE:Designer\\, Product");
    expect(v).toContain("NOTE:Line one\\nLine two");
    expect(v).toContain("TEL;TYPE=CELL,VOICE:+94771234567");
    expect(v).toContain("item1.URL:https://linkedin.com/in/amara");
  });

  it("folds long lines at 75 octets without splitting multi-byte characters", () => {
    const tamil = "NOTE:" + "வணக்கம் ".repeat(20);
    const folded = foldLine(tamil);
    const enc = new TextEncoder();
    for (const line of folded.split("\r\n")) expect(enc.encode(line).length).toBeLessThanOrEqual(75);
    expect(folded.split("\r\n").map((l, i) => (i === 0 ? l : l.slice(1))).join("")).toBe(tamil);
  });
});
