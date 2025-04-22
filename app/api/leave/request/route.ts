import { prisma } from '@/lib/db';
import { sendMail } from '@/lib/mailer';

export async function POST(req: Request) {
    const { doctorId, substituteId, fromDate, toDate } = await req.json();

    const leave = await prisma.onLeave.create({
        data: { doctorId, substituteId, fromDate: new Date(fromDate), toDate: new Date(toDate) },
    });

    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });

    if (admin?.email) {
        await sendMail(
            admin.email,
            'Leave Request Submitted',
            `Doctor ID ${doctorId} has requested leave from ${fromDate} to ${toDate}. Please review.`
        );
    }

    return Response.json({ success: true, leave });
}