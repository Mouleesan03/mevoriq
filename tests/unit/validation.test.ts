import { describe, expect, it } from "vitest";
import { cardContentSchema, phoneSchema, safeUrl, slugSchema, slugify } from "@/lib/validation/card";
import { emptyCardContent } from "@/lib/cards/types";
import { THEMES, TEMPLATE_KEYS } from "@/lib/cards/themes";

describe("slugs", () => {
  it("accepts simple slugs and rejects reserved or malformed ones", () => {
    expect(slugSchema.parse("Amara-Perera")).toBe("amara-perera");
    expect(slugSchema.safeParse("admin").success).toBe(false);
    expect(slugSchema.safeParse("a--b").success).toBe(false);
    expect(slugSchema.safeParse("ab").success).toBe(false);
  });
  it("slugifies names with accents", () => {
    expect(slugify("José Álvarez  Núñez")).toBe("jose-alvarez-nunez");
  });
});

describe("safe URLs", () => {
  it("adds https and blocks unsafe schemes", () => {
    expect(safeUrl.parse("example.com")).toBe("https://example.com");
    expect(safeUrl.safeParse("javascript:alert(1)").success).toBe(false);
    expect(safeUrl.safeParse("data:text/html,hi").success).toBe(false);
  });
});

describe("phones", () => {
  it("normalizes to E.164", () => {
    expect(phoneSchema.parse("+94 77 123-4567")).toBe("+94771234567");
    expect(phoneSchema.safeParse("0771234567").success).toBe(false);
  });
});

describe("card content", () => {
  it("accepts the default content once a name is set", () => {
    expect(cardContentSchema.safeParse(emptyCardContent("Amara Perera")).success).toBe(true);
    expect(cardContentSchema.safeParse(emptyCardContent("")).success).toBe(false);
  });
});

function luminance(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

describe("template accessibility", () => {
  it.each(TEMPLATE_KEYS)("%s keeps text and accents at WCAG AA", (key) => {
    const t = THEMES[key];
    expect(contrast(t.text, t.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.muted, t.surface)).toBeGreaterThanOrEqual(4.5);
    for (const a of t.accents) {
      expect(contrast(a.onAccent, a.value), `${a.name} button`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(a.value, t.surface), `${a.name} on surface`).toBeGreaterThanOrEqual(3);
    }
  });
});
