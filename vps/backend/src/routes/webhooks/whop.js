import express from 'express';
import { WhopService } from '../../services/WhopService.js';

const router = express.Router();

// Whop Webhook Endpoint
router.post('/', express.json(), async (req, res) => {
    const signature = req.headers['x-whop-signature'];
    const webhookSecret = await WhopService.getSetting('WHOP_WEBHOOK_SECRET');

    // Signature verification disabled as requested for debugging
    /*
    if (webhookSecret) {
        const isValid = WhopService.verifySignature(
            JSON.stringify(req.body),
            signature,
            webhookSecret
        );

        if (!isValid) {
            console.warn('[Whop] Invalid webhook signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }
    } else {
        console.warn('[Whop] Webhook secret not configured, skipping signature verification');
    }
    */
    console.log('[Whop] Skipping signature verification for debugging');

    try {
        await WhopService.handleEvent(req.body);
        res.json({ received: true });
    } catch (error) {
        console.error('[Whop] Error handling webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
