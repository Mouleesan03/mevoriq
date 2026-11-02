import { getCurrentUser } from "@/lib/auth/session";
import { getEventRecap } from "@/lib/data/events";
import { leadsToCsv, listLeads } from "@/lib/data/leads";

/** CSV of the contacts the signed-in person may see (LEAD-04), or of one event's contacts with `?event=`. */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const params = new URL(req.url).searchParams;
  const date = new Date().toISOString().slice(0, 10);
  let rows;
  let filename = `mevoriq-contacts-${date}.csv`;
  const eventId = params.get("event");
  if (eventId) {
    const recap = await getEventRecap(user.id, eventId);
    if (!recap) return new Response("Not found", { status: 404 });
    rows = recap.leads;
    filename = `mevoriq-${recap.event.tag}-${recap.event.startedAt.slice(0, 10)}.csv`;
  } else {
    const status = params.get("status") === "archived" ? "archived" : "all";
    rows = [...(await listLeads(user.id, { status })), ...(status === "all" ? await listLeads(user.id, { status: "archived" }) : [])];
  }
  return new Response(leadsToCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
