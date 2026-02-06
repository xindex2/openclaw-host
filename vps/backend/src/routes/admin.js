import express from 'express';
import os from 'os';
import { User } from '../models/User.js';
import { Instance } from '../models/Instance.js';
import { authenticateToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { query } from '../config/database.js';
import { SystemService } from '../services/SystemService.js';
import { DockerService } from '../services/docker.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

// --- User Management ---

// Get all users with pagination and search
router.get('/users', async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];

        if (search) {
            whereClause = 'WHERE u.full_name ILIKE $1 OR u.email ILIKE $1';
            params.push(`%${search}%`);
        }

        const countResult = await query(`SELECT COUNT(*) FROM users u ${whereClause}`, params);
        const totalUsers = parseInt(countResult.rows[0].count);

        params.push(limit, offset);
        const result = await query(`
            SELECT u.id, u.full_name, u.email, u.role, u.is_active, u.created_at, u.acquisition_source, u.whop_user_id,
                   s.plan, s.max_instances,
                   COUNT(i.id) as agent_count
            FROM users u
            LEFT JOIN subscriptions s ON u.id = s.user_id
            LEFT JOIN instances i ON u.id = i.user_id
            ${whereClause}
            GROUP BY u.id, s.id
            ORDER BY u.created_at DESC
            LIMIT $${params.length - 1} OFFSET $${params.length}
        `, params);

        res.json({
            users: result.rows,
            pagination: {
                total: totalUsers,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalUsers / limit)
            }
        });
    } catch (error) {
        console.error('Admin Fetch Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update user (role, plan, status)
router.patch('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { role, is_active, plan } = req.body;

        const updates = {};
        if (role) updates.role = role;
        if (typeof is_active === 'boolean') updates.is_active = is_active;

        const user = await User.update(id, updates);

        // Update plan in subscriptions table if provided
        if (plan) {
            let maxInstances = 1;
            if (plan === 'One Agent') maxInstances = 1;
            else if (plan === '5 Agents') maxInstances = 5;
            else if (plan === '10 Agents') maxInstances = 10;
            else if (plan === 'Enterprise') maxInstances = 100;

            await query(`
                INSERT INTO subscriptions (user_id, plan, max_instances)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id) DO UPDATE SET plan = $2, max_instances = $3
            `, [id, plan, maxInstances]);
        }

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Admin Update User Error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'You cannot delete yourself' });
        }
        await User.delete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Admin Delete User Error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// --- Agent Management ---

// Get all agents with pagination and search
router.get('/instances', async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];

        if (search) {
            whereClause = 'WHERE i.subdomain ILIKE $1 OR u.full_name ILIKE $1 OR u.email ILIKE $1';
            params.push(`%${search}%`);
        }

        const countResult = await query(`
            SELECT COUNT(*) 
            FROM instances i 
            JOIN users u ON i.user_id = u.id 
            ${whereClause}
        `, params);
        const totalAgents = parseInt(countResult.rows[0].count);

        params.push(limit, offset);
        const result = await query(`
            SELECT i.*, u.full_name as owner_name, u.email as owner_email
            FROM instances i
            JOIN users u ON i.user_id = u.id
            ${whereClause}
            ORDER BY i.created_at DESC
            LIMIT $${params.length - 1} OFFSET $${params.length}
        `, params);

        res.json({
            agents: result.rows,
            pagination: {
                total: totalAgents,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalAgents / limit)
            }
        });
    } catch (error) {
        console.error('Admin Fetch Agents Error:', error);
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
});

// --- Stats & Usage ---

