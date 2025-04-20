import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: true,
        user: true,
      },
    })

    return NextResponse.json(appointments, { status: 200 })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ message: 'Error fetching appointments' }, { status: 500 })
  }
}
