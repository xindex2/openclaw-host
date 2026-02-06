import os from 'os';
import { exec } from 'child_process';
import util from 'util';
import Docker from 'dockerode';

const execPromise = util.promisify(exec);
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock' });

export class SystemService {
    static async getHostStats() {
        try {
            // RAM
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            const ramUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);

            // CPU Load (1 min average)
            const loads = os.loadavg();
            const cpuCount = os.cpus().length;
            const cpuUsagePercent = ((loads[0] / cpuCount) * 100).toFixed(1);

            // Disk Usage (df -h /)
            let diskUsage = { total: 'N/A', used: 'N/A', percent: '0' };
            try {
                const { stdout } = await execPromise("df -h / | tail -1 | awk '{print $2\",\"$3\",\"$5}'");
                const [total, used, percent] = stdout.trim().split(',');
                diskUsage = {
                    total,
                    used,
                    percent: percent.replace('%', '')
                };
            } catch (diskErr) {
                console.error('Error fetching disk stats:', diskErr);
            }

            return {
                cpu: {
                    usage: parseFloat(cpuUsagePercent),
                    cores: cpuCount,
                    load: loads[0].toFixed(2)
                },
                ram: {
                    total: (totalMem / (1024 ** 3)).toFixed(1) + 'GB',
                    used: (usedMem / (1024 ** 3)).toFixed(1) + 'GB',
                    percent: parseFloat(ramUsagePercent)
                },
                disk: diskUsage,
                uptime: os.uptime()
            };
        } catch (error) {
            console.error('Error getting host stats:', error);
            return null;
        }
    }

    static async getAgentStats() {
        try {
            const containers = await docker.listContainers({
                filters: { label: ['openclaw.instance.id'] }
            });

            const agentStats = await Promise.all(containers.map(async (containerInfo) => {
                const container = docker.getContainer(containerInfo.Id);
                const stats = await container.stats({ stream: false });

                // Memory usage calculation
                const memUsage = stats.memory_stats.usage || 0;
                const memLimit = stats.memory_stats.limit || 1;
                const memPercent = ((memUsage / memLimit) * 100).toFixed(1);

                // CPU usage calculation (Linux)
                let cpuPercent = 0;
                if (stats.cpu_stats && stats.precpu_stats) {
                    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
                    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
                    const onlineCpus = stats.cpu_stats.online_cpus || stats.precpu_stats.online_cpus || 1;

                    if (systemDelta > 0 && cpuDelta > 0) {
                        // This gives total usage across all cores (e.g. 200% for 2 full cores)
                        cpuPercent = ((cpuDelta / systemDelta) * onlineCpus * 100).toFixed(1);

                        // Optional: Cap at 100% or keep as-is if the user wants to see "multi-core" usage
                        // For now we keep as-is but the limit in Docker will keep it within bounds.
                    }
                }

                return {
                    id: containerInfo.Labels['openclaw.instance.id'],
                    name: containerInfo.Names[0].replace('/', ''),
                    subdomain: containerInfo.Labels['openclaw.subdomain'],
                    status: containerInfo.State,
                    cpu: parseFloat(cpuPercent),
                    memory: {
                        usage: (memUsage / (1024 ** 2)).toFixed(1) + 'MB',
                        percent: parseFloat(memPercent)
                    }
                };
            }));

            return agentStats;
        } catch (error) {
            console.error('Error getting agent stats:', error);
            return [];
        }
    }
}
