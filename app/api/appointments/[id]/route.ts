import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const doctorId = parseInt(params.id);
    console.log(doctorId);
    console.log(params.id)

    if (isNaN(doctorId)) {
        return NextResponse.json({ message: "Invalid doctor ID" }, { status: 400 });
    }

    try {
        const appointments = await prisma.appointment.findMany({
            where: { doctorId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                prescriptions: {
                    include: {
                        medicines: {
                            include: {
                                medicine: true,
                            },
                        },
                    },
                },
            },
            orderBy: { date: "asc" },
        });

        return NextResponse.json({ appointments }, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching appointments by doctor ID:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}