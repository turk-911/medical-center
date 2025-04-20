import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const doctors = await prisma.doctor.findMany({
        include: {
          user: true,
          Availability: true,
        },
      });
      return res.status(200).json(doctors);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error fetching doctors' });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
