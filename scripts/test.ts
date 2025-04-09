import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.create({
        data: {
            email: 'jane@example.com',
            name: 'Jane',
            role: 'resident',
        },
    })

    const resident = await prisma.resident.create({
        data: {
            name: 'Jane Doe',
            phone: '1234567890',
            userId: user.id,
        },
    })

    console.log('Created resident:', resident)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())