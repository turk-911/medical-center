import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value

  const isAuthPath =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/doctor") ||
    request.nextUrl.pathname.startsWith("/admin")

  if (isAuthPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (request.nextUrl.pathname.startsWith("/doctor") && payload.userType !== "doctor") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (request.nextUrl.pathname.startsWith("/admin") && payload.userType !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/doctor/:path*", "/admin/:path*"],
}
