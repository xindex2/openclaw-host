import { query } from '../config/database.js';

async function migrate() {
    console.log('Starting migration...');

    try {
        // 1. Rename username to full_name in users table
        const checkUsername = await query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'username'
        `);

        if (checkUsername.rows.length > 0) {
            console.log('Renaming username to full_name...');
            await query('ALTER TABLE users RENAME COLUMN username TO full_name');
            // Remove unique constraint on username if it exists (it was UNIQUE NOT NULL)
            // Postgres creates an index for unique constraints.
            // We want full_name to be NOT NULL but not necessarily UNIQUE (multiple people can have same name)
            // But we'll keep it simple for now and just rename.
        }

        // 2. Add whop_user_id to users
        const checkWhopUser = await query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'whop_user_id'
        `);
        if (checkWhopUser.rows.length === 0) {
            console.log('Adding whop_user_id to users...');
            await query('ALTER TABLE users ADD COLUMN whop_user_id VARCHAR(100) UNIQUE');
        }

        // 3. Add whop columns to subscriptions
        const subColumns = ['whop_membership_id', 'whop_plan_id'];
        for (const col of subColumns) {
            const checkCol = await query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'subscriptions' AND column_name = $1
            `, [col]);
            if (checkCol.rows.length === 0) {
                console.log(`Adding ${col} to subscriptions...`);
                await query(`ALTER TABLE subscriptions ADD COLUMN ${col} VARCHAR(255)`);
                if (col === 'whop_membership_id') {
                    await query('ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_whop_membership_id_key UNIQUE (whop_membership_id)');
                }
            }
        }

        // 4. Create whop_plans_config table
        console.log('Creating whop_plans_config table...');
        await query(`
            CREATE TABLE IF NOT EXISTS whop_plans_config (
                id SERIAL PRIMARY KEY,
                whop_plan_id VARCHAR(255) UNIQUE NOT NULL,
                plan_name VARCHAR(100) NOT NULL,
                max_instances INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 5. Create whop_events table
        console.log('Creating whop_events table...');
        await query(`
            CREATE TABLE IF NOT EXISTS whop_events (
                id SERIAL PRIMARY KEY,
                event_type VARCHAR(100) NOT NULL,
                whop_user_id VARCHAR(100),
                email VARCHAR(255),
                payload JSONB,
                processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
