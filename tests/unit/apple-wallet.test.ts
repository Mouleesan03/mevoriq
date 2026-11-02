import { describe, expect, it, vi } from "vitest";
import forge from "node-forge";

vi.mock("server-only", () => ({}));

/** Self-signed stand-ins for Apple's certificates: proves the pass is built and signed, not that Apple accepts it. */
function selfSigned(cn: string) {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = "01";
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date(Date.now() + 86_400_000);
  cert.setSubject([{ name: "commonName", value: cn }]);
  cert.setIssuer([{ name: "commonName", value: cn }]);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  const b64 = (s: string) => Buffer.from(s).toString("base64");
  return { cert: b64(forge.pki.certificateToPem(cert)), key: b64(forge.pki.privateKeyToPem(keys.privateKey)) };
}

describe("Apple Wallet", () => {
  it("builds a signed .pkpass with the card QR", async () => {
    const signer = selfSigned("Pass Type ID: pass.test");
    const wwdr = selfSigned("WWDR");
    Object.assign(process.env, { APPLE_PASS_TYPE_ID: "pass.test", APPLE_TEAM_ID: "TEAM123", APPLE_PASS_CERT: signer.cert, APPLE_PASS_KEY: signer.key, APPLE_WWDR_CERT: wwdr.cert });
    const { applePass, appleWalletConfigured } = await import("@/lib/wallet/apple");
    expect(appleWalletConfigured()).toBe(true);
    const buf = await applePass({ serial: "abc-v3", name: "Kavin Raj", role: "Founder", company: "Infonits", url: "https://mevoriq.com/u/kavin", displayUrl: "mevoriq.com/u/kavin", background: "#2448E8", foreground: "#FFFFFF" });
    const zip = buf.toString("latin1");
    expect(buf.subarray(0, 2).toString()).toBe("PK");
    for (const name of ["pass.json", "manifest.json", "signature", "icon.png", "logo.png"]) expect(zip).toContain(name);
  }, 20_000);
});
