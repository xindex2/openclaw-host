import { Instance } from '../models/Instance.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

const BASE_DOMAIN = process.env.BASE_DOMAIN || 'openclaw-host.com';

/**
 * Middleware to handle subdomain routing
 * Proxies requests to subdomain.openclaw-host.com to the corresponding bot container
 */
export async function subdomainRouter(req, res, next) {
    try {
        // Skip API routes and health check
        if (req.path.startsWith('/api/') || req.path === '/health') {
            return next();
        }

        const hostname = req.hostname || req.get('host');

        // Parse subdomain
        const parts = hostname.split('.');

        // Check if this is a subdomain request
        // e.g., "eee.openclaw-host.com" → parts = ["eee", "openclaw-host", "com"]
        if (parts.length < 3) {
            return next(); // Not a subdomain, continue to regular routes
        }

        const subdomain = parts[0];
        const baseDomain = parts.slice(1).join('.');

        // Skip main domain and www
        if (subdomain === 'www' || baseDomain !== BASE_DOMAIN) {
            return next();
        }

        // Look up instance by subdomain
        const instance = await Instance.findBySubdomain(subdomain);

        if (!instance) {
            return res.status(404).json({
                error: 'Bot not found',
                message: `No bot found for subdomain: ${subdomain}`,
            });
        }

        // Check if instance is running
        if (instance.status !== 'running' || !instance.container_id) {
            return res.status(503).json({
                error: 'Bot not available',
                message: `The bot "${subdomain}" is currently ${instance.status || 'not running'}. Please start it from your dashboard.`,
            });
        }

        // Proxy to container's gateway port (OpenClaw default is 18789)
        const targetPort = instance.gateway_port || 18789;
        const target = `http://127.0.0.1:${targetPort}`;

        console.log(`📡 Proxying ${hostname}${req.path} → ${target}${req.path}`);

        // Create and use proxy
        const proxy = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true, // Support WebSocket
            onError: (err, req, res) => {
                console.error(`Proxy error for ${subdomain}:`, err.message);
                res.status(502).json({
                    error: 'Gateway error',
                    message: 'Failed to connect to bot. Please check if OpenClaw is running inside the container.',
                });
            },
            onProxyReq: (proxyReq, req, res) => {
                // Forward original host for proper routing in container
                proxyReq.setHeader('X-Forwarded-Host', hostname);
                proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
                proxyReq.setHeader('X-Subdomain', subdomain);
            },
        });

        return proxy(req, res, next);
    } catch (error) {
        console.error('Subdomain routing error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to route request to bot',
        });
    }
}
