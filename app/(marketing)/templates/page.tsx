import type { Metadata } from "next";
import { TemplatePlayground } from "@/components/marketing/template-playground";
import { PageHero, PrimaryCta, StartFreeBand, TemplateGallery, h2Class, reveal } from "@/components/marketing/sections";
import { FRONT_PERSON } from "@/lib/marketing/fan";
import { appUrl } from "@/lib/env";
import { qrSvg } from "@/lib/qr";

export const metadata: Metadata = {
  title: "Templates",
  description: "Five digital business card templates, each with accent colors that stay readable for everyone.",
};

export default async function TemplatesPage() {
  const host = appUrl().replace(/^https?:\/\//, "");
  const qr = await qrSvg(`${appUrl()}/u/${FRONT_PERSON.slug}`);
  return (
    <>
      <PageHero eyebrow="Templates" title="Find a look that feels like you" text="Pick a template, then an accent. Colors that would be hard to read aren’t offered, so every card stays easy on the eyes." />
      <section className="container-page">
        <div {...reveal(0, "scale")}>
          <TemplatePlayground host={host} qrSvg={qr} />
        </div>
      </section>
      <section className="container-page pt-16 pb-6 md:pt-24">
        <h2 {...reveal(0)} className={h2Class}>All templates</h2>
        <TemplateGallery />
        <div {...reveal(1)} className="mt-12">
          <PrimaryCta>Start with a template</PrimaryCta>
        </div>
      </section>
      <StartFreeBand />
    </>
  );
}
