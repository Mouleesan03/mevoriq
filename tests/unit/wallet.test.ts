import { describe, expect, it, vi } from "vitest";
import { createVerify, generateKeyPairSync } from "node:crypto";

vi.mock("server-only", () => ({}));
const { googleWalletPayload, googleWalletSaveUrl } = await import("@/lib/wallet/google");
const { hexToRgb } = await import("@/lib/wallet/content");

const content = { serial: "abc-v3", name: "Kavin Raj", role: "Founder", company: "Infonits", url: "https://mevoriq.com/u/kavin", displayUrl: "mevoriq.com/u/kavin", background: "#2448E8", foreground: "#FFFFFF" };

describe("Google Wallet", () => {
  it("builds a generic pass with the card QR", () => {
    const p = googleWalletPayload(content, "3388");
    expect(p.genericObjects[0].id).toBe("3388.abc-v3");
    expect(p.genericObjects[0].barcode).toEqual({ type: "QR_CODE", value: content.url, alternateText: content.displayUrl });
    expect(p.genericObjects[0].classId).toBe(p.genericClasses[0].id);
  });
  it("signs a save link that verifies with the service account key", () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const key = privateKey.export({ type: "pkcs8", format: "pem" }).toString().replace(/\n/g, "\\n");
    const url = googleWalletSaveUrl(content, { GOOGLE_WALLET_ISSUER_ID: "3388", GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL: "svc@p.iam.gserviceaccount.com", GOOGLE_WALLET_PRIVATE_KEY: key });
    const [h, b, sig] = url.replace("https://pay.google.com/gp/v/save/", "").split(".");
    expect(createVerify("RSA-SHA256").update(`${h}.${b}`).verify(publicKey, Buffer.from(sig, "base64url"))).toBe(true);
    const claims = JSON.parse(Buffer.from(b, "base64url").toString());
    expect(claims).toMatchObject({ aud: "google", typ: "savetowallet", iss: "svc@p.iam.gserviceaccount.com" });
  });
});

describe("pass colours", () => {
  it("converts hex to Apple's rgb()", () => expect(hexToRgb("#2448E8")).toBe("rgb(36, 72, 232)"));
});
