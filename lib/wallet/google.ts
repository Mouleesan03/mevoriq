import "server-only";
import { createSign } from "node:crypto";
import { appUrl } from "@/lib/env";
import type { PassContent } from "@/lib/wallet/content";

/**
 * Google Wallet: a signed "Save to Google Wallet" link carrying a Generic pass (class + object inline),
 * so nothing has to be created in the Google Wallet console ahead of time.
 * Env: GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL, GOOGLE_WALLET_PRIVATE_KEY (PEM, \n escaped is fine).
 */
export function googleWalletConfigured() {
  return Boolean(process.env.GOOGLE_WALLET_ISSUER_ID && process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_WALLET_PRIVATE_KEY);
}

const b64url = (v: string | Buffer) => Buffer.from(v).toString("base64url");
const text = (value: string) => ({ defaultValue: { language: "en", value } });

export function googleWalletPayload(c: PassContent, issuerId: string) {
  const classId = `${issuerId}.mevoriq_business_card`;
  return {
    genericClasses: [{ id: classId }],
    genericObjects: [
      {
        id: `${issuerId}.${c.serial.replace(/[^\w.-]/g, "_")}`,
        classId,
        state: "ACTIVE",
        cardTitle: text(c.company || "Mevoriq"),
        header: text(c.name),
        ...(c.role && { subheader: text(c.role) }),
        hexBackgroundColor: c.background,
        logo: { sourceUri: { uri: `${appUrl()}/brand/pwa-icon-192.png` }, contentDescription: text("Mevoriq") },
        barcode: { type: "QR_CODE", value: c.url, alternateText: c.displayUrl },
        linksModuleData: { uris: [{ uri: c.url, description: "Open card", id: "card" }] },
      },
    ],
  };
}

/** Signs the pass as an RS256 JWT and returns the save link. */
export function googleWalletSaveUrl(c: PassContent, env: Record<string, string | undefined> = process.env): string {
  const issuer = env.GOOGLE_WALLET_ISSUER_ID!;
  const claims = {
    iss: env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    origins: [appUrl()],
    payload: googleWalletPayload(c, issuer),
  };
  const unsigned = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(JSON.stringify(claims))}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(env.GOOGLE_WALLET_PRIVATE_KEY!.replace(/\\n/g, "\n"));
  return `https://pay.google.com/gp/v/save/${unsigned}.${b64url(signature)}`;
}
