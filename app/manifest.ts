import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand/config";

/** Installable app: opens straight into the dashboard, with shortcuts for the things people do on the go. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: brand.name,
    short_name: brand.name,
    description: brand.tagline,
    start_url: "/app?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    categories: ["business", "productivity", "social"],
    icons: [
      { src: "/brand/pwa-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/pwa-icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/pwa-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Share my card", short_name: "Share", url: "/app/cards", icons: [{ src: "/brand/pwa-icon-192.png", sizes: "192x192" }] },
      { name: "Contacts", url: "/app/connections", icons: [{ src: "/brand/pwa-icon-192.png", sizes: "192x192" }] },
      { name: "Start an event", short_name: "Event", url: "/app/events", icons: [{ src: "/brand/pwa-icon-192.png", sizes: "192x192" }] },
    ],
  };
}
