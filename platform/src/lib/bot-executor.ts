// Bot executor logic for managing nanobot instances
import { spawn, ChildProcess, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const processes: Record<string, ChildProcess> = {};

export async function startBot(userId: string) {
    // 1. Attempt to kill any legacy or orphaned processes for this specific user
    try {
        // Find and kill processes running with this user's config file
        const configFileName = `${userId}.json`;
        const killCmd = `pkill -f "nanobot.*${configFileName}" || true`;
        execSync(killCmd);
        console.log(`[Bot ${userId}] Checked and cleaned existing processes.`);
    } catch (e) {
        console.warn(`[Bot ${userId}] Cleanup error (non-fatal):`, e);
    }

    if (processes[userId]) {
        try {
            processes[userId].kill('SIGKILL');
            delete processes[userId];
        } catch (e) { }
    }

    const config = await prisma.botConfig.findFirst({ where: { userId } });
    if (!config) throw new Error('Please save your configuration first before starting the bot.');

    // Create temporary config file
    const configsDir = path.join(process.cwd(), 'configs');
    if (!fs.existsSync(configsDir)) fs.mkdirSync(configsDir, { recursive: true });

    const configPath = path.join(configsDir, `${userId}.json`);
    const workspacePath = path.join(process.cwd(), 'workspaces', userId);
    if (!fs.existsSync(workspacePath)) fs.mkdirSync(workspacePath, { recursive: true });

    // Build Nanobot configuration object strictly matching nanobot/config/schema.py
    const nanobotConfig: any = {
        providers: {
            [config.provider]: {
                api_key: config.apiKey,
                api_base: config.apiBase
            }
        },
        agents: {
            defaults: {
                model: config.model,
                workspace: workspacePath,
                max_tool_iterations: config.maxToolIterations || 20
            }
        },
        channels: {
            telegram: {
                enabled: config.telegramEnabled,
                token: config.telegramToken || ""
            },
            discord: {
                enabled: config.discordEnabled,
                token: config.discordToken || ""
            },
            whatsapp: {
                enabled: config.whatsappEnabled
            },
            feishu: {
                enabled: config.feishuEnabled,
                app_id: config.feishuAppId || "",
                app_secret: config.feishuAppSecret || ""
            }
        },
        tools: {
            web: {
                search: {
                    api_key: config.webSearchApiKey || ""
                }
            },
            restrict_to_workspace: config.restrictToWorkspace || false
        },
        gateway: {
            host: config.gatewayHost || "0.0.0.0",
            port: config.gatewayPort || 18790
        }
    };

    fs.writeFileSync(configPath, JSON.stringify(nanobotConfig, null, 2));

    // Spawn nanobot
    const nanobotRoot = path.join(process.cwd(), '..');

    // Detect python binary (prefer venv if exists)
    let pythonPath = 'python3';
    let env = { ...process.env };

    const venvBin = path.join(nanobotRoot, 'venv', 'bin');
    const venvPython = path.join(venvBin, 'python3');

    if (fs.existsSync(venvPython)) {
        pythonPath = venvPython;
        env.PATH = `${venvBin}:${process.env.PATH}`;
        console.log(`[Bot ${userId}] Using venv python: ${pythonPath}`);
    } else {
        console.log(`[Bot ${userId}] Using system python: ${pythonPath}`);
    }

    const child = spawn(pythonPath, ['-m', 'nanobot', 'gateway'], {
        cwd: nanobotRoot,
        env: {
            ...env,
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
    // Robust kill
    try {
        const configFileName = `${userId}.json`;
        execSync(`pkill -f "nanobot.*${configFileName}" || true`);
    } catch (e) { }

    const child = processes[userId];
    if (child) {
        child.kill('SIGTERM');
        setTimeout(() => {
            try { child.kill('SIGKILL'); } catch (e) { }
        }, 1000);
        delete processes[userId];
    }

    await prisma.botConfig.updateMany({
        where: { userId },
        data: { status: 'stopped' }
    });

    return { success: true };
}

export function getBotStatus(userId: string) {
    return processes[userId] ? 'running' : 'stopped';
}
