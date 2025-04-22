import { prisma } from '@/lib/db';
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

    // Notify doctor and substitute
    if (leave.doctor.user.email) {
        await sendMail(
            leave.doctor.user.email,
            'Leave Approved',
            `Your leave from ${leave.fromDate} to ${leave.toDate} is approved. Substitute: ${leave.substitute.name}.`
        );
    }

    if (leave.substitute.user.email) {
        await sendMail(
            leave.substitute.user.email,
            'You are Assigned as Substitute',
            `You are assigned as a substitute for Dr. ${leave.doctor.name} from ${leave.fromDate} to ${leave.toDate}.`
        );
    }

    return Response.json({ success: true });
}