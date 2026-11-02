import { MarketingFooter, MarketingHeader } from "@/components/site/marketing-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <ScrollReveal />
      {/* Quiet layout guides at the content edges (desktop only) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 hidden xl:block">
        <div className="mx-auto h-full max-w-[1200px] border-x border-dashed border-black/[0.07]" />
      </div>
      <MarketingHeader />
      <main className="relative flex-1">{children}</main>
      <MarketingFooter />
    </>
  );
}
