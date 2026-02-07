import { useState, useEffect } from 'react';
import {
    Bot, Cpu, Share2, Terminal, Server, CreditCard, User, LogOut, Search, Globe, HardDrive, Clock,
    Trash2, Play, Square, Settings, LayoutDashboard, ChevronRight, CheckCircle, Plus, Rocket,
    Cloud, FileText, Lock, Sparkles, ChevronLeft, Edit3, Activity, Check, Info, Loader2, Zap, Layout
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

const SUGGESTED_MODELS = [
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3-opus',
    'openai/gpt-4o',
    'openai/gpt-4-turbo',
    'deepseek/deepseek-chat',
    'google/gemini-pro-1.5',
    'meta-llama/llama-3-70b-instruct'
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
    telegramAllowFrom: string;
    discordEnabled: boolean;
    discordToken: string;
    discordAllowFrom: string;
    whatsappEnabled: boolean;
    whatsappBridgeUrl: string;
    whatsappAllowFrom: string;
    feishuEnabled: boolean;
    feishuAppId: string;
    feishuAppSecret: string;
    feishuEncryptKey: string;
    feishuVerificationToken: string;
    feishuAllowFrom: string;
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
            description: 'A helpful AI assistant ready to work.',
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
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                        <Bot size={48} className="text-primary relative z-10 animate-bounce" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Synchronizing Fleet...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full py-8 container mx-auto">
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
                                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-8 rounded-3xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                                    <div className="relative z-10">
                                        <div className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                            Operational Command
                                        </div>
                                        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                            Active Agents
                                        </h1>
                                        <p className="text-white/40 text-sm mt-2 font-medium max-w-lg">
                                            Manage your fleet of autonomous agents. Deploy, monitor, and configure their capabilities from this central command center.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCreateAgent}
                                        className="btn-primary-modern flex items-center gap-2.5 shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                                    >
                                        <Plus size={18} strokeWidth={3} />
                                        <span>Initialize New Agent</span>
                                    </button>
                                </header>

                                {/* Stats Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Total Agents', value: agents.length, icon: <Bot size={18} />, color: "text-white" },
                                        { label: 'Active', value: agents.filter(a => a.status === 'running').length, icon: <Activity size={18} />, color: 'text-green-400' },
                                        { label: 'Idle', value: agents.filter(a => a.status !== 'running').length, icon: <Clock size={18} />, color: "text-white/60" },
                                        { label: 'Compute Usage', value: 'Low', icon: <Cpu size={18} />, color: "text-blue-400" },
                                    ].map((stat, i) => (
                                        <div key={i} className="glass-card p-6 rounded-2xl flex items-center justify-between group">
                                            <div>
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                                                <p className={cn("text-3xl font-black tracking-tight", stat.color)}>{stat.value}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-primary group-hover:bg-primary/10 transition-all">
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
                        className="flex-1 flex min-h-[85vh] glass-panel rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-white/10"
                    >
                        <Sidebar
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                        <main className="flex-1 p-12 overflow-y-auto relative custom-scrollbar bg-black/20">
                            <header className="mb-10">
                                <button onClick={() => setEditingAgent(null)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest mb-6 px-1">
                                    <ChevronLeft size={14} /> Back to dashboard
                                </button>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 block">Agent Name</label>
                                        <input
                                            value={editingAgent.name}
                                            onChange={e => setEditingAgent({ ...editingAgent, name: e.target.value })}
                                            className="bg-transparent text-4xl font-black text-white outline-none border-b border-white/10 focus:border-primary transition-colors w-full placeholder:text-white/20 uppercase italic tracking-tighter py-2"
                                            placeholder="AGENT NAME"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">Mission Objective</label>
                                        <textarea
                                            value={editingAgent.description}
                                            onChange={e => setEditingAgent({ ...editingAgent, description: e.target.value })}
                                            placeholder="Describe what this agent should do..."
                                            className="bg-transparent text-white/70 text-sm font-medium outline-none w-full px-1 resize-none h-20"
                                        />
                                    </div>
                                </div>
                            </header>

                            <div className="max-w-4xl space-y-12 pb-32">
                                {activeTab === 'provider' && (
                                    <Section icon={<Cpu className="text-vibrant-primary" />} title="Brain Configuration" desc="Select the AI model and provider for your agent.">
                                        <div className="grid grid-cols-2 gap-8 mt-8">
                                            <InputWrapper label="AI Provider">
                                                <select
                                                    value={editingAgent.provider}
                                                    onChange={e => setEditingAgent({ ...editingAgent, provider: e.target.value })}
                                                    className="input-modern w-full appearance-none"
                                                >
                                                    {PROVIDERS.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </InputWrapper>
                                            <InputWrapper label="Model">
                                                <div className="relative">
                                                    <input
                                                        list="models"
                                                        value={editingAgent.model}
                                                        onChange={e => setEditingAgent({ ...editingAgent, model: e.target.value })}
                                                        className="input-modern w-full"
                                                        placeholder="Select or type model..."
                                                    />
                                                    <datalist id="models">
                                                        {SUGGESTED_MODELS.map(m => (
                                                            <option key={m} value={m} />
                                                        ))}
                                                    </datalist>
                                                </div>
                                                <p className="text-[10px] text-white/30 mt-1.5">Type to add a custom model ID if not listed.</p>
                                            </InputWrapper>
                                            <InputWrapper label="API Key" full>
                                                <input
                                                    type="password"
                                                    value={editingAgent.apiKey}
                                                    onChange={e => setEditingAgent({ ...editingAgent, apiKey: e.target.value })}
                                                    className="input-modern w-full font-mono"
                                                    placeholder="sk-..."
                                                />
                                            </InputWrapper>
                                        </div>
                                    </Section>
                                )}

                                {activeTab === 'channels' && (
                                    <div className="space-y-6 pt-4">
                                        <Section icon={<Share2 className="text-vibrant-secondary" />} title="Communication Channels" desc="Where should this agent live?">
                                            <div className="grid grid-cols-1 gap-4 mt-6">
                                                <ChannelInput
                                                    name="Telegram" icon={ICONS.telegram}
                                                    enabled={editingAgent.telegramEnabled}
                                                    onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, telegramEnabled: v })}
                                                >
                                                    <div className="space-y-4">
                                                        <SetupInstructions content={[
                                                            "Talk to @BotFather on Telegram to create a new bot.",
                                                            "Copy the API Token provided by BotFather."
                                                        ]} />
                                                        <InputWrapper label="Bot Token">
                                                            <input
                                                                type="password"
                                                                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                                                                value={editingAgent.telegramToken}
                                                                onChange={e => setEditingAgent({ ...editingAgent, telegramToken: e.target.value })}
                                                                className="input-modern w-full font-mono text-sm"
                                                            />
                                                        </InputWrapper>
                                                        <InputWrapper label="Allowed User IDs (Optional)">
                                                            <input
                                                                placeholder="12345678, 87654321"
                                                                value={editingAgent.telegramAllowFrom || ''}
                                                                onChange={e => setEditingAgent({ ...editingAgent, telegramAllowFrom: e.target.value })}
                                                                className="input-modern w-full text-xs"
                                                            />
                                                        </InputWrapper>
                                                    </div>
                                                </ChannelInput>

                                                <ChannelInput
                                                    name="Discord" icon={ICONS.discord}
                                                    enabled={editingAgent.discordEnabled}
                                                    onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, discordEnabled: v })}
                                                >
                                                    <div className="space-y-4">
                                                        <SetupInstructions content={[
                                                            "Create an App in the Discord Developer Portal.",
                                                            "Enable 'Message Content Intent' under the Bot tab."
                                                        ]} />
                                                        <InputWrapper label="Bot Token">
                                                            <input
                                                                type="password"
                                                                value={editingAgent.discordToken || ''}
                                                                onChange={e => setEditingAgent({ ...editingAgent, discordToken: e.target.value })}
                                                                className="input-modern w-full font-mono text-sm"
                                                            />
                                                        </InputWrapper>
                                                    </div>
                                                </ChannelInput>
                                            </div>
                                        </Section>
                                    </div>
                                )}

                                {activeTab === 'tools' && (
                                    <div className="space-y-12 pt-4">
                                        <Section icon={<Terminal className="text-vibrant-accent" />} title="Capabilities & Skills" desc="What can this agent do?">
                                            <div className="grid grid-cols-2 gap-6 mt-8">
                                                <ToolCard
                                                    title="Web Browsing" icon={<Globe className="text-white/60" />}
                                                    desc="Give the agent access to the live internet via a headless browser."
                                                    onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, browserEnabled: v })}
                                                    checked={editingAgent.browserEnabled}
                                                />
                                                <ToolCard
                                                    title="System Shell" icon={<Terminal className="text-white/60" />}
                                                    desc="Allow the agent to run commands on the local system (Use with caution)."
                                                    onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, shellEnabled: v })}
                                                    checked={editingAgent.shellEnabled}
                                                />
                                                <ToolCard
                                                    title="Web Search" icon={<Search className="text-white/60" />}
                                                    desc="Enable finding information via search engines."
                                                    // This is simplified, usually implies Brave search
                                                    checked={!!editingAgent.webSearchApiKey}
                                                >
                                                    <div className="pt-2">
                                                        <input
                                                            type="password"
                                                            placeholder="Brave Search API Key"
                                                            value={editingAgent.webSearchApiKey}
                                                            onChange={e => setEditingAgent({ ...editingAgent, webSearchApiKey: e.target.value })}
                                                            className="input-modern w-full text-xs"
                                                        />
                                                    </div>
                                                </ToolCard>
                                                <ToolCard
                                                    title="Workspace Access" icon={<HardDrive className="text-white/60" />}
                                                    desc="Read/Write access to the project files."
                                                    checked={true}
                                                >
                                                    <div className="mt-2 text-[10px] text-green-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <CheckCircle size={10} /> Active
                                                    </div>
                                                </ToolCard>
                                            </div>
                                        </Section>
                                    </div>
                                )}

                                {activeTab === 'system' && (
                                    <div className="space-y-8 pt-4">
                                        <Section icon={<Settings className="text-white/40" />} title="Advanced Configuration" desc="Fine-tune system behavior.">
                                            <div className="mt-8 grid grid-cols-2 gap-8">
                                                <InputWrapper label="Max Steps per Task">
                                                    <input
                                                        type="number"
                                                        value={editingAgent.maxToolIterations}
                                                        onChange={e => setEditingAgent({ ...editingAgent, maxToolIterations: parseInt(e.target.value) })}
                                                        className="input-modern w-full font-mono"
                                                    />
                                                </InputWrapper>
                                                <InputWrapper label="Gateway Port">
                                                    <input
                                                        type="number"
                                                        value={editingAgent.gatewayPort}
                                                        onChange={e => setEditingAgent({ ...editingAgent, gatewayPort: parseInt(e.target.value) })}
                                                        className="input-modern w-full font-mono"
                                                    />
                                                </InputWrapper>
                                                <div className="col-span-2">
                                                    <ToggleRow
                                                        label="Restrict to Workspace"
                                                        desc="Prevent the agent from accessing files outside the project directory."
                                                        checked={editingAgent.restrictToWorkspace}
                                                        onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, restrictToWorkspace: v })}
                                                    />
                                                </div>
                                            </div>
                                        </Section>
                                    </div>
                                )}
                            </div>


                            <div className="fixed bottom-12 right-12 flex items-center gap-4 z-50">
                                <button
                                    onClick={() => deleteAgent(editingAgent.id)}
                                    className="px-6 py-3 rounded-xl font-bold text-[10px] tracking-widest uppercase hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-all"
                                >
                                    Delete Agent
                                </button>
                                <button
                                    onClick={() => saveConfig(editingAgent)}
                                    disabled={isSaving}
                                    className="btn-primary-modern px-8 py-4 font-black text-xs tracking-widest uppercase flex items-center gap-3"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={18} />}
                                    {isSaving ? 'Deploying...' : 'Deploy Agent'}
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
                "glass-card p-7 flex flex-col gap-6 relative group rounded-3xl border border-white/5",
                isRunning && "border-green-500/30 bg-green-500/5"
            )}
        >
            <div className="flex items-center justify-between">
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner",
                    isRunning ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-500/20" : "bg-white/5 text-white/40"
                )}>
                    <Bot size={24} />
                </div>
                <div className="flex gap-2">
                    <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                        isRunning ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-white/5 border-white/5 text-white/30")}>
                        {isRunning ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight mb-2 italic">{agent.name}</h3>
                <p className="text-xs text-white/50 font-medium line-clamp-2 leading-relaxed">{agent.description}</p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                <div className="flex gap-2 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                    {agent.telegramEnabled && <img src={ICONS.telegram} className="w-4 h-4" />}
                    {agent.discordEnabled && <img src={ICONS.discord} className="w-4 h-4" />}
                </div>

                <div className="flex gap-2">
                    <button onClick={onEdit} className="p-2.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <Settings size={16} />
                    </button>
                    <button
                        onClick={onToggle}
                        className={cn(
                            "p-2.5 rounded-xl transition-all shadow-lg",
                            isRunning ? "bg-white/5 text-red-500 hover:bg-red-500/10" : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                        )}
                    >
                        {isRunning ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function Sidebar({ activeTab, setActiveTab }: any) {
    const tabs = [
        { id: 'provider', label: 'Brain', icon: <Cpu size={16} /> },
        { id: 'channels', label: 'Channels', icon: <Share2 size={16} /> },
        { id: 'tools', label: 'Skills', icon: <Terminal size={16} /> },
        { id: 'system', label: 'System', icon: <Server size={16} /> },
    ];

    return (
        <aside className="w-72 border-r border-white/5 bg-black/20 p-8 flex flex-col gap-10 shrink-0">
            <div>
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4 pl-3">Configuration</div>
                <nav className="flex flex-col gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-[11px] transition-all text-left uppercase tracking-widest relative overflow-hidden",
                                activeTab === tab.id
                                    ? "text-white bg-white/5 border border-white/5 shadow-inner"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {activeTab === tab.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                            <span className={cn(activeTab === tab.id ? "text-primary" : "")}>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
}

function Section({ icon, title, desc, children }: any) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner">
                    {icon}
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">{title}</h2>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">{desc}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function ChannelInput({ name, icon, enabled, onToggle, children }: any) {
    return (
        <div className={cn(
            "p-6 rounded-3xl border transition-all duration-300",
            enabled ? "bg-white/5 border-primary/30 shadow-lg shadow-primary/5" : "bg-transparent border-white/5 opacity-60"
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white/90 p-2 rounded-2xl shadow-inner">
                        <img src={icon} alt={name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight italic">{name}</h3>
                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{enabled ? 'Active Channel' : 'Disabled'}</p>
                    </div>
                </div>
                <Toggle checked={enabled} onChange={onToggle} />
            </div>
            <AnimatePresence>
                {enabled && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ToolCard({ title, icon, desc, checked, onToggle, children }: any) {
    return (
        <div className={cn(
            "p-6 rounded-2xl border transition-all relative group shadow-lg flex flex-col h-full",
            checked ? "bg-white/5 border-primary/30" : "bg-black/20 border-white/5"
        )}>
            <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", checked ? "bg-primary text-white" : "bg-white/5 text-white/30")}>
                    {icon}
                </div>
                {onToggle && <Toggle checked={checked} onChange={onToggle} />}
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2 italic">{title}</h3>
            <p className="text-[11px] text-white/50 font-medium leading-relaxed mb-4">{desc}</p>
            <div className="mt-auto">
                {children}
            </div>
        </div>
    );
}

function ToggleRow({ label, desc, checked, onToggle }: any) {
    return (
        <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
            <div>
                <h4 className="font-black text-sm text-white uppercase italic tracking-wide">{label}</h4>
                <p className="text-[11px] text-white/50 font-medium">{desc}</p>
            </div>
            <Toggle checked={checked} onChange={onToggle} />
        </div>
    );
}

function InputWrapper({ label, children, full }: any) {
    return (
        <div className={full ? 'col-span-2' : ''}>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2.5 block px-1">{label}</label>
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
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-primary transition-colors"></div>
        </label>
    );
}

function SetupInstructions({ content }: { content: string[] }) {
    return (
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2.5">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 italic">
                <Info size={12} /> Setup Guide
            </h4>
            <ul className="list-disc pl-4 space-y-1">
                {content.map((c, i) => (
                    <li key={i} className="text-[10px] text-white/70 font-medium">{c}</li>
                ))}
            </ul>
        </div>
    );
}
