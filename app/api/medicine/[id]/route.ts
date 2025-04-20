import { prisma } from '@/lib/db'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid ID' })
  }

  try {
    if (req.method === 'GET') {
      const medicine = await prisma.medicine.findUnique({ where: { id: parseInt(id) } })
      if (!medicine) return res.status(404).json({ message: 'Medicine not found' })
      return res.status(200).json(medicine)
    }

    if (req.method === 'PUT') {
      const { name, quantity, unit } = req.body

      const updated = await prisma.medicine.update({
        where: { id: parseInt(id) },
        data: { name, quantity, unit },
      })

      return res.status(200).json(updated)
    }

    if (req.method === 'DELETE') {
      await prisma.medicine.delete({ where: { id: parseInt(id) } })
      return res.status(204).end()
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error('Error in /api/medicine/[id]:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
