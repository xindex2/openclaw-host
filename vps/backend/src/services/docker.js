import Docker from 'dockerode';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock' });

export class DockerService {
    static async createContainer(instanceId, subdomain, gatewayPort, sshPort, requestedBaseDomain = null) {
        try {
            const baseDomain = requestedBaseDomain || process.env.BASE_DOMAIN || 'openclaw-host.com';
            const protocol = process.env.PROTOCOL || 'https'; // Default to https for production look
            const externalUrl = `${protocol}://${baseDomain}/b/${subdomain}`;
            const publicUrl = `${protocol}://${subdomain}.${baseDomain}`;

            // Define instance directory for persistence
            const INSTANCES_DIR = process.env.INSTANCES_DIR || '/opt/openclaw-instances';
            const instanceDir = path.join(INSTANCES_DIR, subdomain);

            // Ensure instance directory exists and has correct permissions
            if (!fs.existsSync(instanceDir)) {
                fs.mkdirSync(instanceDir, { recursive: true });
            }
            // Grant full permissions recursively to ensure the container user (regardless of UID) can write to it
            // Using shell command for recursion since fs.chmodSync is not recursive
            try {
                execSync(`chmod -R 777 ${instanceDir}`);
            } catch (err) {
                console.warn(`Host chmod failed for ${instanceDir}:`, err.message);
                // Fallback to non-recursive for safety
                fs.chmodSync(instanceDir, 0o777);
            }

            // Define core directory for shared binaries
            const CORE_DIR = process.env.CORE_DIR || '/opt/openclaw-core';

            const container = await docker.createContainer({
                Image: 'openclaw-bot:latest', // Ensure this image is built
                name: `openclaw-${subdomain}`,
                Hostname: subdomain,
                Tty: true, // Enable Tty for better logging and interactive support
                Env: [
                    `OPENCLAW_EXTERNAL_URL=${externalUrl}`,
                    `OPENCLAW_BASE_DOMAIN=${baseDomain}`,
                    `OPENCLAW_DOMAIN=${subdomain}.${baseDomain}`,
                    `OPENCLAW_HOST=0.0.0.0`,
                    `OPENCLAW_PORT=18789`,
                    `OPENCLAW_WEB_URL=${publicUrl}`,
                    `OPENCLAW_GATEWAY_URL=${publicUrl}`,
                    `OPENCLAW_CONTROL_URL=${publicUrl}`,
                    `OPENCLAW_APP_URL=${publicUrl}`,
                    `OPENCLAW_DASHBOARD_URL=${publicUrl}`,
                    `OPENCLAW_GATEWAY_BIND=0.0.0.0`,
                    `OPENCLAW_GATEWAY_PORT=18789`,
                    `HOME=/home/openclaw`,
                    `npm_config_prefix=/home/openclaw/.npm-global`,
                    `HOMEBREW_CACHE=/home/openclaw/.cache/Homebrew`,
                    `HOMEBREW_LOGS=/home/openclaw/.logs/Homebrew`,
                    `HOMEBREW_TEMP=/tmp`,
                    `PATH=/home/openclaw/.npm-global/bin:/opt/openclaw-core/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`
                ],
                HostConfig: {
                    Binds: [
                        `${instanceDir}:/home/openclaw`,
                        `${CORE_DIR}:/opt/openclaw-core` // Shared Core mount (Read-Write for installations)
                    ],
                    PortBindings: {
                        '18789/tcp': [{ HostPort: gatewayPort.toString() }],
                        '22/tcp': [{ HostPort: sshPort.toString() }]
                    },
                    RestartPolicy: { Name: 'unless-stopped' },
                    // No resource limits: Use full server resources
                },
                ExposedPorts: {
                    '18789/tcp': {},
                    '22/tcp': {}
                },
                Labels: {
                    'openclaw.instance.id': instanceId.toString(),
                    'openclaw.subdomain': subdomain
                }
            });

            return container;
        } catch (error) {
            console.error('Error creating Docker container:', error);
            throw error;
        }
    }

    static async startContainer(containerId) {
        try {
            const container = docker.getContainer(containerId);
            await container.start();
            return true;
        } catch (error) {
            // Ignore if container is already started or not found
            if (error.statusCode === 304 || error.statusCode === 404) return true;
            console.error('Error starting container:', error);
            throw error;
        }
    }

