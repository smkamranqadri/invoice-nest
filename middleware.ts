import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Protected routes: redirect to sign-in if no session cookie
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect dashboard and all nested routes
    "/dashboard/:path*",
    "/create-workspace",
    "/settings/:path*",
    "/members/:path*",
  ],
};
