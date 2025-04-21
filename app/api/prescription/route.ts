import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const {
      appointmentId,
      medicineIds: selectedMedicineIds,
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

    // Combine duplicate medicine IDs and sum their quantities
    const medicineMap = new Map<number, number>();

    selectedMedicineIds.forEach((id, index) => {
      const qty = quantities[index];
      if (medicineMap.has(id)) {
        medicineMap.set(id, medicineMap.get(id)! + qty);
      } else {
        medicineMap.set(id, qty);
      }
    });

    const medicineIds = Array.from(medicineMap.keys());
    const combinedQuantities = Array.from(medicineMap.values());

    if (
      !appointmentId ||
      !medicineIds ||
      !combinedQuantities ||
      medicineIds.length !== combinedQuantities.length
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

      if (medicine.quantity < combinedQuantities[i]) {
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
            quantity: combinedQuantities[index],
          })),
        },
      },
    });

    // Update medicine quantities
    for (let i = 0; i < medicineIds.length; i++) {
      await prisma.medicine.update({
        where: { id: medicineIds[i] },
        data: {
          quantity: { decrement: combinedQuantities[i] },
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
