"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

/** Shows whether this browser allows the anonymous counting cookie and lets the visitor change it. */
function readPreference(): "on" | "off" | "gpc" {
  if ((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return "gpc";
  return document.cookie.split("; ").includes("mv_optout=1") ? "off" : "on";
}
const noSubscribe = () => () => {};

export function CountingPreference() {
  // The choice lives in this browser (cookie / GPC), so it's read on the client only.
  const state = useSyncExternalStore(noSubscribe, readPreference, () => null);
  if (!state) return null;
  if (state === "gpc") return <p className="rounded-[12px] bg-leaf px-5 py-4 text-mint-ink">Your browser sends Global Privacy Control, so the counting cookie is already off.</p>;
  return (
    <form action="/api/v1/preferences/counting" method="post" className="flex flex-wrap items-center gap-4 rounded-[12px] bg-fill px-5 py-4">
      <input type="hidden" name="off" value={state === "on" ? "1" : "0"} />
      <p className="min-w-0 flex-1 text-ink">Counting cookie in this browser: <strong>{state === "on" ? "On" : "Off"}</strong></p>
      <Button type="submit" variant="outline" size="sm">{state === "on" ? "Turn it off" : "Turn it back on"}</Button>
    </form>
  );
}
