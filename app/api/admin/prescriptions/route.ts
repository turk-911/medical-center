import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const prescriptions = await prisma.prescription.findMany({
      include: {
        appointment: {
          include: {
            user: true,    
            doctor: true,  
          },
        },
        PrescriptionMedicine: {
          include: {
            medicine: true,
          },
        },
      },
    })

    return NextResponse.json(prescriptions, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching prescriptions:', error.message, error)
    return NextResponse.json({ message: 'Error fetching prescriptions' }, { status: 500 })
  }
}