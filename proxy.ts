import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/app", "/onboarding", "/admin"];

/**
 * Runs before matched routes.
 * - Supabase: refreshes the auth session cookie on every request (so Server Components see a valid session)
 *   and sends signed-out visitors on protected pages to /login.
 * - Local store: optimistic check for the demo session cookie.
 * Real authorization still happens server-side in requireUser() on every page and action.
 */
export async function proxy(request: NextRequest) {
  const isProtected = PROTECTED.some((p) => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(`${p}/`));
  const toLogin = () => {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    if (isProtected && !request.cookies.has("mevoriq_demo_session")) return toLogin();
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  if (isProtected && !data.user) return toLogin();
  return response;
}

export const config = {
  // Everything except static files and images, so sessions stay fresh across the app.
  matcher: ["/((?!_next/static|_next/image|brand/|favicon|manifest.webmanifest|sw.js|robots.txt|sitemap.xml|api/v1/media|.*\\.(?:png|jpg|svg|webp|ico)$).*)"],
};
