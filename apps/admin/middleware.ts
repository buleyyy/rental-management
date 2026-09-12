import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Simple check: if accessing /admin/* and no session, redirect to login
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get("next-auth.session-token") || 
                         request.cookies.get("__Secure-next-auth.session-token");
    
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
