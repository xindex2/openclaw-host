import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bot, Cpu, Share2, Terminal, Server, CreditCard, User, LogOut, Search, Globe, HardDrive, Clock,
    Trash2, Play, Square, Settings, LayoutDashboard, ChevronRight, CheckCircle, Plus, Rocket,
    Cloud, FileText, Lock, Sparkles, ChevronLeft, Edit3, Activity, Check, Info, Loader2, Zap, Layout,
    MessageSquare, Smartphone, QrCode, ShieldAlert, Layers
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
    { id: 'openrouter', name: 'OpenRouter (Global)', icon: 'https://openrouter.ai/favicon.ico' },
    { id: 'anthropic', name: 'Anthropic Claude', icon: 'https://www.anthropic.com/favicon.ico' },
    { id: 'openai', name: 'OpenAI GPT', icon: 'https://openai.com/favicon.ico' },
    { id: 'deepseek', name: 'DeepSeek', icon: 'https://www.deepseek.com/favicon.ico' },
    { id: 'google', name: 'Google Gemini', icon: 'https://www.google.com/favicon.ico' },
    { id: 'groq', name: 'Groq (Llama/Mixtral)', icon: 'https://groq.com/favicon.ico' },
    { id: 'moonshot', name: 'Moonshot / Kimi', icon: 'https://www.moonshot.cn/favicon.ico' },
    { id: 'dashscope', name: 'DashScope (Qwen)', icon: 'https://help.aliyun.com/favicon.ico' },
    { id: 'aihubmix', name: 'AIHubMix', icon: 'https://aihubmix.com/favicon.ico' },
    { id: 'vllm', name: 'vLLM (Local)', icon: 'https://vllm.ai/favicon.ico' },
    { id: 'zhipu', name: 'Zhipu AI (GLM)', icon: 'https://www.zhipuai.cn/favicon.ico' },
];

