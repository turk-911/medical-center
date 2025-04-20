import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next'

interface GetPrescriptionRequestBody {
  appointmentId: number; 
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { appointmentId }: GetPrescriptionRequestBody = req.query as any;

    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    try {
      const prescription = await prisma.prescription.findMany({
        where: { appointmentId },
        include: {
          medicines: true,
        },
      });

      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }

      return res.status(200).json({ prescription });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error retrieving prescription' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
