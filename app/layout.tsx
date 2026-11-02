import type { Metadata, Viewport } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { brand } from "@/lib/brand/config";
import { appUrl } from "@/lib/env";
import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: `${brand.name} — Free Digital Business Cards & Professional Profiles`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  appleWebApp: { capable: true, title: brand.name, statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: brand.icons.svg, type: "image/svg+xml" },
      { url: brand.icons.png32, sizes: "32x32", type: "image/png" },
      { url: brand.icons.png16, sizes: "16x16", type: "image/png" },
    ],
    apple: brand.icons.apple,
  },
  openGraph: { siteName: brand.name, type: "website", locale: "en" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#FFFFFF", viewportFit: "cover", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
