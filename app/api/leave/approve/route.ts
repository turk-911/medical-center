import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { sendMail } from '@/lib/mailer';

export async function POST(req: Request) {
    const { leaveId } = await req.json();

    const leave = await prisma.onLeave.findUnique({
        where: { id: leaveId },
        include: { doctor: { include: { user: true } }, substitute: { include: { user: true } } },
    });

    if (!leave) return Response.json({ error: 'Leave not found' }, { status: 404 });

    // Reassign appointments on leave days
    await prisma.appointment.updateMany({
        where: {
            doctorId: leave.doctorId,
            date: { gte: leave.fromDate, lte: leave.toDate },
        },
        data: { doctorId: leave.substituteId },
    });

    await prisma.onLeave.update({
        where: { id: leaveId },
        data: { status: "approved" }
    })

    // Notify doctor and substitute
    if (leave.doctor.user.email) {
        await sendEmail({
            to: leave.doctor.user.email,
            subject: 'Leave Approved',
            text: `Your leave from ${leave.fromDate} to ${leave.toDate} is approved. Substitute: ${leave.substitute.name}.`
        });
    }

    if (leave.substitute.user.email) {
        await sendEmail({
            to: leave.substitute.user.email,
            subject: 'You are Assigned as Substitute',
            text: `You are assigned as a substitute for Dr. ${leave.doctor.name} from ${leave.fromDate} to ${leave.toDate}.`
        });
    }

    return Response.json({ success: true });
}