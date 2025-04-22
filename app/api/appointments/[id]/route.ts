import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const doctorId = parseInt(params.id);
    console.log("Doctor ID:", doctorId);
    console.log("Params ID:", params.id);

    if (isNaN(doctorId)) {
        return NextResponse.json({ message: "Invalid doctor ID" }, { status: 400 });
    }

    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId,  // Filter appointments by doctorId
            },
            include: {
                user: {  // Include user info (patient information)
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                prescription: {  // Include prescription details if available
                    include: {
                        PrescriptionMedicine: {  // Include associated medicines for the prescription
                            include: {
                                medicine: true,  // Include medicine details (name, quantity, etc.)
                            },
                        },
                    },
                },
            },
            orderBy: {
                date: "asc",  // Order appointments by date in ascending order
            },
        });

        return NextResponse.json({ appointments }, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching appointments by doctor ID:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}