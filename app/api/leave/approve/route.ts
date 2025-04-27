import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
    let leaveId;

    try {
        const body = await req.json();
        leaveId = parseInt(body.leaveId);
        if (isNaN(leaveId)) throw new Error("Invalid leaveId");
    } catch {
        return Response.json({ error: 'Invalid JSON or missing leaveId' }, { status: 400 });
    }

    const leave = await prisma.onLeave.findUnique({
        where: { id: leaveId },
        include: {
            doctor: { include: { user: true } },
            substitute: { include: { user: true } },
        },
    });

    if (!leave) return Response.json({ error: 'Leave not found' }, { status: 404 });

    await prisma.appointment.updateMany({
        where: {
            doctorId: leave.doctorId,
            date: { gte: leave.fromDate, lte: leave.toDate },
        },
        data: { doctorId: leave.substituteId },
    });

    await prisma.onLeave.update({
        where: { id: leaveId },
        data: { status: 'approved' },
    });

    if (leave.doctor?.user?.email) {
        await sendEmail({
            to: leave.doctor.user.email,
            subject: 'Leave Approved',
            text: `Your leave from ${leave.fromDate} to ${leave.toDate} is approved. Substitute: ${leave.substitute.name}.`,
        });
    }

    if (leave.substitute?.user?.email) {
        await sendEmail({
            to: leave.substitute.user.email,
            subject: 'You are Assigned as Substitute',
            text: `You are assigned as a substitute for Dr. ${leave.doctor.name} from ${leave.fromDate} to ${leave.toDate}.`,
        });
    }

    return Response.json({ success: true });
}