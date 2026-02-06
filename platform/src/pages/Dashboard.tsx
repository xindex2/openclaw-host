import { useState, useEffect } from 'react';
import {
    Bot, Cpu, Share2, Terminal, Server, CreditCard, User, LogOut, Search, Globe, HardDrive, Clock,
    Trash2, Play, Square, Settings, LayoutDashboard, ChevronRight, CheckCircle, Plus, Rocket,
    Cloud, FileText, Lock, Sparkles, ChevronLeft, Edit3
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
    telegram: 'https://telegram.org/favicon.ico',
    discord: 'https://discord.com/favicon.ico',
    whatsapp: 'https://whatsapp.com/favicon.ico',
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

    // Profile State
    const [profileForm, setProfileForm] = useState({ full_name: '', avatar_url: '', password: '' });
    const [profileStatus, setProfileStatus] = useState({ loading: false, error: '', success: '' });

    useEffect(() => {
        if (user) {
            setProfileForm({ full_name: user.full_name || '', avatar_url: user.avatar_url || '', password: '' });
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
            name: 'New Squad Member',
            description: 'Autonomous research and execution agent.',
            provider: 'openrouter',
            model: 'anthropic/claude-3.5-sonnet',
            apiKey: '',
            apiBase: '',
            telegramEnabled: false,
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
            gatewayPort: 18790 + (agents.length * 10), // Auto-offset ports
            maxToolIterations: 20
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
        if (!confirm('Are you sure you want to decommission this agent?')) return;
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
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Bot size={64} className="text-[#ff4d4d] animate-pulse" />
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
                        className="space-y-16"
                    >
                        {agents.length === 0 ? (
                            <DeployWizard
                                user={user}
                                onDeploy={handleCreateAgentFromWizard}
                                isDeploying={isSaving}
                            />
                        ) : (
                            <>
                                <header className="flex justify-between items-end">
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em] mb-4">
                                            <Sparkles size={14} className="text-coral-bright" /> Operational Units
                                        </div>
                                        <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                                            The Squad
                                        </h1>
                                    </div>
                                    <button
                                        onClick={handleCreateAgent}
                                        className="bg-white text-black px-10 py-5 rounded-[2rem] font-black text-[11px] tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/5 uppercase"
                                    >
                                        <Plus size={18} strokeWidth={3} /> Recruit Member
                                    </button>
                                </header>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        className="flex-1 flex min-h-[70vh] bg-white/[0.01] border border-white/5 rounded-[4rem] overflow-hidden"
                    >
                        <Sidebar
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            onBack={() => setEditingAgent(null)}
                        />
                        <main className="flex-1 p-16 overflow-y-auto relative custom-scrollbar">
                            <header className="mb-12">
                                <button onClick={() => setEditingAgent(null)} className="flex items-center gap-2 text-gray-700 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-8">
                                    <ChevronLeft size={14} /> Return to Squad
                                </button>
                                <div className="space-y-2">
                                    <input
                                        value={editingAgent.name}
                                        onChange={e => setEditingAgent({ ...editingAgent, name: e.target.value })}
                                        className="bg-transparent text-5xl font-black tracking-tighter uppercase italic outline-none border-b border-transparent focus:border-white/5 w-full placeholder:text-gray-800"
                                        placeholder="Unit Designation"
                                    />
                                    <input
                                        value={editingAgent.description}
                                        onChange={e => setEditingAgent({ ...editingAgent, description: e.target.value })}
                                        placeholder="Define the mission objective..."
                                        className="bg-transparent text-gray-600 text-sm font-medium outline-none w-full"
                                    />
                                </div>
                            </header>

                            <div className="max-w-4xl space-y-12 pb-32">
                                {activeTab === 'provider' && (
                                    <Section icon={<Cpu className="text-[#ff4d4d]" />} title="Intelligence" desc="Core brain and provider keys.">
                                        <div className="grid grid-cols-2 gap-8">
                                            <InputWrapper label="Provider">
                                                <select
                                                    value={editingAgent.provider}
                                                    onChange={e => setEditingAgent({ ...editingAgent, provider: e.target.value })}
                                                    className="form-input"
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
                                    <div className="space-y-6">
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
                                                className="form-input text-xs mt-2"
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
                                                    className="form-input text-[10px]"
                                                />
                                                <input
                                                    placeholder="Verification Token"
                                                    value={editingAgent.feishuVerificationToken || ''}
                                                    onChange={e => setEditingAgent({ ...editingAgent, feishuVerificationToken: e.target.value })}
                                                    className="form-input text-[10px]"
                                                />
                                            </div>
                                        </ChannelInput>
                                    </div>
                                )}

                                {activeTab === 'tools' && (
                                    <div className="grid grid-cols-2 gap-8">
                                        <ToolCard
                                            title="Web Search" icon={<Search className="text-[#ff4d4d]" />}
                                            desc="Live searching via Brave API."
                                        >
                                            <input
                                                type="password"
                                                placeholder="Brave API Key"
                                                value={editingAgent.webSearchApiKey}
                                                onChange={e => setEditingAgent({ ...editingAgent, webSearchApiKey: e.target.value })}
                                                className="form-input text-xs"
                                            />
                                        </ToolCard>
                                        <ToolCard
                                            title="Browser" icon={<Globe className="text-[#00f2ff]" />}
                                            desc="Headless Chrome automation."
                                            onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, browserEnabled: v })}
                                            checked={editingAgent.browserEnabled}
                                        />
                                        <ToolCard
                                            title="Shell" icon={<Terminal className="text-amber-500" />}
                                            desc="Isolated command execution."
                                            onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, shellEnabled: v })}
                                            checked={editingAgent.shellEnabled}
                                        />
                                        <ToolCard
                                            title="Tmux Manager" icon={<Terminal className="text-emerald-500" />}
                                            desc="Persistent background tasks."
                                            onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, tmuxEnabled: v })}
                                            checked={editingAgent.tmuxEnabled}
                                        />
                                        <ToolCard
                                            title="GitHub" icon={<img src={ICONS.github} className="w-4 h-4" />}
                                            desc="Code & Repo management."
                                            onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, githubEnabled: v })}
                                            checked={editingAgent.githubToken ? true : false}
                                        >
                                            <input
                                                type="password"
                                                placeholder="GitHub Token"
                                                value={editingAgent.githubToken || ''}
                                                onChange={e => setEditingAgent({ ...editingAgent, githubToken: e.target.value })}
                                                className="form-input text-xs mt-2"
                                            />
                                        </ToolCard>
                                        <ToolCard
                                            title="Weather" icon={<Cloud className="text-sky-400" />}
                                            desc="Live weather conditions."
                                            onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, weatherEnabled: v })}
                                            checked={editingAgent.weatherEnabled}
                                        />
                                        <ToolCard
                                            title="Summarize" icon={<FileText className="text-orange-400" />}
                                            desc="Web content extraction."
                                            onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, summarizeEnabled: v })}
                                            checked={editingAgent.summarizeEnabled}
                                        >
                                            <div className="space-y-2 mt-2">
                                                <input
                                                    type="password"
                                                    placeholder="Firecrawl API Key"
                                                    value={editingAgent.firecrawlApiKey || ''}
                                                    onChange={e => setEditingAgent({ ...editingAgent, firecrawlApiKey: e.target.value })}
                                                    className="form-input text-[10px]"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="Apify API Token"
                                                    value={editingAgent.apifyApiToken || ''}
                                                    onChange={e => setEditingAgent({ ...editingAgent, apifyApiToken: e.target.value })}
                                                    className="form-input text-[10px]"
                                                />
                                            </div>
                                        </ToolCard>
                                        <ToolCard
                                            title="File System" icon={<HardDrive className="text-gray-400" />}
                                            desc="Read/Write access to workspace."
                                            checked={true}
                                        >
                                            <div className="mt-2 text-[10px] text-gray-500 font-mono bg-white/5 p-2 rounded">
                                                Active (Restricted)
                                            </div>
                                        </ToolCard>
                                        <ToolCard
                                            title="Cron Scheduler" icon={<Clock className="text-purple-400" />}
                                            desc="Scheduled task execution."
                                            checked={true}
                                        >
                                            <div className="mt-2 text-[10px] text-gray-500 font-mono bg-white/5 p-2 rounded">
                                                System Service Active
                                            </div>
                                        </ToolCard>
                                    </div>
                                )}

                                {activeTab === 'system' && (
                                    <div className="space-y-8">
                                        <Section icon={<Lock className="text-red-500" />} title="Security" desc="Process isolation.">
                                            <ToggleRow
                                                label="Restrict to Workspace"
                                                desc="Prevent access outside project folder."
                                                checked={editingAgent.restrictToWorkspace}
                                                onToggle={(v: boolean) => setEditingAgent({ ...editingAgent, restrictToWorkspace: v })}
                                            />
                                        </Section>
                                        <Section icon={<Server className="text-purple-500" />} title="Gateway" desc="Network binding.">
                                            <div className="grid grid-cols-2 gap-8">
                                                <InputWrapper label="Port Offset">
                                                    <input
                                                        type="number"
                                                        value={editingAgent.gatewayPort}
                                                        onChange={e => setEditingAgent({ ...editingAgent, gatewayPort: parseInt(e.target.value) })}
                                                        className="form-input font-mono"
                                                    />
                                                </InputWrapper>
                                                <InputWrapper label="Max Interactions">
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

                                {activeTab === 'billing' && (
                                    <div className="space-y-8">
                                        <Section icon={<CreditCard className="text-green-500" />} title="Subscription & Billing" desc="Manage your fleet plan.">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {[
                                                    { name: 'Starter', price: '$19', color: 'border-blue-500/20', btn: 'bg-white/5', link: 'https://whop.com/checkout/plan_Ke7ZeyJO29DwZ', agents: 1 },
                                                    { name: 'Professional', price: '$69', color: 'border-amber-500/20', btn: 'bg-amber-500/10 text-amber-500', popular: true, link: 'https://whop.com/checkout/plan_9NRNdPMrVzwi8', agents: 5 },
                                                    { name: 'Elite', price: '$99', color: 'border-purple-500/20', btn: 'bg-white/5', link: 'https://whop.com/checkout/plan_XXO2Ey0ki51AI', agents: 10 }
                                                ].map((plan: any) => (
                                                    <div key={plan.name} className={cn("p-8 rounded-[2.5rem] border bg-white/2 flex flex-col gap-6", plan.color, plan.popular && "bg-amber-500/5")}>
                                                        <div>
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h3 className="font-black italic uppercase text-lg">{plan.name}</h3>
                                                                {plan.popular && <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-full">Popular</span>}
                                                            </div>
                                                            <div className="text-4xl font-black">{plan.price}<span className="text-sm text-gray-500 font-medium">/mo</span></div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mt-2">{plan.agents} Agent Slot{plan.agents > 1 ? 's' : ''}</p>
                                                        </div>
                                                        <a href={plan.link} target="_blank" className={cn("mt-auto py-4 rounded-2xl font-black text-center text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95", plan.btn)}>
                                                            {plan.popular ? 'Upgrade Now' : 'Select Fleet'}
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-8 p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-bold">Manage Subscription</h4>
                                                    <p className="text-sm text-gray-500">View invoices and change payment methods via Whop.</p>
                                                </div>
                                                <a href="https://whop.com/hub/" target="_blank" className="bg-white text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all">
                                                    Open Hub
                                                </a>
                                            </div>
                                        </Section>
                                    </div>
                                )}

                                {activeTab === 'profile' && (
                                    <div className="space-y-8">
                                        <Section icon={<User className="text-[#ff4d4d]" />} title="Commander Profile" desc="Identity and credentials.">
                                            <div className="flex gap-8 items-start">
                                                <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border-2 border-white/10 relative group">
                                                    {profileForm.avatar_url ? (
                                                        <img src={profileForm.avatar_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={48} className="text-gray-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-6">
                                                    <InputWrapper label="Full Name">
                                                        <input
                                                            value={profileForm.full_name}
                                                            onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                                            className="form-input"
                                                        />
                                                    </InputWrapper>
                                                    <InputWrapper label="Avatar URL">
                                                        <input
                                                            value={profileForm.avatar_url}
                                                            onChange={e => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                                                            className="form-input"
                                                            placeholder="https://..."
                                                        />
                                                    </InputWrapper>
                                                    <InputWrapper label="New Password">
                                                        <input
                                                            type="password"
                                                            value={profileForm.password}
                                                            onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                                                            className="form-input"
                                                            placeholder="Leave blank to keep current"
                                                        />
                                                    </InputWrapper>

                                                    <div className="flex justify-end pt-4">
                                                        <button
                                                            onClick={async () => {
                                                                setProfileStatus({ ...profileStatus, loading: true });
                                                                try {
                                                                    const res = await fetch('/api/profile', {
                                                                        method: 'PUT',
                                                                        headers: {
                                                                            'Content-Type': 'application/json',
                                                                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                                                                        },
                                                                        body: JSON.stringify(profileForm)
                                                                    });
                                                                    if (res.ok) alert('Profile updated!');
                                                                } finally {
                                                                    setProfileStatus({ ...profileStatus, loading: false });
                                                                }
                                                            }}
                                                            className="bg-gradient-to-r from-[#ff4d4d] to-[#cc0000] text-white px-8 py-4 rounded-2xl font-black text-sm tracking-widest uppercase hover:scale-105 transition-all shadow-lg shadow-[#ff4d4d]/20"
                                                        >
                                                            Save Profile
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Section>
                                    </div>
                                )}
                                <div className="flex items-center gap-4">
                                    {[
                                        { id: 'intelligence', label: 'Intelligence', icon: <Cpu size={16} /> },
                                        { id: 'channels', label: 'Connectors', icon: <Share2 size={16} /> },
                                        { id: 'tools', label: 'Abilities', icon: <Rocket size={16} /> },
                                        { id: 'system', label: 'Security', icon: <Lock size={16} /> },
                                        { id: 'billing', label: 'Subscription', icon: <CreditCard size={16} /> },
                                        { id: 'profile', label: 'Profile', icon: <User size={16} /> },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                                                activeTab === tab.id
                                                    ? "bg-white text-black shadow-2xl shadow-white/5 scale-105"
                                                    : "text-gray-600 hover:text-gray-400 hover:bg-white/5"
                                            )}
                                        >
                                            {tab.icon}
                                            {tab.label}
                                        </button>
                                    ))}    </div>

                                <div className="fixed bottom-12 right-12 flex items-center gap-6 z-50">
                                    <button
                                        onClick={() => deleteAgent(editingAgent.id)}
                                        className="bg-red-500/10 text-red-500 px-8 py-5 rounded-[2rem] font-black text-sm tracking-widest border border-red-500/20 hover:bg-red-500/20 transition-all"
                                    >
                                        DECOMMISSION
                                    </button>
                                    <button
                                        onClick={() => saveConfig(editingAgent)}
                                        disabled={isSaving}
                                        className="bg-[#00f2ff]/10 text-[#00f2ff] px-8 py-5 rounded-[2rem] font-black text-sm tracking-widest border border-[#00f2ff]/20 hover:bg-[#00f2ff]/20 transition-all"
                                    >
                                        <Rocket size={18} /> DEPLOY AGENT
                                    </button>
                                </div>
                            </div>
                        </main>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}

function AgentCard({ agent, onEdit, onDelete, onToggle }: any) {
    const isRunning = agent.status === 'running';
    return (
        <motion.div
            layout
            className={cn(
                "bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-10 flex flex-col gap-8 transition-all relative overflow-hidden group hover:border-white/10",
                isRunning && "border-coral-bright/20 shadow-[0_0_50px_rgba(255,77,77,0.02)]"
            )}
        >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onDelete} className="text-gray-800 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="flex items-center justify-between">
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                    isRunning ? "bg-white text-black shadow-2xl" : "bg-white/5 text-gray-700"
                )}>
                    <Bot size={24} />
                </div>
                <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                    {agent.telegramEnabled && <img src={ICONS.telegram} className="w-3.5 h-3.5 rounded-full" />}
                    {agent.discordEnabled && <img src={ICONS.discord} className="w-3.5 h-3.5 rounded-full" />}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-1">{agent.name}</h3>
                <p className="text-xs text-gray-600 font-medium line-clamp-2 leading-relaxed">{agent.description}</p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4">
                <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", isRunning ? "bg-green-500 animate-pulse" : "bg-gray-800")} />
                    <span className={cn("text-[9px] font-black uppercase tracking-widest", isRunning ? "text-green-500" : "text-gray-700")}>
                        {isRunning ? 'Operational' : 'Idle'}
                    </span>
                </div>
                <div className="flex gap-3">
                    <button onClick={onEdit} className="p-3.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-gray-600">
                        <Edit3 size={16} />
                    </button>
                    <button
                        onClick={onToggle}
                        className={cn(
                            "p-3.5 rounded-xl transition-all",
                            isRunning ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-white text-black hover:scale-105 active:scale-95"
                        )}
                    >
                        {isRunning ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function Sidebar({ activeTab, setActiveTab, onBack }: any) {
    return (
        <aside className="w-80 border-r border-white/5 bg-white/[0.02] p-8 flex flex-col gap-12 shrink-0">
            <div className="px-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700 mb-6 font-mono">Configuration</p>
                <nav className="flex flex-col gap-1">
                    <SidebarTab active={activeTab === 'provider'} onClick={() => setActiveTab('provider')} icon={<Cpu size={14} />} label="Intelligence" />
                    <SidebarTab active={activeTab === 'channels'} onClick={() => setActiveTab('channels')} icon={<Share2 size={14} />} label="Connectors" />
                    <SidebarTab active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} icon={<Terminal size={14} />} label="Abilities" />
                    <SidebarTab active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Server size={14} />} label="Structure" />
                </nav>
            </div>

            <div className="px-4 mt-auto">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700 mb-6 font-mono">Account</p>
                <nav className="flex flex-col gap-1">
                    <SidebarTab active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={<CreditCard size={14} />} label="Quota" />
                    <SidebarTab active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={14} />} label="Identity" />
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
                "flex items-center gap-4 px-5 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all text-left",
                active ? "bg-white/5 text-white border border-white/5 shadow-xl" : "text-gray-600 hover:text-white"
            )}
        >
            <div className={cn("transition-colors", active ? "text-white" : "text-gray-800")}>
                {icon}
            </div>
            <span className="translate-y-px">{label}</span>
        </button>
    );
}

function Section({ icon, title, desc, children }: any) {
    return (
        <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-10">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h2 className="text-2xl font-black italic uppercase italic tracking-tighter">{title}</h2>
                    <p className="text-xs text-gray-500 font-bold tracking-widest uppercase opacity-60">{desc}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function ChannelInput({ name, icon, enabled, onToggle, children }: any) {
    return (
        <div className={cn(
            "p-8 rounded-[2rem] border transition-all",
            enabled ? "bg-[#ff4d4d]/5 border-[#ff4d4d]/20" : "bg-white/2 border-white/5"
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white p-3 rounded-2xl shadow-xl">
                        <img src={icon} alt={name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold italic uppercase">{name} Link</h3>
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{enabled ? 'Interface Active' : 'Interface Dormant'}</p>
                    </div>
                </div>
                <Toggle checked={enabled} onChange={onToggle} />
            </div>
            {enabled && <div className="mt-8 pt-8 border-t border-white/5">{children}</div>}
        </div>
    );
}

function ToolCard({ title, icon, desc, checked, onToggle, children }: any) {
    return (
        <div className={cn(
            "p-10 rounded-[2.5rem] border transition-all relative overflow-hidden group hover:border-white/10",
            (checked || (!onToggle && children)) ? "bg-white/[0.02] border-white/10" : "bg-transparent border-white/5"
        )}>
            <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 group-hover:text-white transition-colors">
                    {icon}
                </div>
                {onToggle && <Toggle checked={checked} onChange={onToggle} />}
            </div>
            <h3 className="text-lg font-black uppercase mb-2">{title}</h3>
            <p className="text-[11px] text-gray-500 font-medium mb-6 leading-relaxed">{desc}</p>
            {children}
        </div>
    );
}

function ToggleRow({ label, desc, checked, onToggle }: any) {
    return (
        <div className="flex items-center justify-between p-6 bg-white/2 rounded-2xl border border-white/5">
            <div>
                <h4 className="font-bold text-lg">{label}</h4>
                <p className="text-sm text-gray-500 font-medium">{desc}</p>
            </div>
            <Toggle checked={checked} onChange={onToggle} />
        </div>
    );
}

function InputWrapper({ label, children, full }: any) {
    return (
        <div className={full ? 'col-span-2' : ''}>
            <label className="text-[10px] font-black text-[#ff4d4d] uppercase tracking-widest mb-3 block opacity-60 px-1">{label}</label>
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
            <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff4d4d]"></div>
        </label>
    );
}
