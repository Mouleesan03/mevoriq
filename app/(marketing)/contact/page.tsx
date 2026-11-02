import type { Metadata } from "next";
import Link from "next/link";
import { Flag, LifeBuoy, ShieldCheck } from "lucide-react";
import { PageHero, reveal } from "@/components/marketing/sections";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact", description: "Questions, account help, team set-up or privacy requests — get in touch with the Mevoriq team." };

const tiles = [
  { icon: LifeBuoy, t: "Account help", d: "Choose “Help with my account” and tell us the email you sign in with." },
  { icon: ShieldCheck, t: "Privacy requests", d: "You can download or delete your data yourself in Settings. For anything else, choose “Privacy”." },
  { icon: Flag, t: "Report a card", d: "Use “Report this card” at the bottom of any public card. Reports go straight to our moderation team." },
];

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="We’d love to hear from you" text="Questions, feedback, team set-up or privacy requests. Send us a message and we’ll reply by email." />
      <section className="container-page grid gap-8 pb-16 lg:grid-cols-[1.3fr_1fr]">
        <div {...reveal(0, "left")}>
          <ContactForm />
        </div>
        <div className="space-y-4">
          {tiles.map((t, i) => (
            <div key={t.t} {...reveal(i + 1, "right")} className="rounded-[14px] bg-fill p-6 sm:rounded-[16px] sm:p-7">
              <span className="grid size-11 place-items-center rounded-full bg-white"><t.icon className="size-5 text-blue" aria-hidden /></span>
              <h2 className="mt-5 text-[20px] font-bold tracking-[-0.02em]">{t.t}</h2>
              <p className="mt-1.5 leading-normal text-body">{t.d}</p>
            </div>
          ))}
          <p {...reveal(4)} className="px-2 text-[15px] text-muted-foreground">
            Looking for answers first? Read the <Link href="/#faq" className="font-semibold text-blue hover:underline">FAQ</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
