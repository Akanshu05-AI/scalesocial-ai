import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/oauth/callback"];

/**
 * Edge-level gate: redirects unauthenticated requests away from the
 * dashboard shell before React ever mounts. This reads a non-HttpOnly
 * "logged_in" flag cookie (set alongside the HttpOnly refresh cookie at
 * login) — the actual access token stays in memory and is invisible here,
 * which is why the client-side guard in ProtectedRoute still matters too.
 */
export function middleware(request: NextRequest) {
  const isPublic = PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));
  const isLoggedIn = request.cookies.get("logged_in")?.value === "true";

  if (!isPublic && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic && isLoggedIn && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
