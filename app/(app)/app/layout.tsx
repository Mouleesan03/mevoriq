import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/site/app-shell";
import { PageLoading } from "@/components/site/page-loading";
import { requireUser } from "@/lib/auth/session";
import { isPlatformAdmin } from "@/lib/data/admin";
import { newLeadCount } from "@/lib/data/leads";

export const metadata: Metadata = { robots: { index: false } };

async function Authenticated({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <AppShell user={user} newContacts={await newLeadCount(user.id)} isAdmin={isPlatformAdmin(user)}>
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Authenticated>{children}</Authenticated>
    </Suspense>
  );
}
