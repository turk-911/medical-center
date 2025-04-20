import { prisma } from '@/lib/db'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const medicines = await prisma.medicine.findMany()
      return res.status(200).json(medicines)
    }

    if (req.method === 'POST') {
        const { name, quantity, unit } = req.body;

        if (!name || typeof quantity !== 'number' || !unit) {
          return res.status(400).json({ message: 'Missing or invalid fields' });
        }
      
        try {
          const existing = await prisma.medicine.findUnique({ where: { name } });
      
          if (existing) {
            const updatedMedicine = await prisma.medicine.update({
              where: { name },
              data: {
                quantity: existing.quantity + quantity,
                unit,
              },
            });
      
            return res.status(200).json({
              message: 'Existing medicine updated',
              medicine: updatedMedicine,
            });
          }
      
          const newMedicine = await prisma.medicine.create({
            data: { name, quantity, unit },
          });
      
          return res.status(201).json({
            message: 'New medicine added',
            medicine: newMedicine,
          });
        }
        catch (error) {
            console.error('Error in POST /api/medicine:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error('Error in /api/medicine:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
