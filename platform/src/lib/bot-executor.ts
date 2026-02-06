// Bot executor logic for managing nanobot instances
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
    if (!config) throw new Error('Please save your configuration first before starting the bot.');

    // Create temporary config file
    const configsDir = path.join(process.cwd(), 'configs');
    if (!fs.existsSync(configsDir)) fs.mkdirSync(configsDir);

    const configPath = path.join(configsDir, `${userId}.json`);

    // Build Nanobot configuration object
    const nanobotConfig: any = {
        providers: {
            [config.provider]: {
                apiKey: config.apiKey,
                apiBase: config.apiBase
            }
        },
        agents: {
            defaults: {
                model: config.model
            }
        },
        channels: {},
        tools: {
            web: {
                search: {
                    apiKey: config.webSearchApiKey
                }
            },
            restrictToWorkspace: true
        }
    };

    // Add enabled channels
    if (config.telegramEnabled) {
        nanobotConfig.channels.telegram = {
            enabled: true,
            token: config.telegramToken
        };
    }
    if (config.discordEnabled) {
        nanobotConfig.channels.discord = {
            enabled: true,
            token: config.discordToken
        };
    }
    if (config.whatsappEnabled) {
        nanobotConfig.channels.whatsapp = {
            enabled: true
        };
    }
    if (config.feishuEnabled) {
        nanobotConfig.channels.feishu = {
            enabled: true,
            appId: config.feishuAppId,
            appSecret: config.feishuAppSecret
        };
    }

    fs.writeFileSync(configPath, JSON.stringify(nanobotConfig, null, 2));

    // Workspace for this user
    const workspacePath = path.join(process.cwd(), 'workspaces', userId);
    if (!fs.existsSync(workspacePath)) fs.mkdirSync(workspacePath, { recursive: true });

    // Spawn nanobot
    const nanobotRoot = path.join(process.cwd(), '..');

    // Detect python binary (prefer venv if exists)
    let pythonPath = 'python3';
    const venvPython = path.join(nanobotRoot, 'venv', 'bin', 'python3');
    if (fs.existsSync(venvPython)) {
        pythonPath = venvPython;
        console.log(`[Bot ${userId}] Using venv python: ${pythonPath}`);
    } else {
        console.log(`[Bot ${userId}] Using system python: ${pythonPath}`);
    }

    const child = spawn(pythonPath, ['-m', 'nanobot', 'gateway'], {
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
