import crypto from 'crypto';
import { User } from '../models/User.js';
import { query } from '../config/database.js';

export class WhopService {
    /**
     * Verify Whop webhook signature
     */
    static verifySignature(payload, signature, secret) {
        if (!signature || !secret) return false;

        const hmac = crypto.createHmac('sha256', secret);
        const digest = hmac.update(payload).digest('hex');

        return signature === digest;
    }

    /**
     * Process Whop Webhook Event
     */
    static async handleEvent(event) {
        // Log structure for debugging
        console.log(`[Whop] Webhook Body Keys: ${Object.keys(event).join(', ')}`);

        // Whop V2 structure is { action: '...', data: { ... } }
        // For testing/compatibility, handle flat structures too
        let eventType = event.action || event.event_type || event.type;
        let data = event.data || event;

        // Fallback for inferred event types if testing with raw objects
        if (!eventType) {
            if (data.id?.startsWith('mem_')) eventType = 'membership.manual_sync';
            else if (data.id?.startsWith('pay_')) eventType = 'payment.manual_sync';
            else eventType = 'generic.event';
        }

        console.log(`[Whop] Processing event: ${eventType}`);

        // Extract identifiers with safe fallbacks
        const whopUserId = data.user_id || data.customer_id || data.user?.id || 'unknown_user';
        const email = data.email || data.user?.email || 'unknown@whop.com';

        // Log event to database
        await query(
            'INSERT INTO whop_events (event_type, whop_user_id, email, payload) VALUES ($1, $2, $3, $4)',
            [eventType, whopUserId, email, JSON.stringify(event)]
        );

        switch (eventType) {
            case 'membership.activated':
            case 'membership_activated':
            case 'membership.updated':
            case 'membership_updated':
                await this.handleMembershipActivated(data);
                break;

            case 'membership.deactivated':
            case 'membership_deactivated':
                await this.handleMembershipDeactivated(data);
                break;

            case 'payment.succeeded':
            case 'payment_succeeded':
            case 'invoice.paid':
            case 'invoice_paid':
                await this.handlePaymentSucceeded(data);
                break;

            // Add other event handlers as needed
            default:
                console.log(`[Whop] No specific handler for event: ${eventType}`);
        }
    }

    static async handleMembershipActivated(data) {
        const { user_id, email, plan_id, id: membership_id } = data;

        let user = await User.findByEmail(email);

        if (!user) {
            console.log(`[Whop] Creating new user for ${email}`);
            user = await User.create({
                full_name: data.username || email.split('@')[0],
                email,
                whop_user_id: user_id,
                acquisition_source: 'Whop'
            });
        } else if (!user.whop_user_id) {
            await User.update(user.id, { whop_user_id: user_id });
        }

        // Get limits for this plan
        const planConfig = await this.getPlanConfig(plan_id);

        // Update subscription
        await query(`
            INSERT INTO subscriptions (user_id, plan, max_instances, whop_membership_id, whop_plan_id, status)
            VALUES ($1, $2, $3, $4, $5, 'active')
            ON CONFLICT (user_id) DO UPDATE SET 
                plan = $2, 
                max_instances = $3, 
                whop_membership_id = $4, 
                whop_plan_id = $5, 
                status = 'active',
                updated_at = CURRENT_TIMESTAMP
        `, [user.id, planConfig.plan_name, planConfig.max_instances, membership_id, plan_id]);

        console.log(`[Whop] Membership activated for user ${user.id} (${planConfig.plan_name})`);
    }

    static async handleMembershipDeactivated(data) {
        const { id: membership_id } = data;

        await query(`
            UPDATE subscriptions 
            SET status = 'deactivated', updated_at = CURRENT_TIMESTAMP 
            WHERE whop_membership_id = $1
        `, [membership_id]);

        console.log(`[Whop] Membership deactivated: ${membership_id}`);
    }

    static async handlePaymentSucceeded(data) {
        // Find user by email or whop_user_id
        const email = data.email;
        const user = await User.findByEmail(email);

        if (user) {
            console.log(`[Whop] Payment succeeded for user ${user.id}`);
            // Logic to extend subscription or update status if needed
        }
    }

    static async getPlanConfig(whop_plan_id) {
        const result = await query(
            'SELECT plan_name, max_instances FROM whop_plans_config WHERE whop_plan_id = $1',
            [whop_plan_id]
        );

        if (result.rows.length > 0) {
            return result.rows[0];
        }

        // Default plan if not configured
        return {
            plan_name: 'Whop Standard',
            max_instances: 1
        };
    }

    static async getSetting(key) {
        const result = await query('SELECT value FROM settings WHERE key = $1', [key]);
        return result.rows.length > 0 ? result.rows[0].value : process.env[key];
    }
}
