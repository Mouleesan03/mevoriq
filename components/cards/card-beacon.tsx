"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";

const SlugContext = createContext<string | null>(null);

function send(slug: string, type: "view" | "link_click", source?: string | null) {
  const url = `/api/v1/public/cards/${encodeURIComponent(slug)}/events`;
  const body = JSON.stringify(source ? { type, source } : { type });
  if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
  else fetch(url, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => undefined);
}

/** Counts one view per page load (with its QR source label, if any) and provides the slug for link-click counting. */
export function CardBeacon({ slug, children }: { slug: string; children: ReactNode }) {
  useEffect(() => send(slug, "view", new URLSearchParams(window.location.search).get("s")), [slug]);
  return <SlugContext.Provider value={slug}>{children}</SlugContext.Provider>;
}

export function TrackedLink({ href, external, className, children }: { href: string; external?: boolean; className?: string; children: ReactNode }) {
  const slug = useContext(SlugContext);
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
      onClick={() => slug && send(slug, "link_click")}
    >
      {children}
    </a>
  );
}
