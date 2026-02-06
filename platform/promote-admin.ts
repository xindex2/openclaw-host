import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'ezzakyyy@gmail.com';
    console.log(`Promoting ${email} to admin...`);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: { role: 'admin' },
            create: {
                email,
                password: 'CHANGE_ME_NOW', // Temporary password for initial login if user doesn't exist
                full_name: 'Super Admin',
                role: 'admin',
                acquisition_source: 'System'
            }
        });
        console.log(`Success: User ${user.email} is now an ${user.role}`);
    } catch (e: any) {
        console.error('Promotion failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
