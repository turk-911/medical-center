const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Sample availability data
  await prisma.availability.createMany({
    data: [
      // Dr. Sarah Johnson (id: 8)
      { doctorId: 8, dayOfWeek: "Monday", startTime: "09:00", endTime: "13:00" },
      { doctorId: 8, dayOfWeek: "Wednesday", startTime: "14:00", endTime: "17:00" },

      // Dr. Michael Chen (id: 9)
      { doctorId: 9, dayOfWeek: "Tuesday", startTime: "10:00", endTime: "12:00" },
      { doctorId: 9, dayOfWeek: "Thursday", startTime: "15:00", endTime: "18:00" },

      // Dr. Lisa Williams (id: 10)
      { doctorId: 10, dayOfWeek: "Monday", startTime: "09:30", endTime: "12:30" },
      { doctorId: 10, dayOfWeek: "Wednesday", startTime: "10:00", endTime: "14:00" },
      { doctorId: 10, dayOfWeek: "Friday", startTime: "08:00", endTime: "11:00" },

      // Dr. Robert Miller (id: 11)
      { doctorId: 11, dayOfWeek: "Tuesday", startTime: "09:00", endTime: "13:00" },
      { doctorId: 11, dayOfWeek: "Saturday", startTime: "10:00", endTime: "15:00" },
    ],
  });

  console.log("✅ Availability seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding availability:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });