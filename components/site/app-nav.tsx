"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, CreditCard, Home, Inbox, Settings, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/app", label: "Home", icon: Home, exact: true },
  { href: "/app/cards", label: "Cards", icon: CreditCard },
  { href: "/app/connections", label: "Contacts", icon: Inbox },
  { href: "/app/events", label: "Events", icon: CalendarDays },
  { href: "/app/analytics", label: "Insights", icon: BarChart3 },
  { href: "/app/team", label: "Team", icon: Users },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop (lg and up): text tabs in the top bar. */
export function TopNav({ newContacts, isAdmin }: { newContacts: number; isAdmin: boolean }) {
  const pathname = usePathname();
  const items = isAdmin ? [...NAV, { href: "/admin", label: "Admin", icon: Shield }] : NAV;
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
      {items.map((item) => {
        const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-md px-3 py-2 text-[14px] transition-colors",
              active ? "bg-sky font-semibold text-blue-deep" : "font-medium text-body hover:bg-fill hover:text-ink",
            )}
          >
            {item.label}
            {item.href === "/app/connections" && newContacts > 0 && (
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-yellow px-1.5 text-[11px] font-bold text-ink">
                {newContacts}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile: thumb-reachable bottom tab bar (five most used areas; Team and Settings live in the account menu). */
export function BottomNav({ newContacts }: { newContacts: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-3 bottom-3 z-40 rounded-[16px] bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_0_0_1px_#ECECF1,0_18px_40px_-16px_rgba(18,19,26,0.35)] backdrop-blur-xl sm:mx-auto sm:max-w-lg lg:hidden">
      <ul className="grid grid-cols-5">
        {NAV.filter((n) => n.href !== "/app/team" && n.href !== "/app/settings").map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("relative flex flex-col items-center gap-1 py-2.5 text-[11px]", active ? "font-semibold text-blue" : "text-muted-foreground")}
              >
                <item.icon className="size-5" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                {item.label}
                {item.href === "/app/connections" && newContacts > 0 && (
                  <span className="absolute top-1.5 left-1/2 ml-2 size-2 rounded-full bg-coral" aria-label={`${newContacts} new`} />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
