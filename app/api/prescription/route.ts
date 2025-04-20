import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const {
      appointmentId,
      medicineIds,
      quantities,
      description,
      dosage,
      duration,
      frequency,
    }: {
      appointmentId: number;
      medicineIds: number[];
      quantities: number[];
      description?: string;
      dosage?: string;
      duration?: string;
      frequency?: string;
    } = await request.json();

    if (
      !appointmentId ||
      !medicineIds ||
      !quantities ||
      medicineIds.length !== quantities.length
    ) {
      return NextResponse.json(
        { message: 'Missing required fields or mismatched array lengths' },
        { status: 400 }
      );
    }

    // Check medicine availability
    for (let i = 0; i < medicineIds.length; i++) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: medicineIds[i] },
      });

      if (!medicine) {
        return NextResponse.json(
          { message: `Medicine with ID ${medicineIds[i]} not found` },
          { status: 404 }
        );
      }

      if (medicine.quantity < quantities[i]) {
        return NextResponse.json(
          { message: `Insufficient stock for medicine ${medicineIds[i]}` },
          { status: 400 }
        );
      }
    }

    // Create prescription
    const prescription = await prisma.prescription.create({
      data: {
        appointmentId,
        description,
        dosage,
        duration,
        frequency,
        medicines: {
          create: medicineIds.map((medicineId, index) => ({
            medicineId,
            quantity: quantities[index],
          })),
        },
      },
    });

    // Update medicine quantities
    for (let i = 0; i < medicineIds.length; i++) {
      await prisma.medicine.update({
        where: { id: medicineIds[i] },
        data: {
          quantity: { decrement: quantities[i] },
        },
      });
    }

    return NextResponse.json(
      { message: 'Prescription added', prescription },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Error creating prescription' },
      { status: 500 }
    );
  }
}
