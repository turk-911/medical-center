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
      dept,
      section,
      rollNo,
      course
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

    const user = await prisma.user.create({
      data: {
        email,
        name: name || "",
        role,
        passwordHash: hashedPassword,
      },
    })

    // Create role-specific profile
    switch (role) {
      case "resident":
        await prisma.resident.create({
          data: {
            name,
            address,
            phone,
            userId: user.id,
          },
        })
        break

      case "doctor":
        if (!specialty) {
          return NextResponse.json(
            { success: false, message: "Specialty is required for doctors." },
            { status: 400 }
          )
        }

        await prisma.doctor.create({
          data: {
            name,
            specialty,
            userId: user.id,
          },
        })
        break

      case "faculty":
        if (!dept) {
          return NextResponse.json(
            { success: false, message: "Department is required for faculty." },
            { status: 400 }
          )
        }

        await prisma.faculty.create({
          data: {
            dept,
            userId: user.id,
          },
        })
        break

      case "staff":
        if (!section) {
          return NextResponse.json(
            { success: false, message: "Section is required for staff." },
            { status: 400 }
          )
        }

        await prisma.staff.create({
          data: {
            section,
            userId: user.id,
          },
        })
        break

      case "student":
        if (!rollNo || !course) {
          return NextResponse.json(
            { success: false, message: "Roll number and course are required for students." },
            { status: 400 }
          )
        }

        await prisma.student.create({
          data: {
            rollNo,
            course,
            userId: user.id,
          },
        })
        break

      default:
        return NextResponse.json(
          { success: false, message: "Invalid role specified." },
          { status: 400 }
        )
    }

    await sendEmail({
      to: email,
      subject: "Welcome to the Medical Center",
      text: `Your account has been created successfully. You can now book appointments.`,
    })

    return NextResponse.json({ success: true, message: "User registered successfully." })
  } catch (err) {
    console.error("Registration error:", err)
    return NextResponse.json({ success: false, message: "Registration failed." }, { status: 500 })
  }
}
