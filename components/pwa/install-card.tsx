"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { keepOffline } from "@/components/pwa/pwa-register";

type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const KEY = "mevoriq_install_dismissed";

/**
 * "Add Mevoriq to your home screen" on phones: the browser's install prompt where available (Android, desktop Chrome),
 * or the Share → Add to Home Screen steps on iPhone. Also keeps the owner's card ready for offline use.
 */
export function InstallCard({ offlinePaths }: { offlinePaths: string[] }) {
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    keepOffline(offlinePaths);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(KEY) === "1";
    } catch {}
    if (standalone || dismissed) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as PromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    const t = isIos ? window.setTimeout(() => (setIos(true), setHidden(false)), 0) : 0;
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.clearTimeout(t);
    };
  }, [offlinePaths]);

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  };

  if (hidden) return null;
  return (
    <section aria-label="Install the app" className="mt-5 flex items-start gap-3 rounded-[14px] border bg-surface px-4 py-3.5 sm:px-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky"><Download className="size-5 text-blue" aria-hidden /></span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Add Mevoriq to your home screen</p>
        {ios ? (
          <p className="mt-0.5 text-[14px] text-body">
            Tap <Share className="inline size-4 align-[-3px]" aria-label="Share" /> in Safari, then “Add to Home Screen”. Your card opens like an app, even offline.
          </p>
        ) : (
          <>
            <p className="mt-0.5 text-[14px] text-body">Open your card in one tap, even without signal.</p>
            <Button size="sm" className="mt-3" onClick={async () => { await prompt?.prompt(); dismiss(); }}>Install app</Button>
          </>
        )}
      </div>
      <button type="button" onClick={dismiss} className="-m-1 flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-fill" aria-label="Not now">
        <X className="size-4" />
      </button>
    </section>
  );
}
