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

    if (!user.passwordHash) {
      return NextResponse.json({ success: false, message: "Password not set." }, { status: 401 })
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return NextResponse.json({ success: false, message: "Invalid password." }, { status: 401 })
    }

    if (user.otp && user.otpExpiry && new Date(user.otpExpiry) > new Date()) {
      return NextResponse.json({ success: false, message: "OTP already sent and not expired." }, { status: 400 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(otp);
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry },
    })

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
