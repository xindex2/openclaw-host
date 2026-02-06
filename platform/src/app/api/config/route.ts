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
        const { userId, provider, apiKey, channel, channelToken } = await req.json();

        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const config = await prisma.botConfig.upsert({
            where: { id: (await prisma.botConfig.findFirst({ where: { userId } }))?.id || 'new' },
            update: { provider, apiKey, channel, channelToken },
            create: { userId, provider, apiKey, channel, channelToken },
        });

        return NextResponse.json(config);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
