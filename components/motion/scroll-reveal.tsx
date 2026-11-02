"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** True when the visitor hasn't asked for reduced motion. */
export function useMotionOk() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setOk(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return ok;
}

/**
 * Watches every [data-reveal] element on the page and adds `is-in` when it scrolls into view,
 * so sections arrive one after another from top to bottom. Also draws the reading-progress bar.
 * With reduced motion the page is never marked motion-ready, so everything is simply visible.
 */
export function ScrollReveal() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const motionOk = useMotionOk();

  useEffect(() => {
    if (!motionOk) {
      document.documentElement.classList.remove("motion-ready");
      return;
    }
    document.documentElement.classList.add("motion-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    const observe = () => document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    observe();
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname, motionOk]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]">
      <div className="h-full origin-left bg-blue transition-transform duration-150 ease-out" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
