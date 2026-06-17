import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next 16 renamed `middleware` -> `proxy`. This refreshes the Supabase session
// on every matched request and gates the whole app behind authentication.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() revalidates the auth token and refreshes cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gate the whole app behind login. The marketing landing, auth pages, and the
  // OAuth callback (which runs before a session exists) stay public; everything
  // in the (app) group requires a session.
  const PROTECTED = ["/focus", "/sprints", "/rooms", "/profile"];
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (!user && needsAuth) {
    const next = pathname + request.nextUrl.search;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and the public branding files.
    "/((?!_next/static|_next/image|favicon.ico|branding|.*\\.(?:svg|png|ico)$).*)",
  ],
};
