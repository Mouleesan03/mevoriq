import "server-only";
import path from "node:path";
import { PKPass } from "passkit-generator";
import sharp from "sharp";
import { hexToRgb, type PassContent } from "@/lib/wallet/content";

/**
 * Apple Wallet: a signed .pkpass (Generic style) with the card's QR.
 * Env (from an Apple Developer account, Pass Type ID certificate):
 *   APPLE_PASS_TYPE_ID, APPLE_TEAM_ID, APPLE_PASS_CERT, APPLE_PASS_KEY, APPLE_WWDR_CERT (PEM, base64-encoded),
 *   APPLE_PASS_KEY_PASSPHRASE (optional).
 */
export function appleWalletConfigured() {
  const e = process.env;
  return Boolean(e.APPLE_PASS_TYPE_ID && e.APPLE_TEAM_ID && e.APPLE_PASS_CERT && e.APPLE_PASS_KEY && e.APPLE_WWDR_CERT);
}

const pem = (b64: string) => Buffer.from(b64, "base64").toString("utf8");
let images: Promise<Record<string, Buffer>> | null = null;

/** Wallet icons from the brand kit, rendered once per process. */
function passImages() {
  images ??= (async () => {
    const icon = path.join(process.cwd(), "public/brand/pwa-icon-512.png");
    const logo = path.join(process.cwd(), "public/brand/mevoriq-symbol-white.svg");
    const png = (file: string, size: number) => sharp(file).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const [i1, i2, i3, l1, l2] = await Promise.all([png(icon, 29), png(icon, 58), png(icon, 87), png(logo, 50), png(logo, 100)]);
    return { "icon.png": i1, "icon@2x.png": i2, "icon@3x.png": i3, "logo.png": l1, "logo@2x.png": l2 };
  })();
  return images;
}

export async function applePass(c: PassContent): Promise<Buffer> {
  const e = process.env;
  const pass = new PKPass(
    await passImages(),
    { wwdr: pem(e.APPLE_WWDR_CERT!), signerCert: pem(e.APPLE_PASS_CERT!), signerKey: pem(e.APPLE_PASS_KEY!), signerKeyPassphrase: e.APPLE_PASS_KEY_PASSPHRASE || undefined },
    {
      formatVersion: 1,
      passTypeIdentifier: e.APPLE_PASS_TYPE_ID!,
      teamIdentifier: e.APPLE_TEAM_ID!,
      organizationName: c.company || "Mevoriq",
      description: `${c.name}'s business card`,
      serialNumber: c.serial,
      backgroundColor: hexToRgb(c.background),
      foregroundColor: hexToRgb(c.foreground),
      labelColor: hexToRgb(c.foreground),
      logoText: c.company || "Mevoriq",
      sharingProhibited: false,
    },
  );
  pass.type = "generic";
  pass.primaryFields.push({ key: "name", label: c.role || "Business card", value: c.name });
  if (c.company) pass.secondaryFields.push({ key: "company", label: "Company", value: c.company });
  pass.backFields.push({ key: "link", label: "Card", value: c.url });
  pass.setBarcodes({ message: c.url, format: "PKBarcodeFormatQR", messageEncoding: "iso-8859-1", altText: c.displayUrl });
  return pass.getAsBuffer();
}
