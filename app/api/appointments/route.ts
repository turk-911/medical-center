import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userData = await verifyToken(token);
    const userId = userData?.userId;

    const appointments = await prisma.appointment.findMany({
      where: { userId },
      include: { doctor: true },
    });

    const formatted = appointments.map((a) => ({
      id: a.id,
      doctorName: a.doctor.name,
      specialization: a.doctor.specialty,
      date: a.date.toISOString(),
      time: a.timeSlot,
      status: a.status,
      reason: a.description,
    }));

    return NextResponse.json({ success: true, appointments: formatted });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}