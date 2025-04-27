import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { parseISO } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Booking appointment...");

    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    const userData = await verifyToken(token);

    if (!userData || !userData.userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { doctorId, date, timeSlot, description } = body;

    if (!doctorId || !date || !timeSlot) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const parsedDate = parseISO(date);
    const doctorIdNum = typeof doctorId === "string" ? parseInt(doctorId) : doctorId;
    
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorIdNum,
        date: parsedDate,
        timeSlot,
      },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: "Time slot already booked" }, { status: 409 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        doctor: { connect: { id: doctorIdNum } },
        user: { connect: { id: userData.userId } },
        date: parsedDate,
        timeSlot,
        description,
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error("❌ Appointment booking error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}