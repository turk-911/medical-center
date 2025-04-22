import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer"; 
import { addDays, format, startOfDay, endOfDay } from "date-fns";

export async function sendTomorrowReminders() {
  const tomorrow = addDays(new Date(), 1);
  const start = startOfDay(tomorrow);
  const end = endOfDay(tomorrow);

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
    include: {
      user: true,
      doctor: true,
    },
  });

  for (const appt of appointments) {
    if (!appt.user?.email) continue;

    const dateStr = format(appt.date, "PPP"); 
    const subject = `⏰ Appointment Reminder for ${dateStr}`;
    const message = `Hello ${appt.user.name || "User"},\n\nThis is a friendly reminder of your appointment with Dr. ${appt.doctor.name} scheduled on ${dateStr} at ${appt.timeSlot}.\n\nPlease be on time.\n\nThank you!`;

    await sendMail(appt.user.email, subject, message);
  }

  return appointments.length;
}
