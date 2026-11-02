"use client";

import { useEffect } from "react";

/** Registers the service worker in production builds (in development it would fight hot reload). */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
  }, []);
  return null;
}

/** Asks the service worker to keep these public pages (e.g. your card and Meeting Mode) available offline. */
export function keepOffline(paths: string[]) {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.ready.then((reg) => reg.active?.postMessage({ type: "cache-pages", paths })).catch(() => undefined);
}
