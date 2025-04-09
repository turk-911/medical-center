import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { sendEmail } from "@/lib/email"

const OTP_EXPIRY_MINUTES = 10

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 })
    }

    // Check password
    if (!user.passwordHash) {
      return NextResponse.json({ success: false, message: "Password not set." }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)

    if (!validPassword) {
      return NextResponse.json({ success: false, message: "Invalid password." }, { status: 401 })
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    // Store OTP
    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiry,
      },
    })

    // Send OTP via email
    await sendEmail({
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
    })

    return NextResponse.json({ success: true, message: "OTP sent to email." })
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json({ success: false, message: "Login failed." }, { status: 500 })
  }
}