import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "./lib/session";

const publicRoutes = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Verify session
  const session = await verifySession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access control for specific paths
  if (pathname.startsWith("/rules") || pathname.startsWith("/security")) {
    if (session.role === "ANALYST") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Add user info to headers for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", String(session.userId));
  requestHeaders.set("x-user-role", session.role);
  requestHeaders.set("x-user-name", session.name);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
