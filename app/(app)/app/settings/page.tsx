import type { Metadata } from "next";
import { Suspense } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/app-shell";
import { PageLoading } from "@/components/site/page-loading";
import { requireUser } from "@/lib/auth/session";
import { mediaUrl } from "@/lib/cards/types";
import { DeleteAccountForm, ProfileForm } from "./settings-forms";

export const metadata: Metadata = { title: "Settings" };

function Row({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t py-10 lg:grid-cols-[280px_1fr] lg:gap-12">
      <div>
        <h2 className="font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

async function Settings() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="Settings" />
      <Row title="Profile" text="Your name and photo. New cards start with this photo.">
        <ProfileForm displayName={user.displayName} email={user.email} avatarUrl={mediaUrl(user.avatarMediaId)} />
      </Row>
      <Row title="Your data" text="Everything Mevoriq stores about you: profile, cards, contacts and team memberships.">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><a href="/api/v1/exports/account"><Download /> Download my data (JSON)</a></Button>
          <Button asChild variant="ghost"><a href="/api/v1/exports/leads"><Download /> Contacts (CSV)</a></Button>
        </div>
      </Row>
      <Row title="Delete account" text="Removes your account, cards, received contacts and photos. Links and QR codes stop working.">
        <DeleteAccountForm email={user.email} />
      </Row>
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Settings />
    </Suspense>
  );
}
