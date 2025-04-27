// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { verifyToken } from "@/lib/auth";

// export async function GET(req: NextRequest) {
//   try {
//     const token = req.cookies.get("auth_token")?.value;
//     if (!token) {
//       return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
//     }

//     console.log("token: ", token)

//     const userData = await verifyToken(token);
//     const userId = userData?.Doctor?.id;

//     console.log("User ID from token:", userId);

//     const appointments = await prisma.appointment.findMany({
//       where: { userId },
//       include: { doctor: true },
//     });

//     const formatted = appointments.map((a) => ({
//       id: a.id,
//       doctorName: a.doctor.name,
//       specialization: a.doctor.specialty,
//       date: a.date.toISOString(),
//       time: a.timeSlot,
//       status: a.status,
//       reason: a.description,
//     }));

//     if (appointments.length === 0) {
//       console.log("Appointments length is 0")
//       return NextResponse.json({ success: true, appointments: [] });
//     }
//     console.log("Formatted" ,formatted);
//     return NextResponse.json({ success: true, appointments: formatted });
//   } catch (error) {
//     console.error("Error fetching appointments:", error);
//     return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
//   }
// }

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
        console.log("hello");
        
        console.log(appointments);
        
        return new Response(JSON.stringify(appointments), { status: 200 });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch appointments' }), { status: 500 });
    }
}