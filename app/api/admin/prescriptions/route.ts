import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const prescriptions = await prisma.prescription.findMany({
      include: {
        appointment: true,
        medicines: {
          include: {
            medicine: true,
          },
        },
      },
    })

    return NextResponse.json(prescriptions, { status: 200 })
  } catch (error) {
    console.error('Error fetching prescriptions:', error)
    return NextResponse.json({ message: 'Error fetching prescriptions' }, { status: 500 })
  }
}
