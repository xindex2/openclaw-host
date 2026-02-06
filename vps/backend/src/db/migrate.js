import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load .env from backend or root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendEnv = path.join(__dirname, '../../.env');
const rootEnv = path.join(__dirname, '../../../.env');
const ecosystemPath = path.join(__dirname, '../../../ecosystem.config.cjs');

if (fs.existsSync(backendEnv)) dotenv.config({ path: backendEnv });
if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });

// Fallback: Parse ecosystem.config.cjs manually (since it's CJS and we're ESM)
if (!process.env.DB_PASSWORD && fs.existsSync(ecosystemPath)) {
    console.log('📖 Reading credentials from ecosystem.config.cjs...');
    const ecosystem = fs.readFileSync(ecosystemPath, 'utf8');
    const getVal = (key) => {
        const match = ecosystem.match(new RegExp(`${key}:\\s*['"](.*)['"]`));
        return match ? match[1] : null;
    };

    if (!process.env.DB_HOST) process.env.DB_HOST = getVal('DB_HOST');
    if (!process.env.DB_PORT) process.env.DB_PORT = getVal('DB_PORT');
    if (!process.env.DB_NAME) process.env.DB_NAME = getVal('DB_NAME');
    if (!process.env.DB_USER) process.env.DB_USER = getVal('DB_USER');
    if (!process.env.DB_PASSWORD) process.env.DB_PASSWORD = getVal('DB_PASSWORD');
}

import pool from '../config/database.js';

async function migrate() {
    console.log('🚀 Starting migration: Adding acquisition_source to users table...');
    try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS acquisition_source VARCHAR(255) DEFAULT \'Direct\'');
        console.log('✅ Column acquisition_source added successfully.');

        // Also add plan column to users if it's missing (as used in UserManagement.jsx and User.js updates)
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT \'One Agent\'');
        console.log('✅ Column plan added successfully.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
