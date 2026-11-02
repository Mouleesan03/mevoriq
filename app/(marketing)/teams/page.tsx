import type { Metadata } from "next";
import { Building2, KeyRound, Link2, Lock, LogOut, Palette, ShieldCheck, Users } from "lucide-react";
import { PageHero, PrimaryCta, SecondaryCta, StartFreeBand, h2Class, reveal } from "@/components/marketing/sections";
import { THEMES } from "@/lib/cards/themes";

export const metadata: Metadata = {
  title: "Teams",
  description: "Give everyone at your company a consistent, up-to-date digital business card. Brand presets, locked fields and safe offboarding.",
};

const steps = [
  { t: "Create your team", d: "Name it, add your logo and choose the company template and colors." },
  { t: "Invite people", d: "Send each person a private invitation link. Only the invited email can accept it." },
  { t: "Create company cards", d: "Admins and managers prepare a card for each member; members finish and publish it." },
  { t: "Stay consistent", d: "Locked fields follow your brand. Change the brand once and every company card updates." },
];

const roles = [
  { r: "Owner", d: "Everything, including the team itself." },
  { r: "Admin", d: "Invite people, change roles, set the brand, remove access." },
  { r: "Manager", d: "Create company cards for members." },
  { r: "Member", d: "Edit their own company card within the locked brand." },
];

const corp = THEMES["modern-corporate"];

export default function TeamsPage() {
  return (
    <>
      <PageHero eyebrow="Mevoriq Teams" title="One company brand, every employee" text="Set your design once, lock what must stay consistent, and let people keep their cards up to date. Free during early access.">
        <PrimaryCta href="/login?next=%2Fonboarding%3Ffor%3Dbusiness">Register your company</PrimaryCta>
        <SecondaryCta href="/pricing">Pricing</SecondaryCta>
      </PageHero>

      {/* a row of identical company cards, one highlighted */}
      <section className="container-page">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {["Daniel Brooks", "Grace Lee", "Tom Harris", "Chloe Evans", "Noah Price"].map((n, i) => (
            <div
              key={n}
              {...reveal(i, "tilt")}
              className="flex aspect-[1.75] flex-col rounded-[12px] p-4"
              style={{ background: i === 2 ? "#2448E8" : corp.face, color: i === 2 ? "#FFFFFF" : corp.faceText }}
            >
              <span className="flex items-center justify-between">
                <span className="size-7 rounded-full" style={{ background: i === 2 ? "#FFD54A" : "#12131A" }} />
                <span className="text-[11px] font-semibold opacity-80">Helix Systems</span>
              </span>
              <span className="mt-auto text-[15px] font-extrabold tracking-tight">{n}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pt-16 md:pt-24">
        <h2 {...reveal(0)} className={`${h2Class} max-w-[760px]`}>Set up in four steps</h2>
        <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.t} {...reveal(i)} className="rounded-[14px] bg-fill p-6 sm:rounded-[16px] sm:p-7">
              <span className="inline-grid size-11 place-items-center rounded-full bg-blue text-lg font-extrabold text-white">{i + 1}</span>
              <h3 className="mt-6 text-[20px] font-bold tracking-[-0.02em]">{s.t}</h3>
              <p className="mt-2 leading-normal text-body">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-page pt-16 md:pt-24">
        <div {...reveal(0, "scale")} className="mx-auto grid max-w-[1200px] gap-4 rounded-[12px] sm:rounded-[14px] bg-blue p-[clamp(28px,5vw,64px)] text-white md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Palette, t: "Brand presets", d: "Template, accent, company name, website and logo, set once." },
            { icon: Lock, t: "Locked fields", d: "Choose which details members can’t change on company cards." },
            { icon: Link2, t: "Invite by link", d: "Private, single-use invitations that expire after 7 days." },
            { icon: LogOut, t: "Safe offboarding", d: "Removing someone unpublishes their company cards. Personal cards stay theirs." },
            { icon: ShieldCheck, t: "Private contacts", d: "Contacts collected by company cards stay private unless your admins turn on shared access." },
            { icon: Building2, t: "Activity log", d: "See who invited, joined, changed roles or updated the brand." },
          ].map((f, i) => (
            <div key={f.t} {...reveal(i + 1)} className="rounded-[14px] bg-white/10 p-6 sm:rounded-[16px] sm:p-7">
              <f.icon className="size-6 text-yellow" aria-hidden />
              <h3 className="mt-5 text-[20px] font-bold tracking-[-0.02em]">{f.t}</h3>
              <p className="mt-2 leading-normal text-[#DCE3FF]">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pt-16 pb-6 md:pt-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div {...reveal(0)}>
            <h2 className={h2Class}>Roles that match how teams work</h2>
            <p className="mt-4 max-w-sm text-lg leading-normal text-body">Give each person exactly the access they need.</p>
          </div>
          <ul className="divide-y overflow-hidden rounded-[16px] bg-fill">
            {roles.map((r, i) => (
              <li key={r.r} {...reveal(i)} className="flex items-start gap-4 px-6 py-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white">
                  {i === 0 ? <KeyRound className="size-4 text-blue" /> : <Users className="size-4 text-blue" />}
                </span>
                <span>
                  <span className="block text-[17px] font-semibold">{r.r}</span>
                  <span className="block text-body">{r.d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StartFreeBand />
    </>
  );
}
