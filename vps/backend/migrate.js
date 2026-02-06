import { query } from './src/config/database.js';

async function migrate() {
    try {
        console.log('Running migration: Adding role column to users table...');
        await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';");

        console.log('Running migration: Ensuring subscriptions table has UNIQUE(user_id)...');
        // Check if constraint exists, if not add it
        await query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_subscription'
                ) THEN
                    ALTER TABLE subscriptions ADD CONSTRAINT unique_user_subscription UNIQUE (user_id);
                END IF;
            END $$;
        `);

        console.log('✅ Migration successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
