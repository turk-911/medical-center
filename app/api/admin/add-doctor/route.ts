import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    const userId = await getUserFromToken();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔍 Check if the user is an admin
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Only admins can add doctors' }, { status: 403 });
    }

    try {
        const {
            name,
            email,
            specialty,
            qualification,
            availability,
            password
        } = await req.json();

        if (!name || !email || !specialty || !availability || availability.length === 0 || !qualification || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role: 'doctor',
            },
        });

        const doctor = await prisma.doctor.create({
            data: {
                name,
                specialty,
                userId: newUser.id,
                image: '/api/placeholder/64/64',
                rating: 4.8,
            },
        });

        const availabilityData = availability.map((slot: any) => ({
            doctorId: doctor.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
        }));

        await prisma.availability.createMany({ data: availabilityData });

        await prisma.availability.createMany({
            data: availabilityData,
        });

        return NextResponse.json(
            { message: 'Doctor and availability added successfully', doctorId: doctor.id },
            { status: 201 }
        );
    } catch (err: any) {
        console.error('[ADD_DOCTOR_ERROR]', err.message || err, err.stack || '');
        return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
    }
}