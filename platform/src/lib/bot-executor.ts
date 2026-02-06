import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const processes: Record<string, ChildProcess> = {};

export async function startBot(userId: string) {
    if (processes[userId]) {
        throw new Error('Bot is already running');
    }

    const config = await prisma.botConfig.findFirst({ where: { userId } });
    if (!config) throw new Error('No configuration found');

    // Create temporary config file
    const configsDir = path.join(process.cwd(), 'configs');
    if (!fs.existsSync(configsDir)) fs.mkdirSync(configsDir);

    const configPath = path.join(configsDir, `${userId}.json`);
    const nanobotConfig = {
        providers: {
            [config.provider]: {
                apiKey: config.apiKey
            }
        },
        agents: {
            defaults: {
                model: config.model || "openai/gpt-4o"
            }
        },
        channels: {
            [config.channel]: {
                enabled: true,
                token: config.channelToken
            }
        },
        tools: {
            restrictToWorkspace: true
        }
    };

    fs.writeFileSync(configPath, JSON.stringify(nanobotConfig, null, 2));

    // Workspace for this user
    const workspacePath = path.join(process.cwd(), 'workspaces', userId);
    if (!fs.existsSync(workspacePath)) fs.mkdirSync(workspacePath, { recursive: true });

    // Spawn nanobot
    // We point to the nanobot root directory since we're in /platform
    const nanobotRoot = path.join(process.cwd(), '..');

    const child = spawn('python3', ['-m', 'nanobot', 'gateway'], {
        cwd: nanobotRoot,
        env: {
            ...process.env,
            NANOBOT_CONFIG: configPath,
            NANOBOT_WORKSPACE: workspacePath
        }
    });

    child.stdout?.on('data', (data) => console.log(`[Bot ${userId}]: ${data}`));
    child.stderr?.on('data', (data) => console.error(`[Bot error ${userId}]: ${data}`));

    child.on('close', (code) => {
        console.log(`[Bot ${userId}] stopped with code ${code}`);
        delete processes[userId];
        prisma.botConfig.updateMany({
            where: { userId },
            data: { status: 'stopped' }
        }).catch(console.error);
    });

    processes[userId] = child;

    await prisma.botConfig.updateMany({
        where: { userId },
        data: { status: 'running' }
    });

    return { success: true };
}

export async function stopBot(userId: string) {
    const child = processes[userId];
    if (!child) return { success: false, error: 'Bot is not running' };

    child.kill();
    delete processes[userId];

    await prisma.botConfig.updateMany({
        where: { userId },
        data: { status: 'stopped' }
    });

    return { success: true };
}

export function getBotStatus(userId: string) {
    return processes[userId] ? 'running' : 'stopped';
}
