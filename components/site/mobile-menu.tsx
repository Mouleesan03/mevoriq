"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Full-screen menu for small screens; closes on navigation and Escape, locks page scroll while open. */
export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  // Rendered into <body>: the header's backdrop-filter would otherwise trap a fixed overlay inside it.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const pathname = usePathname();
  const [seenPath, setSeenPath] = useState(pathname);
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="grid size-11 place-items-center rounded-full text-ink hover:bg-fill lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      {mounted && createPortal(
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-white px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)] transition-[opacity,transform] duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none -translate-y-3 opacity-0",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground">Menu</span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="grid size-11 place-items-center rounded-full bg-fill">
            <X className="size-5" />
          </button>
        </div>
        <nav aria-label="Mobile" className="mt-8 flex-1">
          <ul className="divide-y divide-border">
            {links.map((l, i) => (
              <li key={l.href} style={{ transitionDelay: open ? `${60 + i * 40}ms` : "0ms" }} className={cn("transition-[opacity,transform] duration-300", open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")}>
                <Link href={l.href} onClick={() => setOpen(false)} className="flex items-center justify-between py-4.5 text-[26px] font-extrabold tracking-[-0.03em]">
                  {l.label}
                  <ArrowRight className="size-5 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="grid gap-3">
          <Link href="/login" onClick={() => setOpen(false)} className="flex h-13 items-center justify-center rounded-lg bg-blue text-[17px] font-semibold text-white">Create your free card</Link>
          <Link href="/login" onClick={() => setOpen(false)} className="flex h-13 items-center justify-center rounded-lg text-[17px] font-semibold shadow-[inset_0_0_0_2px_var(--mevoriq-border)]">Log in</Link>
        </div>
      </div>,
      document.body,
      )}
    </>
  );
}
