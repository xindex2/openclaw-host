import { query, schemaInitialized } from '../config/database.js';

async function seedPlans() {
    // Wait for the schema to be ready (prevents race conditions)
    await schemaInitialized;

    console.log('🌱 Seeding Whop Plan Configuration...');

    const plans = [
        { id: 'plan_Ke7ZeyJO29DwZ', name: 'One Agent', limit: 1 },
        { id: 'plan_9NRNdPMrVzwi8', name: '5 Agents', limit: 5 },
        { id: 'plan_XXO2Ey0ki51AI', name: '10 Agents', limit: 10 }
    ];

    for (const plan of plans) {
        await query(`
            INSERT INTO whop_plans_config (whop_plan_id, plan_name, max_instances)
            VALUES ($1, $2, $3)
            ON CONFLICT (whop_plan_id) DO UPDATE SET 
                plan_name = $2, 
                max_instances = $3
        `, [plan.id, plan.name, plan.limit]);
        console.log(`✅ Seeded plan: ${plan.name} (${plan.id})`);
    }

    console.log('✨ Seeding complete');
}

seedPlans().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
}).then(() => process.exit(0));
