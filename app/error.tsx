"use client";

import Link from "next/link";
import { RotateCw } from "lucide-react";

/** Error boundary for every page below the root layout. */
export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main className="flex min-h-[70dvh] flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative h-28 w-44" aria-hidden>
        <div className="absolute inset-0 rotate-[8deg] rounded-[12px] bg-coral" />
        <div className="absolute inset-0 -rotate-6 rounded-[12px] bg-yellow" />
        <div className="absolute inset-0 grid place-items-center rounded-[12px] bg-ink text-4xl font-extrabold text-white">!</div>
      </div>
      <h1 className="mt-10 text-[28px] leading-tight font-extrabold tracking-[-0.03em] sm:text-[36px]">Something went wrong</h1>
      <p className="mt-3 max-w-md text-body">We couldn’t load this page. Try again, or come back in a moment.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => retry()} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue px-6 font-semibold text-white hover:bg-blue-deep">
          <RotateCw className="size-4" /> Try again
        </button>
        <Link href="/" className="inline-flex h-12 items-center justify-center rounded-lg px-6 font-semibold shadow-[inset_0_0_0_2px_var(--mevoriq-border)]">Go to the homepage</Link>
      </div>
    </main>
  );
}
