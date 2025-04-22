import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    const userId = Number(params.userId)

    if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    try {
        const appointments = await prisma.appointment.findMany({
            where: { userId },
            select: { id: true } 
        })

        if (appointments.length === 0) {
            return NextResponse.json({ message: 'No appointments found for this user' }, { status: 404 })
        }

        const appointmentIds = appointments.map((appointment) => appointment.id)

        const prescriptions = await prisma.prescription.findMany({
            where: {
                appointmentId: {
                    in: appointmentIds, 
                },
            },
            include: {
                appointment: {
                    select: {
                        date: true,
                        timeSlot: true,
                        doctor: {
                            select: {
                                name: true,
                                specialty: true,
                            },
                        },
                    },
                },
                PrescriptionMedicine: {
                    include: {
                        medicine: true, 
                    },
                },
            },
        })

        return NextResponse.json(prescriptions)
    } catch (error) {
        console.error('Error fetching prescriptions:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}