import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value
    const user = token ? await verifyToken(token) : null

    if (!user || user.userType !== "resident") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const appointments = await prisma.appointment.findMany({
      where: { residentId: user.userId },
      include: {
        doctor: true,
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json({
      success: true,
      appointments: appointments.map((app) => ({
        id: app.id,
        doctorName: app.doctor.name,
        specialization: app.doctor.specialty,
        date: app.date.toISOString().split("T")[0],
        time: new Date(app.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: app.status,
        reason: app.description,
      })),
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching appointments" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const token = cookies().get("token")?.value
    const userData = token ? await verifyToken(token) : null

    if (!userData) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    console.log("Received booking payload:", body)

    const { doctorId, date, timeSlot, reason } = body

    if (!doctorId || !date || !timeSlot) {
      console.warn("Missing required fields:", { doctorId, date, timeSlot })
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 })
    }

    const appointmentDate = new Date(`${date}T${convertTo24Hour(timeSlot)}`)
    console.log("Converted appointment date:", appointmentDate)

    console.log("Creating appointment with data:", {
      doctorId,
      residentId: userData.userId,
      date: appointmentDate,
      description: reason,
    })

    let appointment;
    try {
      appointment = await prisma.appointment.create({
        data: {
          doctorId: Number(doctorId),
          residentId: Number(userData.userId),
          date: appointmentDate,
          description: reason || "",
          status: "upcoming",
        },
      });
    } catch (err) {
      console.error("Prisma appointment.create error:", err);
      return NextResponse.json(
        { success: false, message: "Database error", error: String(err) },
        { status: 500 }
      );
    }

    console.log("Appointment created:", appointment)

    return NextResponse.json({ success: true, appointmentId: appointment.id })
  } catch (error) {
    console.error("Appointment booking error:", error)
    return NextResponse.json({ success: false, message: "Booking failed", error: String(error) }, { status: 500 })
  }
}

function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = String(parseInt(hours, 10) + 12);
  }
  else if (modifier === "PM" && hours !== "12") {
    hours = String(parseInt(hours, 10) + 12);
  }

  return `${hours.padStart(2, "0")}:${minutes}`;
}