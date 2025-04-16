import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { parseISO, format, isWithinInterval } from "date-fns"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doctorId = parseInt(params.id)
    const dateStr = req.nextUrl.searchParams.get("date")

    if (!dateStr) {
      return NextResponse.json({ success: false, message: "Date is required" }, { status: 400 })
    }

    const date = parseISO(dateStr)
    const dayOfWeek = format(date, "EEEE") 

    const leave = await prisma.onLeave.findFirst({
      where: {
        doctorId,
        fromDate: { lte: date },
        toDate: { gte: date },
      },
    })

    if (leave) {
      return NextResponse.json({
        success: true,
        availableSlots: [],
        message: "Doctor is on leave on this date",
      })
    }

    const availability = await prisma.availability.findMany({
      where: {
        doctorId,
        dayOfWeek,
      },
    })

    if (!availability.length) {
      return NextResponse.json({ success: true, availableSlots: [] })
    }

    const bookedSlots = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: new Date(dateStr),
      },
      select: { timeSlot: true },
    })

    const bookedTimeSlots = bookedSlots.map((a) => a.timeSlot)

    const availableSlots: string[] = []

    for (const slot of availability) {
      const [startHour] = slot.startTime.split(":").map(Number)
      const [endHour] = slot.endTime.split(":").map(Number)

      for (let hour = startHour; hour < endHour; hour++) {
        const formattedTime = `${hour.toString().padStart(2, "0")}:00`
        if (!bookedTimeSlots.includes(formattedTime)) {
          availableSlots.push(formattedTime)
        }
      }
    }

    return NextResponse.json({ success: true, availableSlots })
  } catch (error) {
    console.error("Error fetching available slots:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
