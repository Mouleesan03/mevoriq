import { getCurrentUser } from "@/lib/auth/session";
import { exportAccount } from "@/lib/data/profiles";

/** "Download my data": everything Mevoriq stores about the signed-in person, as JSON. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  return new Response(JSON.stringify(await exportAccount(user.id), null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="mevoriq-account-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
