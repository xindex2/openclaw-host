import { useState, useEffect } from 'react';
import {
    Bot, Cpu, Share2, Terminal, Server, CreditCard, User, LogOut, Search, Globe, HardDrive, Clock,
    Trash2, Play, Square, Settings, LayoutDashboard, ChevronRight, CheckCircle, Plus, Rocket,
    Cloud, FileText, Lock, Sparkles, ChevronLeft, Edit3, Activity, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useAuth } from '../context/AuthContext';
import DeployWizard from '../components/DeployWizard';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const ICONS = {
    telegram: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png',
    discord: 'https://favicon.im/discord.com?t=1770422839363',
    whatsapp: 'https://favicon.im/whatsapp.com?larger=true',
    feishu: 'https://www.feishu.cn/favicon.ico',
    github: 'https://github.com/favicon.ico'
};

const PROVIDERS = [
    { id: 'openrouter', name: 'OpenRouter', icon: 'https://openrouter.ai/favicon.ico' },
    { id: 'anthropic', name: 'Anthropic', icon: 'https://www.anthropic.com/favicon.ico' },
    { id: 'openai', name: 'OpenAI', icon: 'https://openai.com/favicon.ico' },
    { id: 'deepseek', name: 'DeepSeek', icon: 'https://www.deepseek.com/favicon.ico' },
    { id: 'google', name: 'Google Gemini', icon: 'https://www.google.com/favicon.ico' },
    { id: 'groq', name: 'Groq', icon: 'https://groq.com/favicon.ico' },
    { id: 'moonshot', name: 'Moonshot AI', icon: 'https://www.moonshot.cn/favicon.ico' },
    { id: 'zhipu', name: 'Zhipu AI', icon: 'https://www.zhipuai.cn/favicon.ico' },
    { id: 'vllm', name: 'vLLM (Local)', icon: 'https://vllm.ai/favicon.ico' },
];

interface AgentConfig {
    id: string;
    name: string;
    description: string;
    provider: string;
    apiKey: string;
    apiBase: string;
    model: string;
    telegramEnabled: boolean;
    telegramToken: string;
    discordEnabled: boolean;
    discordToken: string;
    whatsappEnabled: boolean;
    whatsappBridgeUrl: string;
    feishuEnabled: boolean;
    feishuAppId: string;
    feishuAppSecret: string;
    feishuEncryptKey: string;
    feishuVerificationToken: string;
    webSearchApiKey: string;
    githubEnabled: boolean;
    githubToken: string;
    browserEnabled: boolean;
    shellEnabled: boolean;
    tmuxEnabled: boolean;
    restrictToWorkspace: boolean;
    weatherEnabled: boolean;
    summarizeEnabled: boolean;
    firecrawlApiKey: string;
    apifyApiToken: string;
    gatewayHost: string;
    gatewayPort: number;
    maxToolIterations: number;
    status: string;
    lastRun?: string;
}

