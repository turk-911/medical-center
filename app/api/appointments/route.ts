import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get('userId') || '');

    if (isNaN(userId)) {
        return new Response(JSON.stringify({ error: 'Invalid or missing userId' }), { status: 400 });
    }

    try {
        const appointments = await prisma.appointment.findMany({
            where: { userId },
            include: {
                doctor: {
                    include: {
                        user: true, // doctor’s user info (like name, email)
                    },
                },
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
        // console.log("hello");
        
        // console.log(appointments);
        
        return new Response(JSON.stringify(appointments), { status: 200 });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch appointments' }), { status: 500 });
    }
}