import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appointmentIdParam = searchParams.get('appointmentId');

  if (!appointmentIdParam) {
    return NextResponse.json({ message: 'Appointment ID is required' }, { status: 400 });
  }

  const appointmentId = parseInt(appointmentIdParam);

  if (isNaN(appointmentId)) {
    return NextResponse.json({ message: 'Invalid Appointment ID' }, { status: 400 });
  }

  try {
    const prescription = await prisma.prescription.findMany({
      where: { appointmentId },
      include: {
          PrescriptionMedicine: true,
      },
    });

    if (!prescription || prescription.length === 0) {
      return NextResponse.json({ message: 'Prescription not found' }, { status: 404 });
    }

    return NextResponse.json({ prescription }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error retrieving prescription' }, { status: 500 });
  }
}
