import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { Instance } from '../models/Instance.js';

// Base directory for all instances
const INSTANCES_DIR = process.env.INSTANCES_DIR || '/opt/openclaw-instances';

export class ProcessService {
    // Initialize: Create base directory
    static async initialize() {
        try {
            await fs.mkdir(INSTANCES_DIR, { recursive: true });
        } catch (error) {
            console.error('Error creating instances directory:', error);
        }
    }

    // Create a new "Instance" (Directory + Setup)
    static async createContainer(instanceId, subdomain) {
        try {
            const instanceDir = path.join(INSTANCES_DIR, subdomain);

            // 1. Create Directory
            await fs.mkdir(instanceDir, { recursive: true });

            // 2. Initialize minimal environment (mocking what Docker image had)
            // Since we are running on Host, we inherit the Host's tools (git, node, openclaw).
            // We just need a clean workspace.

            console.log(`✅ Created workspace for instance ${instanceId}: ${instanceDir}`);

            // We return a "soft" ID (the directory path) to track it, instead of a container ID
            return { id: subdomain, dir: instanceDir };

        } catch (error) {
            console.error('Error creating instance workspace:', error);
            throw error;
        }
    }

    // "Start" container (No-op in PM2 mode as files just exist)
    static async startContainer(containerId) {
        return true;
    }

    // "Stop" container (No-op, maybe kill processes if we tracked PIDs?)
    static async stopContainer(containerId) {
        // In a real PM2 implementation, we might restart the specific PM2 process for this bot.
        // For now, we assume "Stop" just means "Close Terminal".
        return true;
    }

    // Remove instance (Delete Directory)
    static async removeContainer(containerId) {
        try {
            // containerId in this new system IS the subdomain/folder name usually
            // But let's look up the instance to be sure? 
            // The frontend passes the 'containerId' stored in DB.
            // If we stored the subdomain as the containerId, we use that.

            const instanceDir = path.join(INSTANCES_DIR, containerId); // assuming containerId == subdomain

            await fs.rm(instanceDir, { recursive: true, force: true });
            console.log(`✅ Removed workspace: ${instanceDir}`);
            return true;
        } catch (error) {
            console.error('Error removing workspace:', error);
            throw error;
        }
    }

    // Get Status (Check if directory exists)
    static async getContainerStatus(containerId) {
        try {
            const instanceDir = path.join(INSTANCES_DIR, containerId);
            await fs.access(instanceDir);
            return {
                id: containerId,
                status: 'running', // Always "running" if folder exists
                running: true,
                startedAt: new Date().toISOString(),
            };
        } catch {
            return null;
        }
    }

    // Exec Command (Run in the directory)
    static async execCommand(containerId, cmd) {
        try {
            const instanceDir = path.join(INSTANCES_DIR, containerId);

            // Parse command
            const commandString = Array.isArray(cmd) ? cmd.join(' ') : cmd;

            return new Promise((resolve, reject) => {
                const child = spawn(commandString, {
                    shell: true,
                    cwd: instanceDir, // Execute IN the bot's folder
                    env: { ...process.env, HOME: instanceDir } // Fake the HOME directory
                });

                let output = '';
                child.stdout.on('data', d => output += d);
                child.stderr.on('data', d => output += d);

                child.on('close', (code) => {
                    resolve(output);
                });

                child.on('error', reject);
            });
        } catch (error) {
            console.error('Error executing command:', error);
            throw error;
        }
    }

    // Setup (No-op, host has tools)
    static async setupContainer(containerId) {
        return true;
    }
}
