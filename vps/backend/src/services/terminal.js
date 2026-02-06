import Docker from 'dockerode';
import { Instance } from '../models/Instance.js';

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock' });

// Store active terminal sessions
const sessions = new Map();

export class TerminalService {
    // Create a new terminal session (Docker Exec version)
    static async createSession(containerId, socket) {
        try {
            const container = docker.getContainer(containerId);

            // Verify container exists and is running (with retry loop for race conditions)
            let inspect;
            let retries = 10;
            while (retries > 0) {
                inspect = await container.inspect();
                if (inspect.State.Running && inspect.State.Status === 'running') break;

                if (inspect.State.Status === 'restarting') {
                    console.log(`⚠️ Container ${containerId} is stuck in RESTARTING mode. This usually means the bot is crashing.`);
                } else {
                    console.log(`⏳ Waiting for container ${containerId} to start... status: ${inspect.State.Status} (${retries} attempts left)`);
                }

                await new Promise(resolve => setTimeout(resolve, 500));
                retries--;
            }

            if (!inspect.State.Running) {
                let logSnippet = '';
                try {
                    const logs = await container.logs({ stdout: true, stderr: true, tail: 10 });
                    logSnippet = `\n\nRecent Logs:\n${logs.toString()}`;
                } catch (e) { }

                throw new Error(`Container is not running (Current state: ${inspect.State.Status})${logSnippet}`);
            }

            // Create exec instance
            let exec;
            try {
                exec = await container.exec({
                    Cmd: ['/bin/bash'],
                    AttachStdin: true,
                    AttachStdout: true,
                    AttachStderr: true,
                    Tty: true,
                    User: 'openclaw',
                    Env: [
                        'TERM=xterm-256color',
                        'LANG=en_US.UTF-8',
                        'LC_ALL=en_US.UTF-8',
                        'NODE_NO_WARNINGS=1', // Suppress deprecation warnings
                        'NODE_OPTIONS=--max-old-space-size=4096',
                        'npm_config_prefix=/home/openclaw/.npm-global',
                        'HOMEBREW_CACHE=/home/openclaw/.cache/Homebrew',
                        'HOMEBREW_LOGS=/home/openclaw/.logs/Homebrew',
                        'HOMEBREW_TEMP=/tmp',
                        'PATH=/home/openclaw/.npm-global/bin:/opt/openclaw-core/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
                    ]
                });
            } catch (execErr) {
                let logSnippet = '';
                try {
                    const logs = await container.logs({ stdout: true, stderr: true, tail: 10 });
                    logSnippet = `\n\nRecent Logs:\n${logs.toString()}`;
                } catch (e) { }
                throw new Error(`Failed to create exec session: ${execErr.message}${logSnippet}`);
            }

            // Start exec and get stream
            const stream = await exec.start({
                hijack: true,
                stdin: true
            });

            // Store session
            const sessionId = `${containerId}-${Date.now()}`;
            sessions.set(sessionId, { stream, containerId, exec });

            // Send data to client
            // Dockerode streams combine stdout and stderr when Tty is true
            stream.on('data', (data) => {
                socket.emit('terminal:data', data); // Socket.io handles Buffers automatically
            });

            // Handle input from client
            socket.on('terminal:input', (data) => {
                stream.write(data);
            });

            // Handle resize events
            socket.on('terminal:resize', async ({ cols, rows }) => {
                if (!cols || !rows) return;
                try {
                    await exec.resize({ w: cols, h: rows });
                } catch (error) {
                    // Ignore transient resize errors
                }
            });

            // Clean up on disconnect
            socket.on('disconnect', () => {
                this.destroySession(sessionId);
            });

            stream.on('end', () => {
                this.destroySession(sessionId);
                socket.emit('terminal:exit');
            });

            console.log(`✅ Created Docker terminal session: ${sessionId} `);
            return sessionId;
        } catch (error) {
            console.error('Error creating Docker terminal session:', error);
            throw error;
        }
    }

    // Destroy a terminal session
    static destroySession(sessionId) {
        const session = sessions.get(sessionId);
        if (session) {
            try {
                if (session.stream) {
                    session.stream.end();
                }
                sessions.delete(sessionId);
                console.log(`✅ Destroyed terminal session: ${sessionId} `);
            } catch (error) {
                console.error('Error destroying session:', error);
            }
        }
    }

    // Get active session count
    static getActiveSessionCount() {
        return sessions.size;
    }

    // Destroy all sessions for a container
    static destroyContainerSessions(containerId) {
        const containerSessions = Array.from(sessions.entries())
            .filter(([_, session]) => session.containerId === containerId);

        containerSessions.forEach(([sessionId]) => {
            this.destroySession(sessionId);
        });
    }
}
