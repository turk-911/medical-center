import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next'

interface PrescriptionRequestBody {
  appointmentId: number;
  medicineIds: number[];  
  quantities: number[];    
  description?: string;
  dosage?: string;
  duration?: string;
  frequency?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const {
      appointmentId,
      medicineIds,
      quantities,
      description,
      dosage,
      duration,
      frequency,
    }: PrescriptionRequestBody = req.body;  

    if (!appointmentId || !medicineIds || !quantities || medicineIds.length !== quantities.length) {
      return res.status(400).json({ message: 'Missing required fields or mismatched array lengths' });
    }

    try {
      for (let i = 0; i < medicineIds.length; i++) {
        const medicine = await prisma.medicine.findUnique({
          where: { id: medicineIds[i] },
        });

        if (!medicine) {
          return res.status(404).json({ message: `Medicine with ID ${medicineIds[i]} not found` });
        }

        if (medicine.quantity < quantities[i]) {
          return res.status(400).json({ message: `Insufficient stock for medicine ${medicineIds[i]}` });
        }
      }

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

      for (let i = 0; i < medicineIds.length; i++) {
        await prisma.medicine.update({
          where: { id: medicineIds[i] },
          data: {
            quantity: { decrement: quantities[i] },
          },
        });
      }

      return res.status(201).json({ message: 'Prescription added', prescription });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error creating prescription' });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
