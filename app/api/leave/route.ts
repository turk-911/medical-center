import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const leaves = await prisma.onLeave.findMany({
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        user: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
                substitute: {
                    select: {
                        id: true,
                        name: true,
                        user: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                fromDate: "asc",
            },
        });

        // Ensure that the response is an array
        console.log("APT", leaves);
        return NextResponse.json(leaves, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching leaves:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}