router.get('/stats', async (req, res) => {
    try {
        const userCount = await query('SELECT COUNT(*) FROM users');
        const agentCount = await query('SELECT COUNT(*) FROM instances');
        const activeAgents = await query("SELECT COUNT(*) FROM instances WHERE status = 'running'");

        // Growth over last 7 days
        const growth = await query(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM users
            WHERE created_at > CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Plan breakdown
        const planBreakdown = await query(`
            SELECT plan, COUNT(*) as count 
            FROM subscriptions 
            GROUP BY plan
        `);

        // System Stats
        const hostStats = await SystemService.getHostStats();
        const agentStats = await SystemService.getAgentStats();

        res.json({
            summary: {
                totalUsers: parseInt(userCount.rows[0].count),
                totalAgents: parseInt(agentCount.rows[0].count),
                activeAgents: parseInt(activeAgents.rows[0].count),
            },
            growth: growth.rows,
            plans: planBreakdown.rows,
            system: hostStats,
            agentUsage: agentStats
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// --- Whop Configuration ---

// Get Whop plans mapping
router.get('/whop/plans', async (req, res) => {
    try {
        const result = await query('SELECT * FROM whop_plans_config ORDER BY created_at DESC');
        res.json({ plans: result.rows });
    } catch (error) {
        console.error('Admin Fetch Whop Plans Error:', error);
        res.status(500).json({ error: 'Failed to fetch Whop plans' });
    }
});

// Update/Create Whop plan mapping
router.post('/whop/plans', async (req, res) => {
    try {
        const { whop_plan_id, plan_name, max_instances } = req.body;
        await query(`
            INSERT INTO whop_plans_config (whop_plan_id, plan_name, max_instances)
            VALUES ($1, $2, $3)
            ON CONFLICT (whop_plan_id) DO UPDATE SET plan_name = $2, max_instances = $3
        `, [whop_plan_id, plan_name, max_instances]);
        res.json({ message: 'Whop plan configuration updated' });
    } catch (error) {
        console.error('Admin Update Whop Plan Error:', error);
        res.status(500).json({ error: 'Failed to update Whop plan' });
    }
});

// Delete Whop plan mapping
router.delete('/whop/plans/:id', async (req, res) => {
    try {
        await query('DELETE FROM whop_plans_config WHERE id = $1', [req.params.id]);
        res.json({ message: 'Whop plan configuration deleted' });
    } catch (error) {
        console.error('Admin Delete Whop Plan Error:', error);
        res.status(500).json({ error: 'Failed to delete Whop plan' });
    }
});

// Get Whop settings (API Key, Webhook Secret)
router.get('/whop/settings', async (req, res) => {
    try {
        const result = await query("SELECT key, value FROM settings WHERE key IN ('WHOP_API_KEY', 'WHOP_WEBHOOK_SECRET')");
        const settings = {};
        result.rows.forEach(r => {
            settings[r.key] = r.value;
        });
        res.json({ settings });
    } catch (error) {
        console.error('Admin Fetch Whop Settings Error:', error);
        res.status(500).json({ error: 'Failed to fetch Whop settings' });
    }
});

// Update Whop settings
router.post('/whop/settings', async (req, res) => {
    try {
        const { WHOP_API_KEY, WHOP_WEBHOOK_SECRET } = req.body;
        if (WHOP_API_KEY !== undefined) {
            await query("INSERT INTO settings (key, value) VALUES ('WHOP_API_KEY', $1) ON CONFLICT (key) DO UPDATE SET value = $1", [WHOP_API_KEY]);
            process.env.WHOP_API_KEY = WHOP_API_KEY;
        }
        if (WHOP_WEBHOOK_SECRET !== undefined) {
            await query("INSERT INTO settings (key, value) VALUES ('WHOP_WEBHOOK_SECRET', $1) ON CONFLICT (key) DO UPDATE SET value = $1", [WHOP_WEBHOOK_SECRET]);
            process.env.WHOP_WEBHOOK_SECRET = WHOP_WEBHOOK_SECRET;
        }
        res.json({ message: 'Whop settings updated' });
    } catch (error) {
        console.error('Admin Update Whop Settings Error:', error);
        res.status(500).json({ error: 'Failed to update Whop settings' });
    }
});

// Get system stats
router.get('/system-stats', async (req, res) => {
    try {
        const stats = {
            os: {
                platform: os.platform(),
                release: os.release(),
                uptime: os.uptime(),
                loadavg: os.loadavg(),
            },
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                usage: (1 - os.freemem() / os.totalmem()) * 100,
            },
            cpus: os.cpus().length,
            hostname: os.hostname(),
        };

        // Get basic docker stats if possible
        let dockerStats = { containers: 0, running: 0 };
        try {
            const { DockerService } = await import('../services/docker.js');
            // We'd need to add a listContainers method to DockerService or call dockerode directly
            // For now, let's just return system stats
        } catch (e) { }

        res.json({ stats, docker: dockerStats });
    } catch (error) {
        console.error('Admin System Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch system stats' });
    }
});

// --- Bot Maintenance ---

// Trigger bot image rebuild
router.post('/maintenance/bot/rebuild', async (req, res) => {
    try {
        const io = req.app.get('io');
        // Run in background but respond 202
        DockerService.rebuildBotImage(io).catch(err => {
            console.error('Background build failed:', err);
        });
        res.status(202).json({ message: 'Bot image rebuild started in background.' });
    } catch (error) {
        console.error('Admin Rebuild Bot Error:', error);
        res.status(500).json({ error: 'Failed to start rebuild process' });
    }
});

// Trigger openclaw update in all containers
router.post('/maintenance/bot/update-all', async (req, res) => {
    try {
        const io = req.app.get('io');
        // Run in background but respond 202
        DockerService.updateAllAgents(io).catch(err => {
            console.error('Background global update failed:', err);
        });
        res.status(202).json({ message: 'Global agent update started in background.' });
    } catch (error) {
        console.error('Admin Update All Agents Error:', error);
        res.status(500).json({ error: 'Failed to start global update process' });
    }
});

export default router;
