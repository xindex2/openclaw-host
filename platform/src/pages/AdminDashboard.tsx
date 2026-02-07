import { useState, useEffect } from 'react';
import { Users, Bot, Activity, Server, Shield, Cpu, Zap, HardDrive, TrendingUp, Settings, BarChart3, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function AdminNavLink({ to, icon, label, count }: any) {
    return (
        <Link to={to} className="flex items-center justify-between p-4 bg-white border border-[#eaecf0] rounded-xl hover:bg-[#f9fafb] transition-all group shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#f9fafb] rounded-lg flex items-center justify-center text-[#475467] group-hover:text-[#101828] transition-colors">
                    {icon}
                </div>
                <span className="text-sm font-bold text-[#101828]">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {count !== undefined && <span className="text-xs font-semibold text-[#475467] bg-[#f2f4f7] px-2 py-0.5 rounded-full">{count}</span>}
                <ChevronRight size={16} className="text-[#d0d5dd]" />
            </div>
        </Link>
    );
}

interface Stats {
    summary: {
        totalUsers: number;
        totalAgents: number;
        activeAgents: number;
    };
    system: {
        cpu: { usage: number; cores: number; load: string };
        ram: { percent: number; used: string; total: string };
        disk: { percent: number; used: string; total: string };
    };
    growth: { date: string; count: number }[];
    plans: { plan: string; count: number }[];
    agentUsage: {
        id: string;
        name: string;
        subdomain: string;
        status: string;
        cpu: number;
        memory: { percent: number; usage: string };
    }[];
}

export default function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadStats = async () => {
        try {
            const response = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-[#101828] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-8 space-y-10">
            <div className="max-w-6xl mx-auto space-y-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#101828] mb-1">Command Center</h1>
                        <p className="text-sm text-[#475467]">Overview of your system performance and user base.</p>
                    </div>
                </div>

                {/* Navigation Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AdminNavLink to="/admin/users" icon={<Users size={20} />} label="User Registry" count={stats.summary.totalUsers} />
                    <AdminNavLink to="/admin/events" icon={<Activity size={20} />} label="Event Logs" />
                    <AdminNavLink to="/admin/plans" icon={<Shield size={20} />} label="Plans & Pricing" />
                    <AdminNavLink to="/admin/settings" icon={<Settings size={20} />} label="System Settings" />
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard label="Total Users" value={stats.summary.totalUsers} icon={<Users size={20} />} />
                    <MetricCard label="Total Bots" value={stats.summary.totalAgents} icon={<Bot size={20} />} />
                    <MetricCard label="Active Bots" value={stats.summary.activeAgents} icon={<Server size={20} />} accent />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* System Resources */}
                    <div className="bg-white border border-[#eaecf0] rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Cpu size={18} className="text-[#475467]" />
                            <h3 className="text-sm font-bold text-[#101828] uppercase tracking-wider">System Health</h3>
                        </div>
                        <div className="space-y-6">
                            <ResourceBar label="CPU Load" percent={stats.system.cpu.usage} details={`${stats.system.cpu.cores} cores · ${stats.system.cpu.load}`} />
                            <ResourceBar label="Memory" percent={stats.system.ram.percent} details={`${stats.system.ram.used} / ${stats.system.ram.total}`} />
                            <ResourceBar label="Disk Usage" percent={stats.system.disk.percent} details={`${stats.system.disk.used} / ${stats.system.disk.total}`} />
                        </div>
                    </div>

                    {/* Plan Distro */}
                    <div className="bg-white border border-[#eaecf0] rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 size={18} className="text-[#475467]" />
                            <h3 className="text-sm font-bold text-[#101828] uppercase tracking-wider">Plan Distribution</h3>
                        </div>
                        <div className="space-y-4">
                            {stats.plans.map((p, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-semibold text-[#475467]">{p.plan}</span>
                                        <span className="text-sm font-bold text-[#101828]">{p.count}</span>
                                    </div>
                                    <div className="h-2 bg-[#f2f4f7] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#101828] rounded-full"
                                            style={{ width: `${(p.count / (stats.summary.totalUsers || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-white border border-[#eaecf0] rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-[#eaecf0]">
                        <h3 className="text-sm font-bold text-[#101828] uppercase tracking-wider">Active Bots</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#f9fafb] border-b border-[#eaecf0]">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#475467] uppercase tracking-wider">Bot Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#475467] uppercase tracking-wider">CPU</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#475467] uppercase tracking-wider">Memory</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#475467] uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eaecf0]">
                                {stats.agentUsage.map((agent) => (
                                    <tr key={agent.id} className="hover:bg-[#f9fafb]">
                                        <td className="px-6 py-4 text-sm font-semibold text-[#101828]">{agent.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-[#f2f4f7] rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${agent.cpu}%` }} />
                                                </div>
                                                <span className="text-xs text-[#475467] font-medium">{agent.cpu}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-[#f2f4f7] rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${agent.memory.percent}%` }} />
                                                </div>
                                                <span className="text-xs text-[#475467] font-medium">{agent.memory.usage}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="badge badge-success text-[10px]">Running</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, icon, accent }: any) {
    return (
        <div className={cn(
            "p-6 rounded-xl border flex items-center justify-between shadow-sm",
            accent ? "bg-[#101828] border-[#101828] text-white" : "bg-white border-[#eaecf0] text-[#101828]"
        )}>
            <div>
                <p className={cn("text-xs font-semibold mb-1", accent ? "text-white/60" : "text-[#475467]")}>{label}</p>
                <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            </div>
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", accent ? "bg-white/10 text-white" : "bg-[#f9fafb] text-[#475467]")}>
                {icon}
            </div>
        </div>
    );
}

function ResourceBar({ label, percent, details }: any) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-end">
                <span className="text-xs font-semibold text-[#475467]">{label}</span>
                <span className="text-xs font-bold text-[#101828]">{percent}%</span>
            </div>
            <div className="h-2 bg-[#f2f4f7] rounded-full overflow-hidden">
                <div className="h-full bg-[#101828] rounded-full" style={{ width: `${percent}%` }} />
            </div>
            <p className="text-[10px] text-[#667085] font-medium">{details}</p>
        </div>
    );
}
