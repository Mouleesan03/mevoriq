import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center px-6 text-center">
      <Link href="/" aria-label="Mevoriq home"><Logo height={30} /></Link>
      <div className="relative mt-14 h-40 w-64" aria-hidden>
        <div className="absolute inset-0 rotate-[8deg] rounded-[14px] bg-coral" />
        <div className="absolute inset-0 -rotate-6 rounded-[14px] bg-yellow" />
        <div className="absolute inset-0 grid place-items-center rounded-[14px] bg-blue text-6xl font-extrabold tracking-tight text-white">404</div>
      </div>
      <h1 className="mt-12 text-[clamp(30px,4vw,44px)] leading-tight tracking-[-0.035em]">This page isn’t here</h1>
      <p className="mt-3 max-w-md text-lg text-body">The link may be mistyped, or the page has moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex min-h-12 items-center rounded-lg bg-blue px-7 font-semibold text-white hover:bg-blue-deep">Go to the homepage</Link>
        <Link href="/contact" className="inline-flex min-h-12 items-center rounded-lg px-6 font-semibold text-ink shadow-[inset_0_0_0_2px_var(--mevoriq-border)] hover:shadow-[inset_0_0_0_2px_var(--mevoriq-navy)]">Contact us</Link>
      </div>
    </main>
  );
}
