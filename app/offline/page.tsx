import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

/** Shown by the service worker when a page isn't available without a connection. */
export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo height={28} />
      <span className="mt-10 flex size-14 items-center justify-center rounded-2xl bg-fill"><WifiOff className="size-6" aria-hidden /></span>
      <h1 className="mt-6 text-[28px] leading-tight">You’re offline</h1>
      <p className="mt-2 max-w-sm text-body">This page needs a connection. Your card and Meeting Mode still open if you’ve viewed them on this phone before.</p>
      <a href="" className="mt-8 inline-flex h-12 items-center rounded-lg bg-blue px-6 font-semibold text-white">Try again</a>
    </main>
  );
}
