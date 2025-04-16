import { NextApiRequest, NextApiResponse } from "next"
import { getUserFromToken } from "../../../../lib/auth"
import { prisma } from "@/lib/db"


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" })
  }

  const userId = await getUserFromToken()
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        Resident: true,
        Doctor: true,
        Faculty: true,
        Staff: true,
        Student: true,
        Admin: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(user)
  } catch (error) {
    console.error("Error fetching user details:", error)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
