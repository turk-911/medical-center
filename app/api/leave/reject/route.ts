import { prisma } from '@/lib/db';
import { sendMail } from '@/lib/mailer';

export async function POST(req: Request) {
    const { leaveId } = await req.json();

    const leave = await prisma.onLeave.findUnique({
        where: { id: leaveId },
        include: { doctor: { include: { user: true } } },
    });

    if (!leave) return Response.json({ error: 'Leave not found' }, { status: 404 });

    await prisma.onLeave.delete({ where: { id: leaveId } });

    if (leave.doctor.user.email) {
        await sendMail(
            leave.doctor.user.email,
            'Leave Rejected',
            `Your leave request from ${leave.fromDate} to ${leave.toDate} has been rejected.`
        );
    }

    return Response.json({ success: true });
}