const SUGGESTED_MODELS = [
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3-opus',
    'anthropic/claude-3-5-haiku',
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    'openai/o1-preview',
    'deepseek/deepseek-chat',
    'deepseek/deepseek-coder',
    'google/gemini-pro-1.5',
    'meta-llama/llama-3.1-405b',
    'meta-llama/llama-3.1-70b',
    'mistralai/pixtral-12b',
    'moonshot/moonshot-v1-8k',
    'qwen/qwen-2.5-72b-instruct'
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
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [agents, setAgents] = useState<AgentConfig[]>([]);
    const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('provider');
    const [isSaving, setIsSaving] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [subscription, setSubscription] = useState<any>(null);

    useEffect(() => {
        if (user) {
            fetchAgents();
            fetchSubscription();
            const interval = setInterval(() => {
                fetchAgents();
                fetchSubscription();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchSubscription = async () => {
        if (!token) return;
        try {
            const resp = await fetch('/api/subscription', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setSubscription(data);
            }
        } catch (err) {
            console.error('Failed to fetch subscription:', err);
        }
    };

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

    const fetchQr = async (configId: string) => {
        try {
            const resp = await fetch(`/api/bot/qr/${configId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setQrCode(data.qr);
            }
        } catch (e) { }
    };

    const handleCreateAgent = () => {
        if (subscription && subscription.currentCount >= subscription.maxInstances) {
            if (confirm(`Operational Capacity Reached: Your ${subscription.plan} plan is limited to ${subscription.maxInstances} active agent slot(s). Would you like to upgrade your fleet capacity?`)) {
                navigate('/billing');
            }
            return;
        }

        const newAgent: any = {
            name: 'New Agent',
            description: 'A helpful AI assistant.',
            provider: 'openrouter',
            model: 'anthropic/claude-3.5-sonnet',
            apiKey: '',
            apiBase: '',
            telegramEnabled: false,
            discordEnabled: false,
            whatsappEnabled: false,
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: user.id, ...config })
            });

            const data = await resp.json();

            if (!resp.ok) {
                if (data.error?.startsWith('AGENT_LIMIT_REACHED')) {
                    if (confirm('Operational Capacity Reached: You have reached your plan limit. Upgrade your account to create more agents?')) {
                        navigate('/billing');
                    }
                } else {
                    alert('Protocol Error: ' + (data.error || 'Failed to save config'));
                }
                return;
            }

            if (resp.ok) {
                await fetchAgents();
                await fetchSubscription();
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
            apiKey: '',
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
            await fetchSubscription();
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
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 md:px-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
                {!editingAgent ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        {agents.length === 0 ? (
                            <DeployWizard
                                user={user}
                                onDeploy={handleCreateAgentFromWizard}
                                isDeploying={isSaving}
                            />
                        ) : (
                            <>
                                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-8 rounded-3xl">
                                    <div className="space-y-1">
                                        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                            Fleet Command
                                        </h1>
                                        <p className="text-white/40 text-sm font-medium">Manage your fleet of autonomous nanobots.</p>
                                    </div>
                                    <button
                                        onClick={handleCreateAgent}
                                        className="btn-primary-modern flex items-center gap-2 px-8 py-4"
                                    >
                                        <Plus size={20} strokeWidth={3} />
                                        <span>Deploy New Agent</span>
                                    </button>
                                </header>

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
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="glass-panel flex flex-col md:flex-row min-h-[85vh] rounded-[2.5rem] overflow-hidden border border-white/5"
                    >
                        {/* Editor Sidebar */}
                        <aside className="w-full md:w-72 border-r border-white/5 bg-black/20 p-8 flex flex-col gap-8 shrink-0">
                            <div>
                                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-6 pl-2">Mission Parameters</div>
                                <nav className="flex flex-col gap-2">
                                    {[
                                        { id: 'provider', label: 'AI Engine', icon: <Cpu size={16} /> },
                                        { id: 'channels', label: 'Channels', icon: <Share2 size={16} /> },
                                        { id: 'tools', label: 'Capabilities', icon: <Terminal size={16} /> },
                                        { id: 'system', label: 'System', icon: <Settings size={16} /> },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[11px] transition-all text-left uppercase tracking-widest",
                                                activeTab === tab.id
                                                    ? "text-primary bg-primary/5 border border-primary/20 shadow-inner"
                                                    : "text-white/40 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            {tab.icon}
                                            <span>{tab.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </aside>

                        {/* Editor Content */}
                        <main className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar relative">
                            <header className="mb-12 flex items-center justify-between">
                                <div className="flex-1 max-w-2xl">
                                    <button onClick={() => setEditingAgent(null)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest mb-6">
                                        <ChevronLeft size={14} /> Back to fleet
                                    </button>
                                    <input
                                        value={editingAgent.name}
                                        onChange={e => setEditingAgent({ ...editingAgent, name: e.target.value })}
                                        className="bg-transparent text-5xl font-black text-white outline-none w-full placeholder:text-white/10 uppercase italic tracking-tighter mb-4"
                                        placeholder="AGENT DESIGNATION"
                                    />
                                    <textarea
                                        value={editingAgent.description}
                                        onChange={e => setEditingAgent({ ...editingAgent, description: e.target.value })}
                                        placeholder="Define the mission objective for this agent..."
                                        className="bg-transparent text-white/50 text-base font-medium outline-none w-full resize-none h-12"
                                    />
                                </div>
                            </header>

                            <div className="space-y-16 pb-32">
                                {activeTab === 'provider' && (
                                    <Section icon={<Layers className="text-primary" />} title="AI Brain" desc="Configure the LLM engine and models.">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                                            <InputWrapper label="Provider">
                                                <select
                                                    value={editingAgent.provider}
                                                    onChange={e => setEditingAgent({ ...editingAgent, provider: e.target.value })}
                                                    className="input-modern w-full"
                                                >
                                                    {PROVIDERS.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </InputWrapper>
                                            <InputWrapper label="Model Designation">
                                                <div className="relative">
                                                    <input
                                                        list="models"
                                                        value={editingAgent.model}
                                                        onChange={e => setEditingAgent({ ...editingAgent, model: e.target.value })}
                                                        className="input-modern w-full font-mono"
                                                        placeholder="Select or enter model ID..."
                                                    />
                                                    <datalist id="models">
                                                        {SUGGESTED_MODELS.map(m => (
                                                            <option key={m} value={m} />
                                                        ))}
                                                    </datalist>
                                                </div>
                                                <p className="text-[10px] text-white/20 mt-2 font-medium">Use any model ID supported by your provider.</p>
                                            </InputWrapper>
                                            <InputWrapper label="API Secret Key" full>
                                                <input
                                                    type="password"
                                                    value={editingAgent.apiKey}
                                                    onChange={e => setEditingAgent({ ...editingAgent, apiKey: e.target.value })}
                                                    className="input-modern w-full font-mono"
                                                    placeholder="Enter your API key here..."
                                                />
                                            </InputWrapper>
                                            {editingAgent.provider === 'vllm' && (
                                                <InputWrapper label="Base URL (vLLM / Local)" full>
                                                    <input
                                                        value={editingAgent.apiBase || ''}
                                                        onChange={e => setEditingAgent({ ...editingAgent, apiBase: e.target.value })}
                                                        className="input-modern w-full font-mono"
                                                        placeholder="http://localhost:8000/v1"
                                                    />
                                                </InputWrapper>
                                            )}
                                        </div>
                                    </Section>
                                )}

                                {activeTab === 'channels' && (
                                    <Section icon={<MessageSquare className="text-vibrant-secondary" />} title="Communication Hub" desc="Connect your agent to messaging platforms.">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
                                            <ChannelInput
                                                name="Telegram" icon={ICONS.telegram}
                                                enabled={editingAgent.telegramEnabled}
                                                onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, telegramEnabled: v })}
                                            >
                                                <div className="space-y-4">
                                                    <div className="bg-white/5 p-4 rounded-2xl text-[11px] text-white/60 leading-relaxed border border-white/5">
                                                        Get a token from <a href="https://t.me/botfather" target="_blank" className="text-primary hover:underline">@BotFather</a>.
                                                    </div>
                                                    <InputWrapper label="Bot Token">
                                                        <input
                                                            type="password"
                                                            value={editingAgent.telegramToken || ''}
                                                            onChange={e => setEditingAgent({ ...editingAgent, telegramToken: e.target.value })}
                                                            className="input-modern w-full font-mono text-xs"
                                                            placeholder="123456:AABBCC..."
                                                        />
                                                    </InputWrapper>
                                                    <InputWrapper label="Allowed Users (IDs)">
                                                        <input
                                                            value={editingAgent.telegramAllowFrom || ''}
                                                            onChange={e => setEditingAgent({ ...editingAgent, telegramAllowFrom: e.target.value })}
                                                            className="input-modern w-full text-xs"
                                                            placeholder="e.g. 1234567, 7654321"
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
                                                    <div className="bg-white/5 p-4 rounded-2xl text-[11px] text-white/60 leading-relaxed border border-white/5">
                                                        Create a bot at <a href="https://discord.com/developers" target="_blank" className="text-primary hover:underline">Discord Portal</a>. Enable <span className="text-white font-bold">Message Content Intent</span>.
                                                    </div>
                                                    <InputWrapper label="Bot Token">
                                                        <input
                                                            type="password"
                                                            value={editingAgent.discordToken || ''}
                                                            onChange={e => setEditingAgent({ ...editingAgent, discordToken: e.target.value })}
                                                            className="input-modern w-full font-mono text-xs"
                                                        />
                                                    </InputWrapper>
                                                </div>
                                            </ChannelInput>

                                            <ChannelInput
                                                name="WhatsApp" icon={ICONS.whatsapp}
                                                enabled={editingAgent.whatsappEnabled}
                                                onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, whatsappEnabled: v })}
                                            >
                                                <div className="space-y-4">
                                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-6">
                                                        <div className="text-center space-y-2">
                                                            <div className="text-xs font-black uppercase text-white">Device Linking</div>
                                                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Scan the QR below with WhatsApp</p>
                                                        </div>
                                                        <div className="w-48 h-48 bg-white rounded-3xl p-4 flex items-center justify-center relative overflow-hidden group">
                                                            {qrCode ? (
                                                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`} alt="WhatsApp QR" className="w-full h-full" />
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-2 text-black/20">
                                                                    <QrCode size={48} />
                                                                    <span className="text-[10px] font-black uppercase">No Active QR</span>
                                                                </div>
                                                            )}
                                                            <button
                                                                onClick={() => fetchQr(editingAgent.id)}
                                                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white"
                                                            >
                                                                <Rocket size={24} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Refresh Sync</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <InputWrapper label="Allowed Contacts (+CountryCode)">
                                                        <input
                                                            value={editingAgent.whatsappAllowFrom || ''}
                                                            onChange={e => setEditingAgent({ ...editingAgent, whatsappAllowFrom: e.target.value })}
                                                            className="input-modern w-full text-xs"
                                                            placeholder="e.g. +123456789, +987654321"
                                                        />
                                                    </InputWrapper>
                                                </div>
                                            </ChannelInput>

                                            <ChannelInput
                                                name="Feishu" icon={ICONS.feishu}
                                                enabled={editingAgent.feishuEnabled}
                                                onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, feishuEnabled: v })}
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <InputWrapper label="App ID">
                                                        <input
                                                            value={editingAgent.feishuAppId || ''}
                                                            onChange={e => setEditingAgent({ ...editingAgent, feishuAppId: e.target.value })}
                                                            className="input-modern w-full text-xs"
                                                            placeholder="cli_..."
                                                        />
                                                    </InputWrapper>
                                                    <InputWrapper label="App Secret">
                                                        <input
                                                            type="password"
                                                            value={editingAgent.feishuAppSecret || ''}
                                                            onChange={e => setEditingAgent({ ...editingAgent, feishuAppSecret: e.target.value })}
                                                            className="input-modern w-full text-xs"
                                                        />
                                                    </InputWrapper>
                                                    <InputWrapper label="Allow From (User IDs)" full>
                                                        <input
                                                            value={editingAgent.feishuAllowFrom || ''}
                                                            onChange={e => setEditingAgent({ ...editingAgent, feishuAllowFrom: e.target.value })}
                                                            className="input-modern w-full text-xs"
                                                            placeholder="ou_..., ou_..."
                                                        />
                                                    </InputWrapper>
                                                </div>
                                            </ChannelInput>
                                        </div>
                                    </Section>
                                )}

                                {activeTab === 'tools' && (
                                    <Section icon={<Terminal className="text-primary" />} title="Agent Skills" desc="Enable advanced tools and capabilities.">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                                            <ToolCard
                                                title="Web Browser" icon={<Globe size={20} />}
                                                desc="Full internet access via headless browser."
                                                checked={editingAgent.browserEnabled}
                                                onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, browserEnabled: v })}
                                            />
                                            <ToolCard
                                                title="System Shell" icon={<Terminal size={20} />}
                                                desc="Execute commands on the host system."
                                                checked={editingAgent.shellEnabled}
                                                onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, shellEnabled: v })}
                                            />
                                            <ToolCard
                                                title="Tmux Persistence" icon={<Layers size={20} />}
                                                desc="Enable persistent terminal sessions."
                                                checked={editingAgent.tmuxEnabled}
                                                onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, tmuxEnabled: v })}
                                            />
                                            <ToolCard
                                                title="Brave Search" icon={<Search size={20} />}
                                                desc="Real-time web search integration."
                                                checked={!!editingAgent.webSearchApiKey}
                                            >
                                                <input
                                                    type="password"
                                                    value={editingAgent.webSearchApiKey || ''}
                                                    onChange={e => setEditingAgent({ ...editingAgent, webSearchApiKey: e.target.value })}
                                                    className="input-modern w-full text-[10px] mt-2"
                                                    placeholder="Enter Search API Key..."
                                                />
                                            </ToolCard>
                                            <ToolCard
                                                title="Firecrawl" icon={<Sparkles size={20} />}
                                                desc="Advanced web scraping for summarization."
                                                checked={!!editingAgent.firecrawlApiKey}
                                            >
                                                <input
                                                    type="password"
                                                    value={editingAgent.firecrawlApiKey || ''}
                                                    onChange={e => setEditingAgent({ ...editingAgent, firecrawlApiKey: e.target.value })}
                                                    className="input-modern w-full text-[10px] mt-2"
                                                    placeholder="Firecrawl API Key..."
                                                />
                                            </ToolCard>
                                            <ToolCard
                                                title="Apify" icon={<Activity size={20} />}
                                                desc="Cloud tools and data extraction."
                                                checked={!!editingAgent.apifyApiToken}
                                            >
                                                <input
                                                    type="password"
                                                    value={editingAgent.apifyApiToken || ''}
                                                    onChange={e => setEditingAgent({ ...editingAgent, apifyApiToken: e.target.value })}
                                                    className="input-modern w-full text-[10px] mt-2"
                                                    placeholder="Apify API Token..."
                                                />
                                            </ToolCard>
                                        </div>
                                    </Section>
                                )}

                                {activeTab === 'system' && (
                                    <Section icon={<Server className="text-white/40" />} title="System Tuning" desc="Configure security and performance.">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                                            <div className="col-span-full">
                                                <ToggleRow
                                                    icon={<Lock className="text-orange-500" />}
                                                    label="Workspace Isolation"
                                                    desc="Restrict file system access to the project directory."
                                                    checked={editingAgent.restrictToWorkspace}
                                                    onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, restrictToWorkspace: v })}
                                                />
                                            </div>
                                            <InputWrapper label="Execution Step Limit">
                                                <input
                                                    type="number"
                                                    value={editingAgent.maxToolIterations}
                                                    onChange={e => setEditingAgent({ ...editingAgent, maxToolIterations: parseInt(e.target.value) })}
                                                    className="input-modern w-full font-mono"
                                                />
                                            </InputWrapper>
                                            <InputWrapper label="Gateway Listener Port">
                                                <input
                                                    type="number"
                                                    value={editingAgent.gatewayPort}
                                                    onChange={e => setEditingAgent({ ...editingAgent, gatewayPort: parseInt(e.target.value) })}
                                                    className="input-modern w-full font-mono"
                                                />
                                            </InputWrapper>
                                        </div>
                                    </Section>
                                )}
                            </div>

                            {/* Floating Action Bar */}
                            <div className="fixed bottom-12 right-12 flex items-center gap-4 z-50">
                                <button
                                    onClick={() => deleteAgent(editingAgent.id)}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <button
                                    onClick={() => saveConfig(editingAgent)}
                                    disabled={isSaving}
                                    className="btn-primary-modern px-10 py-5 flex items-center gap-3 shadow-2xl shadow-primary/20"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Rocket size={20} />}
                                    <span className="font-black text-sm uppercase tracking-widest">Deploy Mission</span>
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
                "glass-card p-8 flex flex-col gap-6 relative group rounded-[2.5rem] border border-white/5 transition-all duration-500",
                isRunning && "border-primary/20 bg-primary/[0.02]"
            )}
        >
            <div className="flex items-center justify-between">
                <div className={cn(
                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all shadow-inner",
                    isRunning ? "bg-gradient-to-br from-primary to-primary-glow text-white shadow-primary/20" : "bg-white/5 text-white/20"
                )}>
                    <Bot size={28} />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        isRunning ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/5 text-white/20"
                    )}>
                        {isRunning ? 'Operational' : 'Idle'}
                    </span>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors uppercase italic tracking-tighter mb-2">{agent.name}</h3>
                <p className="text-[11px] text-white/40 font-medium line-clamp-2 leading-relaxed h-8">{agent.description || 'No mission objective defined.'}</p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                <div className="flex -space-x-2">
                    {agent.telegramEnabled && <ChannelIcon src={ICONS.telegram} />}
                    {agent.discordEnabled && <ChannelIcon src={ICONS.discord} />}
                    {agent.whatsappEnabled && <ChannelIcon src={ICONS.whatsapp} />}
                    {agent.feishuEnabled && <ChannelIcon src={ICONS.feishu} />}
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={onEdit} className="p-3 rounded-2xl hover:bg-white/10 text-white/20 hover:text-white transition-all">
                        <Settings size={18} />
                    </button>
                    <button
                        onClick={onToggle}
                        className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                            isRunning ? "bg-white/5 text-red-500 hover:bg-red-500/10" : "bg-primary text-white hover:scale-110 shadow-lg shadow-primary/20"
                        )}
                    >
                        {isRunning ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function ChannelIcon({ src }: { src: string }) {
    return (
        <div className="w-8 h-8 rounded-full border-2 border-[#050505] bg-white p-1 hover:translate-y-[-4px] transition-transform cursor-help">
            <img src={src} className="w-full h-full object-contain" />
        </div>
    );
}

function Section({ icon, title, desc, children }: any) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner text-white/20 border border-white/5">
                    {icon}
                </div>
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">{title}</h2>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">{desc}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function ChannelInput({ name, icon, enabled, onToggle, children }: any) {
    return (
        <div className={cn(
            "p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden",
            enabled ? "bg-white/[0.02] border-primary/20" : "bg-transparent border-white/5 opacity-40 grayscale"
        )}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white p-2 rounded-2xl shadow-xl">
                        <img src={icon} alt={name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight">{name}</h3>
                        <p className="text-[9px] text-primary font-black uppercase tracking-widest">{enabled ? 'Active Protocol' : 'Standby'}</p>
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
                    >
                        <div className="pt-8 border-t border-white/5">
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
            "p-8 rounded-[2rem] border transition-all duration-500 group flex flex-col h-full",
            checked ? "bg-white/[0.02] border-primary/20" : "bg-transparent border-white/5"
        )}>
            <div className="flex items-center justify-between mb-6">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", checked ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 text-white/10")}>
                    {icon}
                </div>
                {onToggle && <Toggle checked={checked} onChange={onToggle} />}
            </div>
            <h3 className="text-base font-black text-white uppercase italic tracking-tight mb-3">{title}</h3>
            <p className="text-[11px] text-white/40 font-medium leading-relaxed mb-6 flex-1">{desc}</p>
            {children}
        </div>
    );
}

function ToggleRow({ label, desc, icon, checked, onToggle }: any) {
    return (
        <div className="flex items-center justify-between p-6 bg-white/[0.02] rounded-3xl border border-white/5">
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20">
                    {icon}
                </div>
                <div>
                    <h4 className="font-black text-sm text-white uppercase italic tracking-wide">{label}</h4>
                    <p className="text-[11px] text-white/40 font-medium">{desc}</p>
                </div>
            </div>
            <Toggle checked={checked} onChange={onToggle} />
        </div>
    );
}

function InputWrapper({ label, children, full }: any) {
    return (
        <div className={full ? 'col-span-full' : ''}>
            <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-3 block px-1">{label}</label>
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
            <div className="w-12 h-6.5 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-lg after:transition-all peer-checked:bg-primary transition-all duration-300"></div>
        </label>
    );
}
