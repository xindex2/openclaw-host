require('dotenv').config();

module.exports = {
    apps: [
        {
            name: 'openclaw-backend',
            script: './backend/src/server.js',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
                // Database Config (Matches the migration script)
                DB_HOST: process.env.DB_HOST || '127.0.0.1',
                DB_PORT: process.env.DB_PORT || 5432,
                DB_NAME: process.env.DB_NAME || 'openclaw_host',
                DB_USER: process.env.DB_USER || 'openclaw',
                DB_PASSWORD: process.env.DB_PASSWORD || 'your_secure_password',
                // Redis
                REDIS_HOST: '127.0.0.1',
                REDIS_PORT: 6379,
                // App Config
                BASE_DOMAIN: process.env.BASE_DOMAIN || 'openclaw-host.com',
                // Storage for instances
                INSTANCES_DIR: '/opt/openclaw-instances',
                DOCKER_SOCKET: '/var/run/docker.sock'
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G'
        }
    ]
};
