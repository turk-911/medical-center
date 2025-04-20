import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch all medicines
export async function GET(req: NextRequest) {
  try {
    const medicines = await prisma.medicine.findMany()
    return NextResponse.json(medicines, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/medicine:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// POST: Add or update medicine
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, quantity, unit } = body

    if (!name || typeof quantity !== 'number' || !unit) {
      return NextResponse.json({ message: 'Missing or invalid fields' }, { status: 400 })
    }

    const existing = await prisma.medicine.findUnique({ where: { name } })

    if (existing) {
      const updatedMedicine = await prisma.medicine.update({
        where: { name },
        data: {
          quantity: existing.quantity + quantity,
          unit,
        },
      })

      return NextResponse.json({
        message: 'Existing medicine updated',
        medicine: updatedMedicine,
      }, { status: 200 })
    }

    const newMedicine = await prisma.medicine.create({
      data: { name, quantity, unit },
    })

    return NextResponse.json({
      message: 'New medicine added',
      medicine: newMedicine,
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/medicine:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}