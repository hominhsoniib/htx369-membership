import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ALWAYS_PUBLIC_PREFIXES = ["/api/auth", "/api/events", "/api/checkin", "/_next", "/favicon.ico"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAlwaysPublic = ALWAYS_PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdminArea = pathname.startsWith("/admin");

  if (isAlwaysPublic || !isAdminArea) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Bỏ qua static assets, chạy middleware cho mọi route còn lại
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
