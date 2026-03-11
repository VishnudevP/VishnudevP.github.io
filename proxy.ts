import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "admin_token";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-dev-secret-change-in-prod"
);

export async function proxy(req: NextRequest) {
  // Only protect /admin/dashboard and its sub-routes
  if (!req.nextUrl.pathname.startsWith("/admin/dashboard")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
