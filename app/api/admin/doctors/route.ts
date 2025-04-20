import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: true,
        Availability: true,
      },
    })

    return NextResponse.json(doctors, { status: 200 })
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json({ message: 'Error fetching doctors' }, { status: 500 })
  }
}
