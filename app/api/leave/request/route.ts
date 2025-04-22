import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { sendMail } from "@/lib/mailer"
import { sendEmail } from "@/lib/email"

export async function POST(req: Request) {
    try {
        const userId = await getUserFromToken()
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { startDate, endDate, substituteDoctorEmail } = await req.json()
        console.log("Request", { startDate, endDate, substituteDoctorEmail });

        const doctor = await prisma.doctor.findUnique({ where: { userId } })
        console.log("Doctor", doctor);
        if (!doctor) {
            return NextResponse.json({ message: "Doctor not found" }, { status: 404 })
        }

        const substituteUser = await prisma.user.findUnique({
            where: { email: substituteDoctorEmail },
        })



        if (!substituteUser) {
            return NextResponse.json({ message: "Substitute doctor not found" }, { status: 404 })
        }

        const substituteDoctor = await prisma.doctor.findUnique({
            where: { userId: substituteUser.id },
        })



        if (!substituteDoctor) {
            return NextResponse.json({ message: "Substitute doctor not found" }, { status: 404 })
        }

        const leave = await prisma.onLeave.create({
            data: {
                fromDate: new Date(startDate),
                toDate: new Date(endDate),
                doctor: { connect: { id: doctor.id } },
                substitute: { connect: { id: substituteDoctor.id } },
            },
        })

        // Find admin email
        const admin = await prisma.user.findFirst({
            where: { role: "admin" },
        })

        // Send mail to admin
        if (admin?.email) {
            await sendEmail({
                to: admin.email,
                subject: "New Leave Request",
                text: `Dr. ${doctor.name} has requested leave from ${startDate} to ${endDate}. Substitute: Dr. ${substituteDoctor.name}.`,
            })
        }
        if (substituteDoctorEmail) {
            await sendEmail({
                to: substituteDoctorEmail,
                subject: "Substitue Doctor Appointment",
                text: `Dr. ${doctor.name} has requested leave from ${startDate} to ${endDate}. You have been appointed as subsitute.`,
            })
        }

        return NextResponse.json({ message: "Leave request submitted", leave }, { status: 200 })
    } catch (error) {
        console.error("Leave request error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}