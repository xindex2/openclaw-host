import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { startBot, stopBot, getBotStatus } from './src/lib/bot-executor';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// --- User Routes ---

app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.create({
            data: { email, password } // Hash password in production
        });
        res.json(user);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// --- Bot Config Routes (Multi-Agent) ---

app.get('/api/config', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    try {
        const configs = await prisma.botConfig.findMany({
            where: { userId: String(userId) }
        });
        res.json(configs);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/config', async (req, res) => {
    const { userId, id, ...configData } = req.body;
    if (!userId) return res.status(401).json({ error: 'userId is required' });

    try {
        // Ensure user exists (demo-user fallback for dev)
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user && userId === 'demo-user') {
            user = await prisma.user.create({
                data: {
                    id: 'demo-user',
                    email: 'demo@zakibot.ai',
                    password: 'demo_password_hash'
                }
            });
        }

        const data = {
            ...configData,
            userId,
            gatewayPort: parseInt(configData.gatewayPort || 18790),
            maxToolIterations: parseInt(configData.maxToolIterations || 20)
        };

        const config = await prisma.botConfig.upsert({
            where: { id: id || 'new-uuid-placeholder' },
            update: data,
            create: data
        });

        res.json(config);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/config/:id', async (req, res) => {
    try {
        await stopBot(req.params.id);
        await prisma.botConfig.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// --- Bot Control Routes ---

app.post('/api/bot/control', async (req, res) => {
    const { action, configId } = req.body;
    if (!configId) return res.status(400).json({ error: 'configId is required' });

    try {
        let result;
        if (action === 'start') {
            result = await startBot(configId);
        } else if (action === 'stop') {
            result = await stopBot(configId);
        } else if (action === 'status') {
            result = { status: getBotStatus(configId) };
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }
        res.json(result);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Zakibot Backend running on http://localhost:${PORT}`);
});
