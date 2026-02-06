import { Instance } from '../models/Instance.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

/**
 * Middleware to handle path-based routing
 * Proxies requests like openclaw-host.com/b/botname/ to the corresponding bot
 */
export async function pathRouter(req, res, next) {
    try {
        const host = req.headers.host || '';
        const baseDomain = process.env.BASE_DOMAIN || 'openclaw-host.com';
        let botName = null;
        let isSubdomain = false;

        // Check for subdomain routing (botName.base.com)
        if (host.endsWith('.' + baseDomain) && host !== baseDomain && host !== 'api.' + baseDomain) {
            botName = host.split('.')[0];
            isSubdomain = true;
        }

        // Final check: path routing (/b/botname)
        if (!botName && req.path.startsWith('/b/')) {
            const parts = req.path.split('/');
            if (parts.length >= 3) {
                botName = parts[2];
            }
        }

        if (!botName) {
            return next();
        }

        // Look up instance by subdomain field
        const instance = await Instance.findBySubdomain(botName);

        if (!instance) {
            return res.status(404).json({
                error: 'Bot not found',
                message: `No bot found with handle: ${botName}`,
            });
        }

        // Check if instance is running
        if (instance.status !== 'running') {
            return res.status(503).json({
                error: 'Bot not available',
                message: `The bot "${botName}" is currently ${instance.status}. Please start it from your dashboard.`,
            });
        }

        const targetPort = instance.gateway_port || 18789;
        const target = `http://127.0.0.1:${targetPort}`;

        // Create and use proxy
        const proxy = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
            pathRewrite: (path) => {
                if (isSubdomain) return path;
                // Strip the /b/botname prefix when sending to the bot
                return path.replace(new RegExp(`^/b/${botName}`), '');
            },
            onError: (err, req, res) => {
                console.error(`Proxy error for ${botName}:`, err.message);
                res.status(502).json({
                    error: 'Gateway error',
                    message: 'Failed to connect to bot gateway.',
                });
            },
        });

        return proxy(req, res, next);
    } catch (error) {
        console.error('Path routing error:', error);
        return res.status(500).json({
            error: 'Internal server error',
        });
    }
}
