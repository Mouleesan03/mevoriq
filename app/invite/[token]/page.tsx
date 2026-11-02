import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { findInvitation } from "@/lib/data/orgs";
import { AcceptInvite } from "./accept-invite";

export const metadata: Metadata = { title: "Join a team", robots: { index: false, follow: false } };

async function Invite({ params }: { params: PageProps<"/invite/[token]">["params"] }) {
  const { token } = await params;
  const [found, user] = await Promise.all([findInvitation(token), getCurrentUser()]);
  if (!found) {
    return (
      <>
        <h1 className="text-3xl font-extrabold tracking-tight">This invitation isn’t valid</h1>
        <p className="mt-3 text-muted-foreground">It may have expired, been cancelled, or already been used. Ask your team admin for a new link.</p>
      </>
    );
  }
  const { invitation, organization } = found;
  return (
    <>
      <p className="text-[13px] text-muted-foreground">Team invitation</p>
      <h1 className="mt-2 text-[40px] leading-[1.02] font-extrabold tracking-[-0.035em]">Join {organization.name} on Mevoriq</h1>
      <p className="mt-4 text-muted-foreground">
        You were invited as <span className="text-foreground">{invitation.role}</span> using <span className="font-mono text-sm text-foreground">{invitation.email}</span>. Your personal cards stay yours.
      </p>
      <div className="mt-8">
        {user ? (
          <AcceptInvite token={token} signedInAs={user.email} />
        ) : (
          <Button asChild size="lg"><Link href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`}>Log in to accept</Link></Button>
        )}
      </div>
    </>
  );
}

export default function InvitePage({ params }: PageProps<"/invite/[token]">) {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-5 py-10">
      <Link href="/" aria-label="Mevoriq home"><Logo height={26} tone="light" className="mb-16" /></Link>
      <Suspense>
        <Invite params={params} />
      </Suspense>
    </main>
  );
}
