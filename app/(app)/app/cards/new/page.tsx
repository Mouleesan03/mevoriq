import type { Metadata } from "next";
import { Suspense } from "react";
import { CardEditor } from "@/components/card-editor/card-editor";
import { PageLoading } from "@/components/site/page-loading";
import { requireUser } from "@/lib/auth/session";
import { emptyCardContent, mediaUrl } from "@/lib/cards/types";
import { appUrl } from "@/lib/env";

export const metadata: Metadata = { title: "New card" };

async function NewCard() {
  const user = await requireUser();
  const base = emptyCardContent(user.displayName);
  return (
    <CardEditor
      mode="wizard"
      initial={{ ...base, label: "New card", contacts: { ...base.contacts, email: user.email } }}
      initialSlug=""
      publicOrigin={appUrl()}
      avatarUrl={mediaUrl(user.avatarMediaId)}
    />
  );
}

export default function NewCardPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NewCard />
    </Suspense>
  );
}
