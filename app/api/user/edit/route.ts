import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
    }

    const userData = await verifyToken(token);
    if (!userData || !userData.userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const user = await prisma.user.findUnique({
      where: { id: userData.userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const { name, ...roleData } = body;

    await prisma.user.update({
      where: { id: userData.userId },
      data: { name },
    });

    switch (user.role) {
      case "resident":
        await prisma.resident.update({
          where: { userId: userData.userId },
          data: {
            name: roleData.name,
            address: roleData.address,
            phone: roleData.phone,
          },
        });
        break;
      case "doctor":
        await prisma.doctor.update({
          where: { userId: userData.userId },
          data: {
            name: roleData.name,
            specialty: roleData.specialty,
            image: roleData.image,
          },
        });
        break;
      case "faculty":
        await prisma.faculty.update({
          where: { userId: userData.userId },
          data: { dept: roleData.dept },
        });
        break;
      case "staff":
        await prisma.staff.update({
          where: { userId: userData.userId },
          data: { section: roleData.section },
        });
        break;
      case "student":
        await prisma.student.update({
          where: { userId: userData.userId },
          data: {
            rollNo: roleData.rollNo,
            course: roleData.course,
          },
        });
        break;
      case "admin":
        break;
      default:
        return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Profile updated" });

  } catch (err) {
    console.error("❌ Error editing profile:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
