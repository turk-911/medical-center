import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  // Get the token from the cookies
  const token = request.cookies.get("auth_token")?.value

  // Check if the path requires authentication
  const isAuthPath =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/doctor") ||
    request.nextUrl.pathname.startsWith("/admin")

  if (isAuthPath) {
    if (!token) {
      // Redirect to login if no token is found
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Verify the token
    const payload = await verifyToken(token)
    if (!payload) {
      // Redirect to login if token is invalid
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Check user type for specific paths
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
