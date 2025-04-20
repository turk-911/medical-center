import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("auth_token")?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
        }

        const userData = await verifyToken(token);
        if (!userData || !userData.userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
        }

        const doctor = await prisma.doctor.findUnique({
            where: { userId: userData.userId },
            select: { id: true },
        });

        if (!doctor) {
            return NextResponse.json({ success: false, message: "Not a doctor" }, { status: 403 });
        }

        const appointments = await prisma.appointment.findMany({
            where: { doctorId: doctor.id },
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
            orderBy: {
                date: "asc",
            },
        });

        return NextResponse.json({ success: true, appointments });

    } catch (error) {
        console.error("❌ Error fetching doctor appointments:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}