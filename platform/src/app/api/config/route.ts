import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const config = await prisma.botConfig.findFirst({ where: { userId } });
    return NextResponse.json(config);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, ...configData } = body;

        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const existingConfig = await prisma.botConfig.findFirst({ where: { userId } });

        const config = await prisma.botConfig.upsert({
            where: { id: existingConfig?.id || 'new' },
            update: configData,
            create: { userId, ...configData },
        });

        return NextResponse.json(config);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
