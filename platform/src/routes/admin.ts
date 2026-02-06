import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Authorization middleware already handled in server.ts for /api/admin

/**
 * GET /api/admin/events
 * List Whop Webhook Events
 */
router.get('/events', async (req, res) => {
    try {
        const events = await prisma.whopEvent.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json(events);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * GET /api/admin/plans
 * List Whop Plan Mappings
 */
router.get('/plans', async (req, res) => {
    try {
        const plans = await prisma.whopPlan.findMany({
            orderBy: { maxInstances: 'asc' }
        });
        res.json(plans);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/admin/plans
 * Create or Update Plan Mapping
 */
router.post('/plans', async (req, res) => {
    const { whopPlanId, planName, maxInstances } = req.body;
    try {
        const plan = await prisma.whopPlan.upsert({
            where: { whopPlanId },
            update: { planName, maxInstances: Number(maxInstances) },
            create: { whopPlanId, planName, maxInstances: Number(maxInstances) }
        });
        res.json(plan);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * GET /api/admin/stats (Extended)
 */
router.get('/stats', async (req, res) => {
    try {
        const [totalUsers, totalAgents, activeAgents] = await Promise.all([
            prisma.user.count(),
            prisma.botConfig.count(),
            prisma.botConfig.count({ where: { status: 'running' } })
        ]);

        // Growth (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const growth = await prisma.user.findMany({
            where: { createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true }
        });

        // Group by day
        const growthMap: any = {};
        growth.forEach(u => {
            const date = u.createdAt.toISOString().split('T')[0];
            growthMap[date] = (growthMap[date] || 0) + 1;
        });

        const formattedGrowth = Object.entries(growthMap).map(([date, count]) => ({ date, count: count as number }));

        res.json({
            summary: { totalUsers, totalAgents, activeAgents },
            growth: formattedGrowth,
            system: {
                cpu: { usage: 12, cores: 8, load: '1.2, 1.5, 1.4' },
                ram: { percent: 45, used: '3.6GB', total: '8GB' },
                disk: { percent: 22, used: '44GB', total: '200GB' }
            },
            agentUsage: [] // Handled by separate endpoint or refined later
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
