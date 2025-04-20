import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next'

interface UpdatePrescriptionRequestBody {
  prescriptionId: number;
  appointmentId: number;
  medicineIds: number[];
  quantities: number[]; 
  description: string;
  dosage: string;
  duration: string;
  frequency: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const {
      prescriptionId,
      medicineIds,
      quantities,
      description,
      dosage,
      duration,
      frequency,
    }: UpdatePrescriptionRequestBody = req.body;

    if (!prescriptionId || !medicineIds || !quantities) {
      return res.status(400).json({ message: 'Prescription ID, Medicine IDs, and Quantities are required' });
    }

    try {
      const updatedPrescription = await prisma.prescription.update({
        where: { id: prescriptionId },
        data: {
          medicines: {
            connect: medicineIds.map((id, index) => ({
              id,
              quantity: quantities[index],
            })),
          },
          description,
          dosage,
          duration,
          frequency,
        },
      });

      return res.status(200).json({ message: 'Prescription updated successfully', updatedPrescription });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating prescription' });
    }
  }

  res.setHeader('Allow', ['PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