    static async stopContainer(containerId) {
        try {
            const container = docker.getContainer(containerId);
            await container.stop();
            return true;
        } catch (error) {
            // Ignore if container is already stopped or not found
            if (error.statusCode === 304 || error.statusCode === 404) return true;
            console.error('Error stopping container:', error);
            throw error;
        }
    }

    static async removeContainer(containerId) {
        try {
            const container = docker.getContainer(containerId);
            await container.remove({ force: true });
            return true;
        } catch (error) {
            // Ignore if container is not found
            if (error.statusCode === 404) return true;
            console.error('Error removing container:', error);
            throw error;
        }
    }

    static async getContainerStatus(containerId) {
        try {
            const container = docker.getContainer(containerId);
            const data = await container.inspect();
            return {
                id: containerId,
                status: data.State.Status,
                running: data.State.Running,
                startedAt: data.State.StartedAt,
            };
        } catch (error) {
            return null;
        }
    }

    static async getContainerLogs(containerId, tail = 100) {
        try {
            const container = docker.getContainer(containerId);
            const logs = await container.logs({
                stdout: true,
                stderr: true,
                tail,
                timestamps: true
            });
            return logs.toString();
        } catch (error) {
            console.error('Error getting logs:', error);
            return 'Error fetching logs';
        }
    }

