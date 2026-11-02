const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "3 hours ago", "yesterday", or a date for anything older than a week. */
export function relativeTime(iso: string, now = Date.now()): string {
  const diff = (new Date(iso).getTime() - now) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 7 * 86_400) return rtf.format(Math.round(diff / 86_400), "day");
  return formatDate(iso);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

/** Readable grouping for E.164 numbers, e.g. "+94 77 123 4567", "+44 7700 900123", "+1 415 555 0132". Display only. */
const PHONE_GROUPS: Record<string, number[]> = { "1": [3, 3, 4], "44": [4, 6], "91": [5, 5], "94": [2, 3, 4], "61": [3, 3, 3], "65": [4, 4], "971": [2, 3, 4] };

export function formatPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  if (!e164.startsWith("+") || digits.length < 8) return e164;
  const code = ["971", "94", "91", "65", "61", "44", "1"].find((c) => digits.startsWith(c));
  if (!code) return `+${digits.slice(0, digits.length - 9)} ${digits.slice(-9).replace(/(\d{3})(?=\d)/g, "$1 ")}`;
  const rest = digits.slice(code.length);
  const groups = PHONE_GROUPS[code];
  if (groups.reduce((a, b) => a + b, 0) !== rest.length) return `+${code} ${rest.replace(/(\d{3})(?=\d)/g, "$1 ")}`;
  let i = 0;
  return `+${code} ${groups.map((n) => rest.slice(i, (i += n))).join(" ")}`;
}
