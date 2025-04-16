import { NextResponse } from "next/server"
import { createToken, setTokenCookie } from "@/lib/auth"
import { prisma } from "@/lib/db" // Assuming you have a Prisma client here
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      )
    }

    // 1. Look up the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // 2. Verify OTP and expiry
    if (user.otp !== otp || user.otpExpiry! < new Date()) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      )
    }

    // 3. Clear OTP from DB (optional for security)
    await prisma.user.update({
      where: { email },
      data: { otp: null, otpExpiry: null },
    })

    // 4. Create a JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      userType: user.role, // assuming you have userType field
    })

    // 5. Set the token in a cookie
    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
      userType: user.role,
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during OTP verification" },
      { status: 500 }
    )
  }
}