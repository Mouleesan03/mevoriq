import Link from "next/link";
import { LogOut, Settings, Shield, Users } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/site/avatar";
import { BottomNav, TopNav } from "@/components/site/app-nav";
import { signOutAction } from "@/lib/actions/auth";
import { mediaUrl, type Profile } from "@/lib/cards/types";

export function AppShell({ user, newContacts, isAdmin, children }: { user: Profile; newContacts: number; isAdmin: boolean; children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/app" aria-label="Mevoriq home" className="shrink-0">
            <Logo height={28} />
          </Link>
          <TopNav newContacts={newContacts} isAdmin={isAdmin} />
          <details className="group relative ml-auto">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full p-0.5 pr-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
              <Avatar name={user.displayName} src={mediaUrl(user.avatarMediaId)} size={40} />
              <span className="sr-only">Account menu</span>
            </summary>
            <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-[14px] bg-surface shadow-[0_0_0_1px_#ECECF1,0_24px_48px_-16px_rgba(18,19,26,0.3)]">
              <div className="border-b px-4 py-3">
                <p className="truncate text-sm font-semibold">{user.displayName}</p>
                <p className="truncate text-[13px] text-muted-foreground">{user.email}</p>
              </div>
              <div className="p-1.5 text-sm">
                <Link href="/app/team" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted lg:hidden"><Users className="size-4" /> Team</Link>
                <Link href="/app/settings" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted lg:hidden"><Settings className="size-4" /> Settings</Link>
                {isAdmin && <Link href="/admin" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted lg:hidden"><Shield className="size-4" /> Admin</Link>}
                <form action={signOutAction}>
                  <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-muted"><LogOut className="size-4" /> Log out</button>
                </form>
              </div>
            </div>
          </details>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-7 pb-32 [--bottom-nav:88px] sm:px-6 md:pt-12 lg:pb-16 lg:[--bottom-nav:0px]">{children}</main>
      <BottomNav newContacts={newContacts} />
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: React.ReactNode; actions?: React.ReactNode; eyebrow?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end gap-x-6 gap-y-4 sm:mb-10">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 text-[13px] text-muted-foreground">{eyebrow}</div>}
        <h1 className="text-[28px] leading-[1.1] tracking-[-0.03em] sm:text-[36px] lg:text-[42px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[15px] leading-normal text-body sm:mt-3 sm:text-[17px]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-[16px] bg-fill px-6 py-12 text-center sm:rounded-[12px] sm:py-16">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
