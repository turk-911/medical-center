import { NextResponse } from "next/server"
import { createToken } from "@/lib/auth"
import { prisma } from "@/lib/db" 
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

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    const otpIsExpired = user.otpExpiry && new Date(user.otpExpiry).getTime() < Date.now()
    if (user.otp !== otp || otpIsExpired) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { email },
      data: { otp: null, otpExpiry: null },
    })


    const token = await createToken({
      userId: user.id,
      email: user.email,
      userType: user.role, 
    })

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Failed to create token" },
        { status: 500 }
      )
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",  
      maxAge: 60 * 60 * 24 * 7, 
      path: "/",
    }

    const cookieStore = await cookies()
    cookieStore.set("auth_token", token, cookieOptions)

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
