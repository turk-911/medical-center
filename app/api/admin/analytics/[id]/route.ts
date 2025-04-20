import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const doctorId = parseInt(params.id)

  if (isNaN(doctorId)) {
    return NextResponse.json({ message: 'Invalid doctor ID' }, { status: 400 })
  }

  try {
    const doctorAnalytics = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        name: true,
        specialty: true,
        _count: {
          select: {
            Appointment: true,
          },
        },
        Appointment: {
          select: {
            id: true,
            date: true,
            status: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!doctorAnalytics) {
      return NextResponse.json({ message: 'Doctor not found' }, { status: 404 })
    }

    return NextResponse.json(doctorAnalytics, { status: 200 })
  } catch (error) {
    console.error('[ERROR]', error)
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 })
  }
}
