import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { appUrl, isSupabaseConfigured } from "@/lib/env";
import { LoginExperience } from "./login-form";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function LoginPage() {
  const logo = (
    <Link href="/" aria-label="Mevoriq home" className="self-start">
      <Logo height={30} priority />
    </Link>
  );
  return (
    <div className="flex min-h-dvh flex-1 flex-wrap gap-4 p-4">
      <Suspense>
        <LoginExperience host={appUrl().replace(/^https?:\/\//, "")} logo={logo} mode={isSupabaseConfigured() ? "supabase" : "demo"} />
      </Suspense>
    </div>
  );
}
