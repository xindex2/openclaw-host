import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { Instance } from '../models/Instance.js';
import { User } from '../models/User.js';
import { DockerService } from '../services/docker.js';
import fs from 'fs';
import path from 'path';
import { query } from '../config/database.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all instances for current user
router.get('/', async (req, res) => {
    try {
        const instances = await Instance.findByUserId(req.user.id);

        // Get status for each instance
        const instancesWithStatus = await Promise.all(
            instances.map(async (instance) => {
                let containerStatus = null;
                if (instance.container_id) {
                    containerStatus = await DockerService.getContainerStatus(instance.container_id);
                }
                return {
                    ...instance,
                    containerStatus,
                };
            })
        );

        res.json({ instances: instancesWithStatus });
    } catch (error) {
        console.error('Error fetching instances:', error);
        res.status(500).json({ error: 'Failed to fetch instances' });
    }
});

// Get single instance
router.get('/:id', param('id').isInt(), async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const instance = await Instance.findById(req.params.id);

        if (!instance) {
            return res.status(404).json({ error: 'Instance not found' });
        }

        if (instance.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get container status
        let containerStatus = null;
        if (instance.container_id) {
            containerStatus = await DockerService.getContainerStatus(instance.container_id);
        }

        res.json({
            instance: {
                ...instance,
                containerStatus,
            },
        });
    } catch (error) {
        console.error('Error fetching instance:', error);
        res.status(500).json({ error: 'Failed to fetch instance' });
    }
});

// Create new instance
router.post(
    '/',
    [
        body('subdomain')
            .trim()
            .isLength({ min: 3, max: 30 })
            .matches(/^[a-z0-9-]+$/)
            .withMessage('Subdomain must be lowercase alphanumeric with hyphens'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { subdomain } = req.body;

            // Check if subdomain is already taken
            const existing = await Instance.findBySubdomain(subdomain);
            if (existing) {
                return res.status(409).json({ error: 'Subdomain already taken' });
            }

            // Check instance limit
            const userWithSub = await User.findWithSubscription(req.user.id);
            const maxInstances = userWithSub.max_instances !== null && userWithSub.max_instances !== undefined ? userWithSub.max_instances : 0;
            const currentCount = await Instance.countByUserId(req.user.id);

            if (currentCount >= maxInstances) {
                if (maxInstances === 0) {
                    return res.status(403).json({
                        error: 'You need to upgrade your plan to create an agent.',
                    });
                }
                return res.status(403).json({
                    error: `Instance limit reached. Your plan allows ${maxInstances} instance(s).`,
                });
            }

            // Allocate ports globally to avoid collisions
            const portResult = await query('SELECT MAX(ssh_port) as last_ssh, MAX(gateway_port) as last_gateway FROM instances');
            const sshPort = (portResult.rows[0].last_ssh || 2222) + 1;
            const gatewayPort = (portResult.rows[0].last_gateway || 3000) + 1;

            // Create instance record
            const instance = await Instance.create({
                userId: req.user.id,
                subdomain,
                sshPort,
                gatewayPort,
            });

            // Determine base domain from request if not set in ENV
            const host = req.headers.host || '';
            const baseDomain = process.env.BASE_DOMAIN || (host.includes('.') ? host.split('.').slice(-2).join('.') : host.split(':')[0]);

            // Create Docker container
            try {
                const container = await DockerService.createContainer(
                    instance.id,
                    subdomain,
                    instance.gateway_port,
                    instance.ssh_port,
                    baseDomain
                );

                // Save container ID to database
                await Instance.updateContainerId(instance.id, container.id);

                // Start container
                await DockerService.startContainer(container.id);

                // Setup container with required packages in background
                // We don't await this so the user gets an immediate response
                DockerService.setupContainer(container.id).catch(err => {
                    console.error(`Background setup failed for ${container.id}:`, err);
                });

                // Update instance status immediately
                await Instance.updateStatus(instance.id, 'running');

                res.status(201).json({
                    message: 'Instance created successfully',
                    instance: {
                        ...instance,
                        container_id: container.id,
                        status: 'running',
                    },
                });
            } catch (error) {
                // Clean up instance record if container creation fails
                await Instance.delete(instance.id);
                throw error;
            }
        } catch (error) {
            console.error('Error creating instance:', error);
            res.status(500).json({ error: 'Failed to create instance' });
        }
    }
);

// Start instance
router.post('/:id/start', param('id').isInt(), async (req, res) => {
    try {
        const instance = await Instance.findById(req.params.id);

        if (!instance) {
            return res.status(404).json({ error: 'Instance not found' });
        }

        if (instance.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!instance.container_id) {
            return res.status(400).json({ error: 'Container not found' });
        }

        await DockerService.startContainer(instance.container_id);

        // Ensure permissions and env are setup (fixes EACCES for existing volumes)
        DockerService.setupContainer(instance.container_id).catch(err => {
            console.error(`Background setup failed during boot for ${instance.container_id}:`, err);
        });

        await Instance.updateStatus(instance.id, 'running');

        res.json({ message: 'Instance started successfully' });
    } catch (error) {
        console.error('Error starting instance:', error);
        res.status(500).json({ error: 'Failed to start instance' });
    }
});

// Stop instance
router.post('/:id/stop', param('id').isInt(), async (req, res) => {
    try {
        const instance = await Instance.findById(req.params.id);

        if (!instance) {
            return res.status(404).json({ error: 'Instance not found' });
        }

        if (instance.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!instance.container_id) {
            return res.status(400).json({ error: 'Container not found' });
        }

        await DockerService.stopContainer(instance.container_id);
        await Instance.updateStatus(instance.id, 'stopped');

        res.json({ message: 'Instance stopped successfully' });
    } catch (error) {
        console.error('Error stopping instance:', error);
        res.status(500).json({ error: 'Failed to stop instance' });
    }
});

// Delete instance
router.delete('/:id', param('id').isInt(), async (req, res) => {
    try {
        const instance = await Instance.findById(req.params.id);

        if (!instance) {
            return res.status(404).json({ error: 'Instance not found' });
        }

        if (instance.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Remove Docker container
        if (instance.container_id) {
            try {
                await DockerService.removeContainer(instance.container_id);
            } catch (dockerError) {
                console.warn(`Container delete failed for ${instance.container_id}, proceeding with DB deletion.`);
            }
        }

        // Delete instance record
        await Instance.delete(instance.id);

        // Clean up persistent files
        const INSTANCES_DIR = process.env.INSTANCES_DIR || '/opt/openclaw-instances';
        const instanceDir = path.join(INSTANCES_DIR, instance.subdomain);
        if (fs.existsSync(instanceDir)) {
            try {
                fs.rmSync(instanceDir, { recursive: true, force: true });
                console.log(`Cleaned up persistence directory for ${instance.subdomain}`);
            } catch (fsError) {
                console.error(`Failed to clean up directory ${instanceDir}:`, fsError);
            }
        }

        res.json({ message: 'Instance deleted successfully' });
    } catch (error) {
        console.error('Error deleting instance:', error);
        res.status(500).json({ error: 'Failed to delete instance' });
    }
});

// Get instance logs
router.get('/:id/logs', param('id').isInt(), async (req, res) => {
    try {
        const instance = await Instance.findById(req.params.id);

        if (!instance) {
            return res.status(404).json({ error: 'Instance not found' });
        }

        if (instance.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!instance.container_id) {
            return res.status(400).json({ error: 'Container not found' });
        }

        const logs = await DockerService.getContainerLogs(instance.container_id, 100);

        res.json({ logs });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

export default router;
