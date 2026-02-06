-- OpenClaw Host Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    role VARCHAR(20) DEFAULT 'user', -- 'user' or 'admin'
    acquisition_source VARCHAR(255) DEFAULT 'Direct',
    plan VARCHAR(50) DEFAULT 'One Agent',
    whop_user_id VARCHAR(100) UNIQUE
);

-- Instances table
CREATE TABLE IF NOT EXISTS instances (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    container_id VARCHAR(255) UNIQUE,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'stopped', -- stopped, running, installing, error
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_started_at TIMESTAMP,
    last_stopped_at TIMESTAMP,
    ssh_port INTEGER,
    gateway_port INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) DEFAULT 'free', -- free, basic, pro, enterprise
    status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    whop_membership_id VARCHAR(255) UNIQUE,
    whop_plan_id VARCHAR(255),
    max_instances INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Whop Plans Configuration
CREATE TABLE IF NOT EXISTS whop_plans_config (
    id SERIAL PRIMARY KEY,
    whop_plan_id VARCHAR(255) UNIQUE NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    max_instances INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Whop Events Log
CREATE TABLE IF NOT EXISTS whop_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    whop_user_id VARCHAR(100),
    email VARCHAR(255),
    payload JSONB,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    instance_id INTEGER REFERENCES instances(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_instances_user_id ON instances(user_id);
CREATE INDEX idx_instances_status ON instances(status);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_instance_id ON activity_logs(instance_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instances_updated_at BEFORE UPDATE ON instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Seed Whop Plans Configuration
INSERT INTO whop_plans_config (whop_plan_id, plan_name, max_instances)
VALUES 
    ('plan_Ke7ZeyJO29DwZ', 'One Agent', 1),
    ('plan_9NRNdPMrVzwi8', '5 Agent', 5),
    ('plan_XXO2Ey0ki51AI', '10 Agent', 10)
ON CONFLICT (whop_plan_id) DO UPDATE SET 
    plan_name = EXCLUDED.plan_name,
    max_instances = EXCLUDED.max_instances;
