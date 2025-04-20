import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { prescriptionId } = req.body;

    if (!prescriptionId) {
      return res.status(400).json({ message: 'Prescription ID is required' });
    }

    try {
      const deletedPrescription = await prisma.prescription.delete({
        where: { id: prescriptionId }
      });

      return res.status(200).json({ message: 'Prescription deleted successfully', deletedPrescription });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error deleting prescription' });
    }
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