    static async setupContainer(containerId) {
        // Run any initial setup if needed inside the container
        // We add a longer retry loop (30s total) for stability
        const maxRetries = 15;
        let lastError;

        for (let i = 0; i < maxRetries; i++) {
            try {
                const container = docker.getContainer(containerId);
                const inspect = await container.inspect();

                if (inspect.State.Status !== 'running') {
                    throw new Error(`Container is in ${inspect.State.Status} state`);
                }

                const execConfig = await container.exec({
                    Cmd: ['bash', '-c', 'mkdir -p /home/openclaw/.npm-global /home/openclaw/.cache/Homebrew /home/openclaw/.logs/Homebrew /home/openclaw/.openclaw && chown -R openclaw:openclaw /home/openclaw && echo "OPENCLAW_WEB_URL=$OPENCLAW_WEB_URL\nOPENCLAW_GATEWAY_URL=$OPENCLAW_GATEWAY_URL\nOPENCLAW_CONTROL_URL=$OPENCLAW_CONTROL_URL\nOPENCLAW_APP_URL=$OPENCLAW_APP_URL\nOPENCLAW_DASHBOARD_URL=$OPENCLAW_DASHBOARD_URL\nOPENCLAW_DOMAIN=$OPENCLAW_DOMAIN\nOPENCLAW_HOST=0.0.0.0\nOPENCLAW_PORT=18789" > /home/openclaw/.openclaw/.env && chown -R openclaw:openclaw /home/openclaw/.openclaw'],
                    User: 'root'
                });
                await execConfig.start();

                console.log(`✅ Successfully initialized container and fixed permissions: ${containerId}`);
                return true;
            } catch (error) {
                lastError = error;
                // Slower retry (2s) to give Docker/System more time
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.error(`❌ Failed to setup container ${containerId} after 30s:`, lastError);

        // Final attempt: Log container logs to help see why it might be crashing/restarting
        try {
            const logs = await this.getContainerLogs(containerId, 20);
            console.error(`--- RECENT CONTAINER LOGS [${containerId}] ---\n${logs}\n--- END LOGS ---`);
        } catch (logErr) {
            console.error('Could not fetch container logs for debug.');
        }

        return false;
    }

    /**
     * Rebuild the openclaw-bot:latest image from Dockerfile.bot
     * @param {Object} socket Optional socket to stream logs to
     */
    static async rebuildBotImage(socket = null) {
        const dockerfilePath = path.join(process.cwd(), 'Dockerfile.bot');
        const contextPath = process.cwd();

        console.log(`Building image from ${dockerfilePath}`);
        if (socket) socket.emit('maintenance:log', { message: 'Starting bot image rebuild...', type: 'info' });

        try {
            const stream = await docker.buildImage({
                context: contextPath,
                src: ['Dockerfile.bot']
            }, { t: 'openclaw-bot:latest' });

            return new Promise((resolve, reject) => {
                docker.modem.followProgress(stream, (err, res) => {
                    if (err) {
                        console.error('Build error:', err);
                        if (socket) socket.emit('maintenance:log', { message: `Build failed: ${err.message}`, type: 'error' });
                        reject(err);
                    } else {
                        console.log('Build finished successfully');
                        if (socket) socket.emit('maintenance:log', { message: 'Bot image rebuilt successfully!', type: 'success' });
                        resolve(res);
                    }
                }, (event) => {
                    if (event.stream && socket) {
                        socket.emit('maintenance:log', { message: event.stream.trim(), type: 'build' });
                    }
                });
            });
        } catch (error) {
            console.error('Failed to trigger build:', error);
            if (socket) socket.emit('maintenance:log', { message: `Failed to trigger build: ${error.message}`, type: 'error' });
            throw error;
        }
    }

    /**
     * Run openclaw update in all running containers
     * @param {Object} socket Optional socket to stream logs to
     */
    static async updateAllAgents(socket = null) {
        try {
            const containers = await docker.listContainers();
            const botContainers = containers.filter(c => c.Names.some(name => name.includes('openclaw-')));

            if (botContainers.length === 0) {
                if (socket) socket.emit('maintenance:log', { message: 'No active agents found to update.', type: 'info' });
                return { updated: 0 };
            }

            if (socket) socket.emit('maintenance:log', { message: `Found ${botContainers.length} agents. Starting update...`, type: 'info' });

            const results = [];
            for (const containerInfo of botContainers) {
                const container = docker.getContainer(containerInfo.Id);
                const name = containerInfo.Names[0].replace('/', '');

                if (socket) socket.emit('maintenance:log', { message: `Updating agent: ${name}...`, type: 'info' });

                try {
                    // Detect domain info from container name/env
                    const subdomain = name.replace('openclaw-', '');
                    const baseDomain = process.env.BASE_DOMAIN || 'openclaw-host.com';
                    const protocol = process.env.PROTOCOL || 'https';
                    const publicUrl = `${protocol}://${subdomain}.${baseDomain}`;

                    // Update existing agents with the correct public URL config
                    const execConfig = await container.exec({
                        Cmd: ['bash', '-c', `mkdir -p /home/openclaw/.openclaw && echo "OPENCLAW_WEB_URL=${publicUrl}\nOPENCLAW_GATEWAY_URL=${publicUrl}\nOPENCLAW_CONTROL_URL=${publicUrl}\nOPENCLAW_APP_URL=${publicUrl}\nOPENCLAW_DASHBOARD_URL=${publicUrl}\nOPENCLAW_DOMAIN=${subdomain}.${baseDomain}\nOPENCLAW_HOST=0.0.0.0\nOPENCLAW_PORT=18789" > /home/openclaw/.openclaw/.env`],
                        User: 'root'
                    });
                    await execConfig.start();

                    const exec = await container.exec({
                        Cmd: ['npm', 'install', '-g', 'openclaw'],
                        AttachStdout: true,
                        AttachStderr: true
                    });
                    const stream = await exec.start();

                    // Optional: collect output if needed
                    // For now we just wait for it to finish
                    await new Promise((resolve, reject) => {
                        docker.modem.demuxStream(stream, process.stdout, process.stderr);
                        stream.on('end', resolve);
                        stream.on('error', reject);
                    });

                    if (socket) socket.emit('maintenance:log', { message: `✅ Agent ${name} updated.`, type: 'success' });
                    results.push({ name, status: 'success' });
                } catch (err) {
                    console.error(`Failed to update ${name}:`, err);
                    if (socket) socket.emit('maintenance:log', { message: `❌ Agent ${name} failed to update: ${err.message}`, type: 'error' });
                    results.push({ name, status: 'error', error: err.message });
                }
            }

            return { updated: results.length, details: results };
        } catch (error) {
            console.error('Global update error:', error);
            if (socket) socket.emit('maintenance:log', { message: `Global update failed: ${error.message}`, type: 'error' });
            throw error;
        }
    }
}
