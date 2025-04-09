import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { sendEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const {
      email,
      password,
      name,
      role,
      specialty,
      address,
      phone,
    } = data

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Email, password, and role are required." },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists." },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("Register request body:", data)

    const user = await prisma.user.create({
      data: {
        email,
        name: name || "", // fallback if undefined
        role,
        // If you add passwordHash to schema:
        passwordHash: hashedPassword
      },
    })

    if (role === "resident") {
      await prisma.resident.create({
        data: {
          name,
          address,
          phone,
          userId: user.id,
        },
      })
    } else if (role === "doctor") {
      await prisma.doctor.create({
        data: {
          name,
          specialty,
          userId: user.id,
        },
      })
    }

    await sendEmail({
      to: email,
      subject: "Welcome to Medical Center",
      text: `Your account has been created successfully.`,
    })

    return NextResponse.json({ success: true, message: "User registered." })
  } catch (err) {
    console.error("Registration error:", err)
    return NextResponse.json({ success: false, message: "Registration failed." }, { status: 500 })
  }
}