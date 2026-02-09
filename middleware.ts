import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  //   const { pathname } = request.nextUrl;
  //   // Skip public routes
  //   if (
  //     pathname.startsWith("/login") ||
  //     pathname.startsWith("/onboard") ||
  //     pathname.startsWith("/auth_success") ||
  //     pathname.startsWith("/password-change") ||
  //     pathname.startsWith("/signup") ||
  //     pathname.startsWith("/_next") ||
  //     pathname.includes(".")
  //   ) {
  //     return NextResponse.next();
  //   }
  //   const token = request.cookies.get("token");
  //   const refreshToken = request.cookies.get("refresh_token");
  //   // ❌ No auth cookies → redirect
  //   if (!token && !refreshToken) {
  //     return NextResponse.redirect(new URL("/onboard", request.url));
  //   }
  //   // ✅ At least one exists → continue
  //   return NextResponse.next();
  // }
  // export const config = {
  //   matcher: ["/((?!_next|favicon.ico).*)"],
}
