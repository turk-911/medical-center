import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const medicines = await prisma.medicine.findMany()

        return NextResponse.json(medicines, { status: 200 })
    } catch (error: any) {
        console.error('Error fetching medicines:', error.message, error)
        return NextResponse.json({ message: 'Error fetching medicines' }, { status: 500 })
    }
}