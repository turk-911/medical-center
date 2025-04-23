import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getUserFromToken();
    if(!userId){
        return NextResponse.json("Unauthorized");        
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pendingLeaves = await prisma.onLeave.findMany({
      where: { status: "pending" }, 
      include: {
        doctor: { include: { user: true } },
        substitute: { include: { user: true } },
      },
    });

    return NextResponse.json({ leaves: pendingLeaves }, { status: 200 });
  } catch (error) {
    console.error("Error fetching pending leaves:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
