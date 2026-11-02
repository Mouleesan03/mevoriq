import Link from "next/link";
import { ChevronRight, Heart } from "lucide-react";
import { currentYear } from "@/lib/year";
import { Logo } from "@/components/brand/logo";
import { MobileMenu } from "@/components/site/mobile-menu";

const nav = [
  { href: "/features", label: "Features" },
  { href: "/templates", label: "Templates" },
  { href: "/teams", label: "Teams" },
  { href: "/pricing", label: "Pricing" },
];

/** Full-width translucent bar with a hairline; links from 1024px, a menu below. */
export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
      <nav aria-label="Main" className="container-page flex h-16 items-center gap-3 sm:gap-8">
        <Link href="/" aria-label="Mevoriq home" className="shrink-0">
          <Logo height={26} priority />
        </Link>
        <div className="hidden gap-1 text-[15px] font-medium lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-md px-3 py-2 text-body transition-colors hover:text-ink">{n.label}</Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link href="/login" className="hidden rounded-md px-3 py-2 text-[15px] font-medium whitespace-nowrap text-ink hover:text-blue md:block">Log in</Link>
          <Link href="/login" className="group inline-flex items-center gap-1 rounded-lg bg-blue px-3.5 py-2 text-[14px] font-semibold whitespace-nowrap text-white transition-colors hover:bg-blue-deep sm:px-4 sm:text-[15px]">
            Get started
            <ChevronRight className="-mr-0.5 size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <MobileMenu links={[...nav, { href: "/about", label: "About" }, { href: "/contact", label: "Contact" }]} />
        </div>
      </nav>
    </header>
  );
}

const columns = [
  { title: "Product", links: [["Features", "/features"], ["Templates", "/templates"], ["Teams", "/teams"], ["Pricing", "/pricing"]] },
  { title: "Company", links: [["About", "/about"], ["Contact", "/contact"], ["FAQ", "/#faq"], ["Register a company", "/login?next=%2Fonboarding%3Ffor%3Dbusiness"]] },
  { title: "Legal", links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["Cookies", "/cookies"], ["Help & support", "/contact"]] },
];

export async function MarketingFooter() {
  const year = await currentYear();
  return (
    <footer className="relative mt-12 bg-ink text-white sm:mt-16">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:py-16 md:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div className="col-span-2 md:col-span-1">
          <Logo height={28} tone="dark" />
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-[#B8BACB]">Digital business cards for people and teams. Share who you are, and remember who you meet.</p>
          <Link href="/login" className="group mt-6 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-[14px] font-semibold text-ink hover:bg-white/90">
            Create your free card <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-[13px] font-semibold tracking-wide text-white uppercase">{c.title}</p>
            <ul className="mt-4 space-y-3 text-[15px]">
              {c.links.map(([label, href]) => (
                <li key={label}><Link href={href} className="text-[#B8BACB] transition-colors hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-[13px] text-[#8E91A4] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2">
            <span>© {year} Mevoriq. All rights reserved.</span>
            <span aria-hidden className="hidden sm:inline">·</span>
            <span>
              A product of{" "}
              <a href="https://infonits.io" target="_blank" rel="noopener" className="font-semibold text-white hover:underline">Infonits</a>
            </span>
            <span aria-hidden className="hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1">
              Made with <Heart className="size-3.5 fill-coral text-coral" aria-label="love" /> for every connection
            </span>
          </p>
          <p className="hidden sm:block">Your identity. Every connection.</p>
        </div>
      </div>
    </footer>
  );
}
