import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'openclaw_host',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'devpassword',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper to ensure schema is up to date (Self-Healing)
const ensureSchema = async () => {
  console.log('🔍 Checking database schema...');
  try {
    // 1. Rename username to full_name in users table
    const checkUsername = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'username'
    `);

    if (checkUsername.rows.length > 0) {
      console.log('Renaming username to full_name...');
      await pool.query('ALTER TABLE users RENAME COLUMN username TO full_name');
    }

    // 2. Add columns if they don't exist
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100) NOT NULL DEFAULT \'Guest\''); // Ensure it exists if it wasn't there
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS acquisition_source VARCHAR(255) DEFAULT \'Direct\'');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT \'One Agent\'');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS whop_user_id VARCHAR(100) UNIQUE');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP');

    // Subscriptions table updates
    await pool.query('ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS whop_membership_id VARCHAR(255) UNIQUE');
    await pool.query('ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS whop_plan_id VARCHAR(255)');
    await pool.query('ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS max_instances INTEGER DEFAULT 1');

    // Ensure user_id is unique for ON CONFLICT queries
    try {
      await pool.query('ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id)');
    } catch (err) {
      // Ignore if constraint already exists
      if (err.code !== '42710') {
        console.error('Failed to add unique constraint to subscriptions:', err.message);
      }
    }

    // Create new tables
    await pool.query(`
        CREATE TABLE IF NOT EXISTS whop_plans_config (
            id SERIAL PRIMARY KEY,
            whop_plan_id VARCHAR(255) UNIQUE NOT NULL,
            plan_name VARCHAR(100) NOT NULL,
            max_instances INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS whop_events (
            id SERIAL PRIMARY KEY,
            event_type VARCHAR(100) NOT NULL,
            whop_user_id VARCHAR(100),
            email VARCHAR(255),
            payload JSONB,
            processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS settings (
            key VARCHAR(100) PRIMARY KEY,
            value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Database schema is up to date');
  } catch (error) {
    console.error('❌ Schema sync failed:', error.message);
  }
};

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

// Run schema sync on startup
export const schemaInitialized = ensureSchema();

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function to get a client from the pool
export const getClient = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error getting database client:', error);
    throw error;
  }
};

export default pool;
