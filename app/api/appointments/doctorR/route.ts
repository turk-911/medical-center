import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const doctorIdParam = searchParams.get('doctorId');

        if (!doctorIdParam) {
            return new Response(JSON.stringify({ error: 'Missing doctorId' }), { status: 400 });
        }

        const doctorId = parseInt(doctorIdParam, 10);

        if (isNaN(doctorId)) {
            return new Response(JSON.stringify({ error: 'Invalid doctorId' }), { status: 400 });
        }

        console.log("✅ doctorR API hit with doctorId:", doctorId);
        const appointments = await prisma.appointment.findMany({
            where: { doctorId },
            include: {
                user: true,
                prescription: {
                    include: {
                        PrescriptionMedicine: {
                            include: {
                                medicine: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: 'asc',
            },
        });

        return new Response(JSON.stringify({ appointments }), { status: 200 });
    } catch (error) {
        console.error('Error fetching appointments for doctor:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}