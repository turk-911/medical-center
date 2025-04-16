// prisma/seed.ts
import { prisma } from "@/lib/db"

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Dr. John Doe",
      email: "john.doe@example.com",
      role: "doctor",
      passwordHash: "hashedpassword", // just a placeholder
    },
  })

  const doctor = await prisma.doctor.create({
    data: {
      name: "Dr. John Doe",
      specialty: "Cardiology",
      userId: user.id,
    },
  })

  console.log("Seeded doctor:", doctor)
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())