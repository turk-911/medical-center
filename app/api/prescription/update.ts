import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest) {
  try {
    const {
      prescriptionId,
      medicineIds,
      quantities,
      description,
      dosage,
      duration,
      frequency,
    } = await req.json()

    if (
      !prescriptionId ||
      !medicineIds ||
      !quantities ||
      medicineIds.length !== quantities.length
    ) {
      return NextResponse.json(
        { message: 'Missing required fields or mismatched array lengths' },
        { status: 400 }
      )
    }

    // Check if prescription exists
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    })

    if (!prescription) {
      return NextResponse.json(
        { message: 'Prescription not found' },
        { status: 404 }
      )
    }

    // Delete old associated medicines
    await prisma.prescriptionMedicine.deleteMany({
      where: { prescriptionId },
    })

    // Create updated associations
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        description,
        dosage,
        duration,
        frequency,
        medicines: {
          create: medicineIds.map((medicineId: number, index: number) => ({
            medicine: { connect: { id: medicineId } },
            quantity: quantities[index],
          })),
        },
      },
      include: {
        medicines: {
          include: {
            medicine: true,
          },
        },
      },
    })

    return NextResponse.json(
      { message: 'Prescription updated successfully', updatedPrescription },
      { status: 200 }
    )
  } catch (error) {
    console.error('[UPDATE PRESCRIPTION ERROR]', error)
    return NextResponse.json(
      { message: 'Error updating prescription' },
      { status: 500 }
    )
  }
}
