import { cn } from "@/lib/utils";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

export function Avatar({ name, src, size = 36, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" style={style} className={cn("shrink-0 rounded-full object-cover", className)} />
  ) : (
    <span style={style} className={cn("flex shrink-0 items-center justify-center rounded-full bg-navy font-semibold text-white", className)} aria-hidden>
      {initialsOf(name)}
    </span>
  );
}
