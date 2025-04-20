import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { prescriptionId } = body;

    if (!prescriptionId) {
      return NextResponse.json({ message: 'Prescription ID is required' }, { status: 400 });
    }

    const deletedPrescription = await prisma.prescription.delete({
      where: { id: prescriptionId },
    });

    return NextResponse.json(
      { message: 'Prescription deleted successfully', deletedPrescription },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error deleting prescription' }, { status: 500 });
  }
}
