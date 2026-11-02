/**
 * Verified badge: shown when the card's website or contact email is on the same domain as the email
 * the owner signs in with (proved by the magic link or Google). Free mail providers never qualify.
 */
const FREE_MAIL = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "yahoo.co.in", "ymail.com", "hotmail.com", "hotmail.co.uk", "outlook.com",
  "live.com", "msn.com", "icloud.com", "me.com", "mac.com", "aol.com", "proton.me", "protonmail.com", "gmx.com", "gmx.net", "mail.com",
  "zoho.com", "yandex.com", "rediffmail.com", "example.com", "example.test",
]);

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
};

/** The verified company domain for this card, or null. */
export function verifiedDomain(accountEmail: string, contacts: { email: string; website: string }): string | null {
  const domain = accountEmail.split("@")[1]?.trim().toLowerCase() ?? "";
  if (!domain || !domain.includes(".") || FREE_MAIL.has(domain)) return null;
  const site = hostOf(contacts.website);
  const mail = contacts.email.split("@")[1]?.trim().toLowerCase() ?? "";
  return site === domain || site.endsWith(`.${domain}`) || mail === domain ? domain : null;
}
