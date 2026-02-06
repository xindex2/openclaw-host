import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const config = await prisma.botConfig.findFirst({ where: { userId } });
        return NextResponse.json(config || {});
    } catch (error: any) {
        console.error('Config GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, ...configData } = body;

        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const existingConfig = await prisma.botConfig.findFirst({ where: { userId } });

        // Remove any fields that don't belong in the database or are read-only
        const cleanData = { ...configData };
        delete cleanData.id;
        delete cleanData.createdAt;
        delete cleanData.updatedAt;
        delete cleanData.userId;
        delete cleanData.user;

        const config = await prisma.botConfig.upsert({
            where: { id: existingConfig?.id || 'new_config_id' },
            update: cleanData,
            create: {
                userId,
                ...cleanData
            },
        });

        return NextResponse.json(config);
    } catch (error: any) {
        console.error('Config POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
