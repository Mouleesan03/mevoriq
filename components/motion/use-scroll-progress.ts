"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * 0 → 1 progress of an element through the viewport.
 * mode "exit": 0 when its top is at the viewport top, 1 when it has scrolled one viewport height past.
 * mode "through": 0 when its top reaches the viewport top, 1 when its bottom reaches the viewport bottom (for pinned sections).
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, mode: "exit" | "through" = "exit", enabled = true) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const value = mode === "exit" ? -r.top / vh : -r.top / Math.max(1, r.height - vh);
      setP(Math.min(1, Math.max(0, value)));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, mode, enabled]);
  return p;
}
