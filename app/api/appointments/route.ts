import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

    const userData = await verifyToken(token)
    const userType = userData?.userType;
    const userId = userData?.userId;

    let appointments = []

    // if (userType === "resident") {
    // const resident = await prisma.resident.findUnique({ where: { userId } })
    // if (!resident) return NextResponse.json({ success: false, message: "Resident not found" }, { status: 404 })

    appointments = await prisma.appointment.findMany({
      where: { userId: userId },
      include: { doctor: true, prescriptions: true },
    })
    // } else if (userType === "doctor") {
    //   const doctor = await prisma.doctor.findUnique({ where: { userId } })
    //   if (!doctor) return NextResponse.json({ success: false, message: "Doctor not found" }, { status: 404 })

    //   appointments = await prisma.appointment.findMany({
    //     where: { userId: doctor.id },
    //     include: { resident: true, prescriptions: true },
    //   })
    // } else {
    //   return NextResponse.json({ success: false, message: "Not allowed" }, { status: 403 })
    // }

    return NextResponse.json({ success: true, appointments })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
