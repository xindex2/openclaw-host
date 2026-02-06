import { query } from '../config/database.js';

async function migrate() {
    try {
        console.log('--- Migration: Adding google_id column ---');

        // Check if column exists
        const columnCheck = await query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'google_id'
        `);

        if (columnCheck.rows.length === 0) {
            console.log('Adding google_id column...');
            await query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE');
            console.log('✅ Column added successfully');
        } else {
            console.log('Column already exists, skipping.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
