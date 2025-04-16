import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    const userData = await verifyToken(token);
    if (!userData || userData.userType !== "resident") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { doctorId, date, timeSlot, description } = body;

    if (!doctorId || !date || !timeSlot) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const parsedDate = new Date(date);

    // Check if the time slot is already booked
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: parsedDate,
        timeSlot,
      },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: "Time slot already booked" }, { status: 409 });
    }

    // Get the resident ID
    const resident = await prisma.resident.findUnique({
      where: { userId: userData.userId },
    });

    if (!resident) {
      return NextResponse.json({ success: false, message: "Resident profile not found" }, { status: 404 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        residentId: resident.id,
        date: parsedDate,
        timeSlot,
        description,
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error("Appointment booking error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
