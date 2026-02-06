// Bot executor logic for managing nanobot instances
import { spawn, ChildProcess, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// Process cache keyed by BOT CONFIG ID (allowing multiple bots per user)
const processes: Record<string, ChildProcess> = {};

export async function startBot(configId: string) {
    // 1. Attempt to kill any legacy or orphaned processes for this specific config
    try {
        const killCmd = `pkill -f "nanobot.*${configId}.json" || true`;
        execSync(killCmd);
        console.log(`[Bot ${configId}] Checked and cleaned existing processes.`);
    } catch (e) {
        console.warn(`[Bot ${configId}] Cleanup error (non-fatal):`, e);
    }

    if (processes[configId]) {
        try {
            processes[configId].kill('SIGKILL');
            delete processes[configId];
        } catch (e) { }
    }

    const config = await prisma.botConfig.findUnique({ where: { id: configId } });
    if (!config) throw new Error('Bot configuration not found.');

    // Create temporary config file
    const configsDir = path.join(process.cwd(), 'configs');
    if (!fs.existsSync(configsDir)) fs.mkdirSync(configsDir, { recursive: true });

    const configPath = path.join(configsDir, `${config.id}.json`);
    const workspacePath = path.join(process.cwd(), 'workspaces', config.userId, config.id);
    if (!fs.existsSync(workspacePath)) fs.mkdirSync(workspacePath, { recursive: true });

    // Build Nanobot configuration object matching nanobot/config/schema.py
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
        console.log(`[Bot ${config.name}] Using venv python: ${pythonPath}`);
    } else {
        console.log(`[Bot ${config.name}] Using system python: ${pythonPath}`);
    }

    const child = spawn(pythonPath, ['-m', 'nanobot', 'gateway'], {
        cwd: nanobotRoot,
        env: {
            ...env,
            NANOBOT_CONFIG: configPath,
            NANOBOT_WORKSPACE: workspacePath
        }
    });

    child.stdout?.on('data', (data) => console.log(`[Bot ${config.name}]: ${data}`));
    child.stderr?.on('data', (data) => console.error(`[Bot error ${config.name}]: ${data}`));

    child.on('close', (code) => {
        console.log(`[Bot ${config.name}] stopped with code ${code}`);
        delete processes[configId];
        prisma.botConfig.update({
            where: { id: configId },
            data: { status: 'stopped' }
        }).catch(console.error);
    });

    processes[configId] = child;

    await prisma.botConfig.update({
        where: { id: configId },
        data: { status: 'running' }
    });

    return { success: true };
}

export async function stopBot(configId: string) {
    // Robust kill by config ID reference in command line
    try {
        execSync(`pkill -f "nanobot.*${configId}.json" || true`);
    } catch (e) { }

    const child = processes[configId];
    if (child) {
        child.kill('SIGTERM');
        setTimeout(() => {
            try { child.kill('SIGKILL'); } catch (e) { }
        }, 1000);
        delete processes[configId];
    }

    await prisma.botConfig.update({
        where: { id: configId },
        data: { status: 'stopped' }
    });

    return { success: true };
}

export function getBotStatus(configId: string) {
    return processes[configId] ? 'running' : 'stopped';
}

export async function killAllUserProcesses(userId: string) {
    const configs = await prisma.botConfig.findMany({ where: { userId } });
    for (const config of configs) {
        await stopBot(config.id);
    }
}
