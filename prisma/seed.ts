import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const doctorId = 13;

  // Check if doctor exists
  const doctorExists = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctorExists) {
    console.log('Doctor with ID 16 does not exist. Creating a new doctor...');
    await prisma.doctor.create({
      data: {
        id: doctorId,
        name: 'Dr. Arshdeep',
        // Add other necessary fields like email, specialty, etc.
      },
    });
    console.log('Doctor created!');
  }

  const schedule = [
    { day: 'Monday', startHour: 9, endHour: 17 },
    { day: 'Wednesday', startHour: 9, endHour: 17 },
    { day: 'Friday', startHour: 9, endHour: 17 },
  ];

  for (const entry of schedule) {
    const startTime = `${entry.startHour}:00`;
    const endTime = `${entry.endHour}:00`;

    // Check if availability already exists
    const exists = await prisma.availability.findMany({
      where: {
        doctorId,
        dayOfWeek: entry.day,
      },
    });

    if (exists.length === 0) {
      await prisma.availability.create({
        data: {
          doctorId,
          dayOfWeek: entry.day,
          startTime,
          endTime,
        },
      });
      console.log(`Added availability for ${entry.day}`);
    } else {
      console.log(`Availability for ${entry.day} already exists`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());