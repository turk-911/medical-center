import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
  }

  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: parseInt(id) },
    })

    if (!medicine) {
      return NextResponse.json({ message: 'Medicine not found' }, { status: 404 })
    }

    return NextResponse.json(medicine, { status: 200 })
  } catch (error) {
    console.error('GET /api/medicine/[id] error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
  }

  try {
    const { name, quantity, unit } = await req.json()

    const updated = await prisma.medicine.update({
      where: { id: parseInt(id) },
      data: { name, quantity, unit },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('PUT /api/medicine/[id] error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
  }

  try {
    await prisma.medicine.delete({
      where: { id: parseInt(id) },
    })

    return new Response(null, { status: 204 }) // No content
  } catch (error) {
    console.error('DELETE /api/medicine/[id] error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
