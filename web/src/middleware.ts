import { NextRequest, NextResponse } from "next/server";

// Redirect bare `/` to the default locale. All other routes go through [locale]/...
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/en", req.url));
  }
}

export const config = {
  matcher: ["/"],
};
