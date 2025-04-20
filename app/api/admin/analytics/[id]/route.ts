import { prisma } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req;

  if (method !== 'GET') {
    return res.status(405).json({ message: `Method ${method} Not Allowed` });
  }

  const doctorId = parseInt(id as string);

  if (isNaN(doctorId)) {
    return res.status(400).json({ message: 'Invalid doctor ID' });
  }

  try {
    const doctorAnalytics = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        name: true,
        specialty: true,
        _count: {
          select: {
            Appointment: true, 
          },
        },
        Appointment: {
          select: {
            id: true,
            date: true,
            status: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!doctorAnalytics) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.status(200).json(doctorAnalytics);
  } catch (error) {
    console.error('[ERROR]', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}
