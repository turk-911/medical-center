import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET() {
    try {
        const token = (await cookies()).get("auth_token")?.value
        const userData = token ? await verifyToken(token) : null

        if (!userData) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: userData.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        })

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, user })
    } catch (error) {
        console.error("Profile fetch error:", error)
        return NextResponse.json({ success: false, message: "Failed to fetch profile" }, { status: 500 })
    }
}