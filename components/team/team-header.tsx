import Link from "next/link";
import type { OrgRole, Organization } from "@/lib/data/models";
import { mediaUrl } from "@/lib/cards/types";
import { TeamSwitcher } from "@/components/team/team-forms";
import { cn } from "@/lib/utils";

const ROLE: Record<OrgRole, string> = { owner: "Owner", admin: "Admin", manager: "Manager", member: "Member" };

export function TeamHeader({
  org,
  role,
  orgs,
  current,
}: {
  org: Organization;
  role: OrgRole;
  orgs: { org: Organization; role: OrgRole }[];
  current: "overview" | "members" | "brand";
}) {
  const logo = mediaUrl(org.logoMediaId);
  const tabs = [
    { key: "overview", href: "/app/team", label: "Overview", show: true },
    { key: "members", href: "/app/team/members", label: "Members", show: true },
    { key: "brand", href: "/app/team/brand", label: "Brand", show: role === "owner" || role === "admin" },
  ];
  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-center gap-4">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="size-14 rounded-[14px] border bg-surface object-contain p-1.5" />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-2xl bg-navy text-xl font-bold text-white">{org.name[0]}</span>
        )}
        <div className="min-w-0">
          <p className="text-[13px] text-muted-foreground">Team · you’re {ROLE[role].toLowerCase()}</p>
          <h1 className="text-[clamp(26px,3.4vw,36px)] leading-[1.05] font-extrabold tracking-[-0.03em]">{org.name}</h1>
        </div>
        {orgs.length > 1 && <div className="ml-auto"><TeamSwitcher current={org.id} orgs={orgs.map((o) => ({ id: o.org.id, name: o.org.name }))} /></div>}
      </div>
      <nav aria-label="Team" className="mt-8 flex gap-6 border-b">
        {tabs.filter((t) => t.show).map((t) => (
          <Link
            key={t.key}
            href={t.href}
            aria-current={current === t.key ? "page" : undefined}
            className={cn("-mb-px border-b-2 pb-3 text-[14px]", current === t.key ? "border-navy font-semibold" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export { ROLE };
