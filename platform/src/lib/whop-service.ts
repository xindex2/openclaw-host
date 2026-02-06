import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WhopService {
    /**
     * Verify Whop webhook signature
     */
    static verifySignature(payload: string, signature: string, secret: string) {
        if (!signature || !secret) return false;

        const hmac = crypto.createHmac('sha256', secret);
        const digest = hmac.update(payload).digest('hex');

        return signature === digest;
    }

    /**
     * Process Whop Webhook Event
     */
    static async handleEvent(event: any) {
        console.log(`[Whop] Processing event: ${event.action || event.type}`);

        let eventType = event.action || event.type;
        let data = event.data || event;

        // Log event to database
        await prisma.whopEvent.create({
            data: {
                eventType: String(eventType),
                whopUserId: data.user_id || data.customer_id || data.user?.id,
                email: data.email || data.user?.email,
                payload: JSON.stringify(event)
            }
        });

        switch (eventType) {
            case 'membership.activated':
            case 'membership.updated':
                await this.handleMembershipStatus(data, 'active');
                break;

            case 'membership.deactivated':
                await this.handleMembershipStatus(data, 'deactivated');
                break;

            default:
                console.log(`[Whop] No specific handler for event: ${eventType}`);
        }
    }

    private static async handleMembershipStatus(data: any, status: string) {
        const whopUserId = data.user_id || data.customer_id || data.user?.id;
        const email = data.email || data.user?.email;
        const planId = data.plan_id;
        const membershipId = data.id;

        if (!email) {
            console.error('[Whop] Event missing email:', data);
            return;
        }

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log(`[Whop] Creating new user for ${email}`);
            user = await prisma.user.create({
                data: {
                    email,
                    password: crypto.randomBytes(16).toString('hex'), // Random password for SaaS users
                    whop_user_id: whopUserId,
                    acquisition_source: 'Whop'
                }
            });
        } else if (!user.whop_user_id) {
            await prisma.user.update({
                where: { id: user.id },
                data: { whop_user_id: whopUserId }
            });
        }

        // Map Whop plans to instances (from legacy pricing)
        // Ke7ZeyJO29DwZ -> 1 Agent ($19)
        // 9NRNdPMrVzwi8 -> 5 Agents ($69)
        // XXO2Ey0ki51AI -> 10 Agents ($99)
        let maxInstances = 1;
        if (planId === '9NRNdPMrVzwi8') maxInstances = 5;
        if (planId === 'XXO2Ey0ki51AI') maxInstances = 10;

        await prisma.subscription.upsert({
            where: { userId: user.id },
            update: {
                status,
                maxInstances,
                whopMembershipId: membershipId,
                whopPlanId: planId
            },
            create: {
                userId: user.id,
                status,
                maxInstances,
                whopMembershipId: membershipId,
                whopPlanId: planId,
                plan: planId === 'XXO2Ey0ki51AI' ? 'Elite' : (planId === '9NRNdPMrVzwi8' ? 'Pro' : 'Starter')
            }
        });

        console.log(`[Whop] Subscription ${status} for user ${user.id} (Plan: ${planId})`);
    }
}
