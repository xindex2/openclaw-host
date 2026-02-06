import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import pool from './config/database.js';
import authRoutes from './routes/auth.js';
import instanceRoutes from './routes/instances.js';
import adminRoutes from './routes/admin.js';
import whopRoutes from './routes/webhooks/whop.js';
import { TerminalService } from './services/terminal.js';
import { Instance } from './models/Instance.js';
import { pathRouter } from './middleware/pathRouter.js';

// Environment variables already loaded via import above

const app = express();
app.set('trust proxy', 1); // Trust Nginx/Cloudflare proxy (MUST BE BEFORE MIDDLEWARE)
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    },
});
app.set('io', io);

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this';

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/instances', instanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks/whop', whopRoutes);

// Socket.io authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.userId;
        socket.full_name = decoded.full_name;

        next();
    } catch (error) {
        next(new Error('Authentication failed'));
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.full_name} (${socket.userId})`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Handle terminal connection
    socket.on('terminal:connect', async (data) => {
        try {
            const { instanceId } = data;

            // Verify instance ownership
            const instance = await Instance.findById(instanceId);

            if (!instance) {
                socket.emit('terminal:error', { message: 'Instance not found' });
                return;
            }

            if (instance.user_id !== socket.userId) {
                socket.emit('terminal:error', { message: 'Access denied' });
                return;
            }

            let targetContainerId = instance.container_id;

            // Determine the actual container name/ID
            if (!targetContainerId) {
                targetContainerId = `openclaw-${instance.subdomain}`;
            } else if (targetContainerId === instance.subdomain) {
                // If container_id is exactly the subdomain, it needs the prefix
                targetContainerId = `openclaw-${instance.subdomain}`;
            }

            // Sync database if we corrected it
            if (instance.container_id !== targetContainerId) {
                await Instance.updateContainerId(instance.id, targetContainerId);
                instance.container_id = targetContainerId;
            }

            // Create terminal session
            const sessionId = await TerminalService.createSession(instance.container_id, socket);
            socket.terminalSessionId = sessionId;

            socket.emit('terminal:ready', { sessionId });
            console.log(`📺 Terminal session created for instance ${instanceId}`);
        } catch (error) {
            console.error('Terminal connection error:', error);
            socket.emit('terminal:error', { message: error.message });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.full_name}`);

        if (socket.terminalSessionId) {
            TerminalService.destroySession(socket.terminalSessionId);
        }
    });
});

// Path-based bot routing (/b/botname/...)
app.use(pathRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
server.listen(PORT, async () => {
    console.log(`
╔════════════════════════════════════════╗
║   🦞 OpenClaw Host API Server          ║
║                                        ║
║   Port: ${PORT.toString().padEnd(33)}║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(24)}║
║                                        ║
║   Ready to host OpenClaw instances! 🚀 ║
╚════════════════════════════════════════╝
  `);

    // Test database connection
    try {
        await pool.query('SELECT NOW()');
        console.log('✅ Database connected');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(async () => {
        await pool.end();
        process.exit(0);
    });
});
