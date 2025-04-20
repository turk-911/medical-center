import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"

export async function GET() {
    try {
        const doctors = await prisma.doctor.findMany({
            include: {
                user: true,
            },
        });
        return NextResponse.json({ doctors });
    } catch (error) {
        console.error("Failed to fetch doctors:", error);
        return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
    }
}