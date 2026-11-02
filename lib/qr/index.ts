import QRCode from "qrcode";

/** QR codes always encode the canonical HTTPS card URL, dark-on-light for scan reliability. */
const options = { errorCorrectionLevel: "M" as const, margin: 2, color: { dark: "#12131A", light: "#FFFFFF" } };

export function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, { ...options, type: "svg" });
}

export function qrPng(url: string, width = 1024): Promise<Buffer> {
  return QRCode.toBuffer(url, { ...options, type: "png", width });
}
