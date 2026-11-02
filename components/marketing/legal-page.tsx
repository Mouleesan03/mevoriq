import type { ReactNode } from "react";
import { reveal } from "@/components/marketing/sections";

/** Long-form legal layout with a sticky table of contents. */
export function LegalPage({ title, updated, intro, sections }: { title: string; updated: string; intro: ReactNode; sections: { id: string; title: string; body: ReactNode }[] }) {
  return (
    <article className="container-page pt-10 pb-16 sm:pt-16 lg:pt-20">
      <header className="max-w-[760px]">
        <p {...reveal(0)} className="inline-flex rounded-full bg-cream px-4 py-2 text-sm font-semibold">Last updated {updated}</p>
        <h1 {...reveal(1)} className="mt-6 text-display">{title}</h1>
        <div {...reveal(2)} className="mt-6 text-lg leading-[1.65] text-body">{intro}</div>
        <p {...reveal(3)} className="mt-6 rounded-[12px] bg-sky px-5 py-4 text-[15px] leading-normal text-blue-deep">
          Draft for early access. This page describes how Mevoriq works today and will be reviewed by legal counsel before public launch.
        </p>
      </header>
      <div className="mt-10 grid gap-12 sm:mt-14 lg:grid-cols-[240px_1fr]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-28 space-y-1 text-[15px]">
            {sections.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} className="block rounded-full px-4 py-2 text-body hover:bg-fill hover:text-ink">{s.title}</a></li>
            ))}
          </ul>
        </nav>
        <div className="max-w-[720px] space-y-12">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} {...reveal(i % 3)} className="scroll-mt-28">
              <h2 className="text-h3">{s.title}</h2>
              <div className="mt-4 space-y-4 text-[16px] leading-[1.7] sm:text-[17px] text-body [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
