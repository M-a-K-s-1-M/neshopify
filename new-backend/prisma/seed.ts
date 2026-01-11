import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const baseRoles = [
        { value: 'ADMIN', description: 'Администратор платформы' },
        { value: 'SITE_OWNER', description: 'Владелец интернет-магазина' },
        { value: 'CUSTOMER', description: 'Покупатель магазина' },
    ];

    for (const role of baseRoles) {
        await prisma.role.upsert({
            where: { value: role.value },
            update: { description: role.description },
            create: role,
        });
    }
}

main()
    .catch((error) => {
        console.error('Seed failed', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