export default function Dashboard() {
    const { user, token } = useAuth();
    const [agents, setAgents] = useState<AgentConfig[]>([]);
    const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('provider');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            fetchAgents();
            const interval = setInterval(fetchAgents, 5000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchAgents = async () => {
        if (!user) return;
        try {
            const resp = await fetch(`/api/config?userId=${user.id}`);
            if (resp.ok) {
                const data = await resp.json();
                setAgents(data);
            }
        } catch (err) {
            console.error('Failed to fetch agents:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAgent = () => {
        const newAgent: any = {
            name: 'New Agent',
            description: 'Autonomous research and execution agent.',
            provider: 'openrouter',
            model: 'anthropic/claude-3.5-sonnet',
            apiKey: '',
            apiBase: '',
            telegramEnabled: false,
            feishuEnabled: false,
            browserEnabled: true,
            shellEnabled: true,
            tmuxEnabled: true,
            weatherEnabled: false,
            summarizeEnabled: false,
            webSearchApiKey: '',
            githubToken: '',
            firecrawlApiKey: '',
            apifyApiToken: '',
            restrictToWorkspace: true,
            gatewayHost: '0.0.0.0',
            gatewayPort: 18790 + (agents.length * 10), // Auto-offset ports
            maxToolIterations: 30
        };
        setEditingAgent(newAgent);
    };

    const saveConfig = async (config: AgentConfig) => {
        if (!user) return;
        setIsSaving(true);
        try {
            const resp = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, ...config })
            });
            if (resp.ok) {
                await fetchAgents();
                setEditingAgent(null);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateAgentFromWizard = async (config: any) => {
        const newAgent: any = {
            ...config,
            description: 'Autonomous research and execution agent.',
            apiKey: '', // User will need to add this in the editor or we could ask in wizard
            apiBase: '',
            feishuEnabled: false,
            browserEnabled: true,
            shellEnabled: false,
            tmuxEnabled: false,
            weatherEnabled: false,
            summarizeEnabled: false,
            webSearchApiKey: '',
            githubToken: '',
            firecrawlApiKey: '',
            apifyApiToken: '',
            restrictToWorkspace: true,
            gatewayHost: '0.0.0.0',
            gatewayPort: 18790 + (agents.length * 10),
            maxToolIterations: 20
        };
        await saveConfig(newAgent);
    };

    const deleteAgent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this agent?')) return;
        try {
            await fetch(`/api/config/${id}`, { method: 'DELETE' });
            await fetchAgents();
        } catch (e) { }
    };

    const toggleBot = async (configId: string, currentStatus: string) => {
        const action = currentStatus === 'running' ? 'stop' : 'start';
        const resp = await fetch('/api/bot/control', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ configId, action })
        });
        if (resp.ok) {
            fetchAgents();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Bot size={48} className="text-red-500 animate-bounce shadow-lg shadow-red-500/20" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/60">Synchronizing Fleet...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full">
            <AnimatePresence mode="wait">
                {!editingAgent ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-12"
                    >
                        {agents.length === 0 ? (
                            <DeployWizard
                                user={user}
                                onDeploy={handleCreateAgentFromWizard}
                                isDeploying={isSaving}
                            />
                        ) : (
                            <>
                                <header className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl shadow-black/20">
                                    <div>
                                        <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Operational Command
                                        </div>
                                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                                            Active Agents
                                        </h1>
                                    </div>
                                    <button
                                        onClick={handleCreateAgent}
                                        className="btn-minimal flex items-center gap-2.5"
                                    >
                                        <Plus size={16} strokeWidth={3} /> Initialize Agent
                                    </button>
                                </header>

                                {/* Stats Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Total Agents', value: agents.length, icon: <Bot size={16} /> },
                                        { label: 'Active', value: agents.filter(a => a.status === 'running').length, icon: <Activity size={16} />, color: 'text-green-600' },
                                        { label: 'Idle', value: agents.filter(a => a.status !== 'running').length, icon: <Clock size={16} /> },
                                        { label: 'Compute Usage', value: '42%', icon: <Cpu size={16} /> },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm flex items-center justify-between group hover:border-red-600/30 transition-colors">
                                            <div>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                                <p className={cn("text-2xl font-black tracking-tight", stat.color || "text-white")}>{stat.value}</p>
                                            </div>
                                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-zinc-600 group-hover:text-red-500 transition-colors">
                                                {stat.icon}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {agents.map(agent => (
                                        <AgentCard
                                            key={agent.id}
                                            agent={agent}
                                            onEdit={() => setEditingAgent(agent)}
                                            onDelete={() => deleteAgent(agent.id)}
                                            onToggle={() => toggleBot(agent.id, agent.status)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.01 }}
                        className="flex-1 flex min-h-[70vh] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative z-10"
                    >
                        <Sidebar
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            onBack={() => setEditingAgent(null)}
                        />
                        <main className="flex-1 p-12 overflow-y-auto relative custom-scrollbar bg-zinc-950">
                            <header className="mb-10">
                                <button onClick={() => setEditingAgent(null)} className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors text-[10px] font-bold uppercase tracking-widest mb-6 px-1">
                                    <ChevronLeft size={14} /> Back to dashboard
                                </button>
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic mb-2">
                                        {editingAgent.id ? 'Edit Squad Member' : 'New Squad Member'}
                                    </h2>
                                    <input
                                        value={editingAgent.name}
                                        onChange={e => setEditingAgent({ ...editingAgent, name: e.target.value })}
                                        className="bg-transparent text-sm font-medium text-zinc-400 outline-none border-b border-zinc-800 focus:border-red-600 transition-colors w-full placeholder:text-zinc-800 uppercase tracking-widest"
                                        placeholder="Agent Name"
                                    />
                                    <input
                                        value={editingAgent.description}
                                        onChange={e => setEditingAgent({ ...editingAgent, description: e.target.value })}
                                        placeholder="Define the mission objective..."
                                        className="bg-transparent text-slate-500 text-sm font-medium outline-none w-full px-1"
                                    />
                                </div>
                            </header>

                            <div className="max-w-4xl space-y-12 pb-32">
                                {activeTab === 'provider' && (
                                    <Section icon={<Cpu className="text-red-500" />} title="Intelligence Brain" desc="Core processing & authentication.">
                                        <div className="grid grid-cols-2 gap-8 mt-8">
                                            <InputWrapper label="Provider">
                                                <select
                                                    value={editingAgent.provider}
                                                    onChange={e => setEditingAgent({ ...editingAgent, provider: e.target.value })}
                                                    className="form-select"
                                                >
                                                    {PROVIDERS.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </InputWrapper>
                                            <InputWrapper label="Model">
                                                <input
                                                    value={editingAgent.model}
                                                    onChange={e => setEditingAgent({ ...editingAgent, model: e.target.value })}
                                                    className="form-input"
                                                />
                                            </InputWrapper>
                                            <InputWrapper label="API Key" full>
                                                <input
                                                    type="password"
                                                    value={editingAgent.apiKey}
                                                    onChange={e => setEditingAgent({ ...editingAgent, apiKey: e.target.value })}
                                                    className="form-input font-mono"
                                                />
                                            </InputWrapper>
                                        </div>
                                    </Section>
                                )}

                                {activeTab === 'channels' && (
                                    <div className="space-y-6 pt-4">
                                        <ChannelInput
                                            name="Telegram" icon={ICONS.telegram}
                                            enabled={editingAgent.telegramEnabled}
                                            onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, telegramEnabled: v })}
                                        >
                                            <input
                                                type="password"
                                                placeholder="Bot Token"
                                                value={editingAgent.telegramToken}
                                                onChange={e => setEditingAgent({ ...editingAgent, telegramToken: e.target.value })}
                                                className="form-input font-mono text-sm"
                                            />
                                        </ChannelInput>
                                        <ChannelInput
                                            name="Discord" icon={ICONS.discord}
                                            enabled={editingAgent.discordEnabled}
                                            onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, discordEnabled: v })}
                                        >
                                            <input
                                                type="password"
                                                placeholder="Discord Bot Token"
                                                value={editingAgent.discordToken || ''}
                                                onChange={e => setEditingAgent({ ...editingAgent, discordToken: e.target.value })}
                                                className="form-input font-mono text-sm"
                                            />
                                        </ChannelInput>
                                        <ChannelInput
                                            name="WhatsApp" icon={ICONS.whatsapp}
                                            enabled={editingAgent.whatsappEnabled}
                                            onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, whatsappEnabled: v })}
                                        >
                                            <input
                                                placeholder="Bridge URL (ws://...)"
                                                value={editingAgent.whatsappBridgeUrl || ''}
                                                onChange={e => setEditingAgent({ ...editingAgent, whatsappBridgeUrl: e.target.value })}
                                                className="form-input text-xs"
                                            />
                                        </ChannelInput>
                                        <ChannelInput
                                            name="Feishu / Lark" icon={ICONS.feishu}
                                            enabled={editingAgent.feishuEnabled}
                                            onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, feishuEnabled: v })}
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    placeholder="App ID"
                                                    value={editingAgent.feishuAppId || ''}
                                                    onChange={e => setEditingAgent({ ...editingAgent, feishuAppId: e.target.value })}
                                                    className="form-input text-xs"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="App Secret"
                                                    value={editingAgent.feishuAppSecret || ''}
                                                    onChange={e => setEditingAgent({ ...editingAgent, feishuAppSecret: e.target.value })}
                                                    className="form-input text-xs"
                                                />
                                                <input
                                                    placeholder="Encrypt Key"
                                                    value={editingAgent.feishuEncryptKey || ''}
                                                    onChange={e => setEditingAgent({ ...editingAgent, feishuEncryptKey: e.target.value })}
                                                    className="form-input text-xs"
                                                />
                                                <input
                                                    placeholder="Verification Token"
                                                    value={editingAgent.feishuVerificationToken || ''}
                                                    onChange={e => setEditingAgent({ ...editingAgent, feishuVerificationToken: e.target.value })}
                                                    className="form-input text-xs"
                                                />
                                            </div>
                                        </ChannelInput>
                                    </div>
                                )}

                                {activeTab === 'tools' && (
                                    <div className="space-y-12 pt-4">
                                        <Section icon={<Terminal size={18} />} title="Operational Skills" desc="Extended autonomous capabilities.">
                                            <div className="grid grid-cols-2 gap-8 mt-8">
                                                <ToolCard
                                                    title="Web Browser" icon={<Globe className="text-zinc-500" />}
                                                    desc="Headless Chrome automation for research."
                                                    onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, browserEnabled: v })}
                                                    checked={editingAgent.browserEnabled}
                                                />
                                                <ToolCard
                                                    title="System Shell" icon={<Terminal className="text-zinc-500" />}
                                                    desc="Isolated command execution & processing."
                                                    onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, shellEnabled: v })}
                                                    checked={editingAgent.shellEnabled}
                                                />
                                                <ToolCard
                                                    title="Tmux Manager" icon={<Terminal size={20} className="text-zinc-500" />}
                                                    desc="Persistent background session management."
                                                    onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, tmuxEnabled: v })}
                                                    checked={editingAgent.tmuxEnabled}
                                                />
                                                <ToolCard
                                                    title="Brave Search" icon={<Search className="text-zinc-500" />}
                                                    desc="Live searching via Brave API."
                                                >
                                                    <input
                                                        type="password"
                                                        placeholder="Brave API Key"
                                                        value={editingAgent.webSearchApiKey}
                                                        onChange={e => setEditingAgent({ ...editingAgent, webSearchApiKey: e.target.value })}
                                                        className="form-input text-xs mt-2"
                                                    />
                                                </ToolCard>
                                                <ToolCard
                                                    title="Summarize" icon={<FileText className="text-zinc-500" />}
                                                    desc="Web content extraction & cleaning."
                                                    onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, summarizeEnabled: v })}
                                                    checked={editingAgent.summarizeEnabled}
                                                >
                                                    <div className="space-y-2 mt-4 pt-4 border-t border-zinc-800">
                                                        <input
                                                            type="password"
                                                            placeholder="Firecrawl API Key"
                                                            value={editingAgent.firecrawlApiKey || ''}
                                                            onChange={e => setEditingAgent({ ...editingAgent, firecrawlApiKey: e.target.value })}
                                                            className="form-input text-xs"
                                                        />
                                                        <input
                                                            type="password"
                                                            placeholder="Apify API Token"
                                                            value={editingAgent.apifyApiToken || ''}
                                                            onChange={e => setEditingAgent({ ...editingAgent, apifyApiToken: e.target.value })}
                                                            className="form-input text-xs"
                                                        />
                                                    </div>
                                                </ToolCard>
                                                <ToolCard
                                                    title="Workspace" icon={<HardDrive className="text-zinc-500" />}
                                                    desc="Read/Write access to local filesystem."
                                                    checked={true}
                                                >
                                                    <div className="mt-4 px-3 py-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-black rounded-lg border border-zinc-800 shadow-inner">
                                                        Platform Active
                                                    </div>
                                                </ToolCard>
                                            </div>
                                        </Section>
                                    </div>
                                )}

                                {activeTab === 'system' && (
                                    <div className="space-y-8 pt-4">
                                        <Section icon={<Lock className="text-zinc-400" />} title="Security" desc="Process isolation.">
                                            <div className="mt-8">
                                                <ToggleRow
                                                    label="Restrict to Workspace"
                                                    desc="Prevent access outside project folder."
                                                    checked={editingAgent.restrictToWorkspace}
                                                    onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, restrictToWorkspace: v })}
                                                />
                                            </div>
                                        </Section>
                                        <Section icon={<Server className="text-zinc-400" />} title="Gateway" desc="Network binding.">
                                            <div className="grid grid-cols-2 gap-8 mt-8">
                                                <InputWrapper label="Port Offset">
                                                    <input
                                                        type="number"
                                                        value={editingAgent.gatewayPort}
                                                        onChange={e => setEditingAgent({ ...editingAgent, gatewayPort: parseInt(e.target.value) })}
                                                        className="form-input font-mono"
                                                    />
                                                </InputWrapper>
                                                <InputWrapper label="Max Tool Iterations">
                                                    <input
                                                        type="number"
                                                        value={editingAgent.maxToolIterations}
                                                        onChange={e => setEditingAgent({ ...editingAgent, maxToolIterations: parseInt(e.target.value) })}
                                                        className="form-input font-mono"
                                                    />
                                                </InputWrapper>
                                            </div>
                                        </Section>
                                    </div>
                                )}
                            </div>


                            <div className="fixed bottom-12 right-12 flex items-center gap-4 z-50">
                                <button
                                    onClick={() => deleteAgent(editingAgent.id)}
                                    className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold text-[10px] tracking-widest uppercase hover:bg-red-100 transition-all border border-red-100"
                                >
                                    Terminated Operation
                                </button>
                                <button
                                    onClick={() => saveConfig(editingAgent)}
                                    disabled={isSaving}
                                    className="bg-red-600 text-white px-8 py-4 rounded-xl font-black text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-xl shadow-red-600/20 flex items-center gap-3"
                                >
                                    <Rocket size={18} /> {isSaving ? 'Synchronizing...' : 'Deploy Agent'}
                                </button>
                            </div>
                        </main>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function AgentCard({ agent, onEdit, onDelete, onToggle }: any) {
    const isRunning = agent.status === 'running';
    return (
        <motion.div
            layout
            className={cn(
                "card-minimal p-7 flex flex-col gap-6 relative group",
                isRunning && "border-green-100 bg-green-50/10"
            )}
        >
            <div className="flex items-center justify-between">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg border",
                    isRunning ? "bg-red-600 text-white border-red-500" : "bg-zinc-800 text-zinc-500 border-zinc-700"
                )}>
                    <Bot size={20} />
                </div>
                <div className="flex gap-1.5 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                    {agent.telegramEnabled && <img src={ICONS.telegram} className="w-3 h-3 rounded-full" />}
                    {agent.discordEnabled && <img src={ICONS.discord} className="w-3 h-3 rounded-full" />}
                    {agent.githubEnabled && <img src={ICONS.github} className="w-3 h-3 rounded-full" />}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-black text-white group-hover:text-red-500 transition-colors uppercase tracking-tight mb-1 italic">{agent.name}</h3>
                <p className="text-[11px] text-zinc-500 font-medium line-clamp-1 leading-relaxed">{agent.description}</p>
            </div>

            <div className="flex items-center justify-between mt-2 pt-5 border-t border-zinc-800/50">
                <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm", isRunning ? "bg-green-500 animate-pulse" : "bg-slate-300")} />
                    <span className={cn("text-[8px] font-bold uppercase tracking-[0.15em]", isRunning ? "text-green-600" : "text-slate-400")}>
                        {isRunning ? 'Operational' : 'Deactivated'}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button onClick={onEdit} className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-500 hover:text-red-500">
                        <Settings size={14} />
                    </button>
                    <button
                        onClick={onToggle}
                        className={cn(
                            "p-2.5 rounded-lg transition-all shadow-lg",
                            isRunning ? "bg-zinc-800 text-red-500 hover:bg-zinc-700 border border-zinc-700" : "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20"
                        )}
                    >
                        {isRunning ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    </button>
                </div>
            </div>

            <button
                onClick={onDelete}
                className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={14} />
            </button>
        </motion.div>
    );
}

function Sidebar({ activeTab, setActiveTab, onBack }: any) {
    return (
        <aside className="w-72 border-r border-zinc-800 bg-black p-6 flex flex-col gap-10 shrink-0">
            <div className="space-y-6">
                <p className="px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Build Configuration</p>
                <nav className="flex flex-col gap-0.5">
                    <SidebarTab active={activeTab === 'provider'} onClick={() => setActiveTab('provider')} icon={<Cpu size={14} />} label="Intelligence" />
                    <SidebarTab active={activeTab === 'channels'} onClick={() => setActiveTab('channels')} icon={<Share2 size={14} />} label="Connectors" />
                    <SidebarTab active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} icon={<Terminal size={14} />} label="Skills" />
                    <SidebarTab active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Server size={14} />} label="Platform" />
                </nav>
            </div>

        </aside>
    );
}

function SidebarTab({ icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg font-bold text-[11px] transition-all text-left group uppercase tracking-widest",
                active ? "bg-zinc-900 text-white shadow-xl border border-zinc-800" : "text-zinc-500 hover:text-white"
            )}
        >
            <div className={cn("transition-colors", active ? "text-red-500" : "text-zinc-600 group-hover:text-zinc-400")}>
                {icon}
            </div>
            <span className="translate-y-px">{label}</span>
        </button>
    );
}

function Section({ icon, title, desc, children }: any) {
    return (
        <div>
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 shadow-inner">
                    {icon}
                </div>
                <div>
                    <h2 className="text-xl font-black tracking-tighter text-white uppercase italic">{title}</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">{desc}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function ChannelInput({ name, icon, enabled, onToggle, children }: any) {
    return (
        <div className={cn(
            "p-6 rounded-2xl border transition-all",
            enabled ? "bg-zinc-900 border-red-600/20 shadow-xl" : "bg-black border-zinc-900 opacity-40 grayscale"
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="w-11 h-11 bg-black p-2.5 rounded-xl border border-zinc-800 shadow-inner">
                        <img src={icon} alt={name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight italic">{name}</h3>
                        <p className="text-[9px] text-red-500/60 font-bold uppercase tracking-widest">{enabled ? 'Active Channel' : 'Standby'}</p>
                    </div>
                </div>
                <Toggle checked={enabled} onChange={onToggle} />
            </div>
            {enabled && <div className="mt-6 pt-6 border-t border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">{children}</div>}
        </div>
    );
}

function ToolCard({ title, icon, desc, checked, onToggle, children }: any) {
    return (
        <div className={cn(
            "p-6 rounded-2xl border transition-all relative group shadow-lg",
            (checked || (!onToggle && children)) ? "bg-zinc-900 border-red-600/20 shadow-red-600/5" : "bg-black border-zinc-900"
        )}>
            <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-red-500 transition-colors shadow-inner">
                    {icon}
                </div>
                {onToggle && <Toggle checked={checked} onChange={onToggle} />}
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-tight mb-1 italic">{title}</h3>
            <p className="text-[10px] text-zinc-500 font-medium mb-4 leading-relaxed line-clamp-2">{desc}</p>
            {children}
        </div>
    );
}

function ToggleRow({ label, desc, checked, onToggle }: any) {
    return (
        <div className="flex items-center justify-between p-5 bg-zinc-900 rounded-xl border border-zinc-800 shadow-inner">
            <div>
                <h4 className="font-black text-sm text-white uppercase italic tracking-wide">{label}</h4>
                <p className="text-[11px] text-zinc-500 font-medium">{desc}</p>
            </div>
            <Toggle checked={checked} onChange={onToggle} />
        </div>
    );
}

function InputWrapper({ label, children, full }: any) {
    return (
        <div className={full ? 'col-span-2' : ''}>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2.5 block px-1">{label}</label>
            {children}
        </div>
    );
}

function Toggle({ checked, onChange }: any) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                className="sr-only peer"
            />
            <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:shadow-sm after:transition-all peer-checked:bg-red-600 shadow-inner"></div>
        </label>
    );
}

