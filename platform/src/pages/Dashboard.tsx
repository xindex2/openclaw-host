import { useState, useEffect } from 'react';
import {
    Bot, Settings, Cpu, Share2, Play, Square,
    Globe, MessageSquare, Github, Terminal, Search,
    Zap, Layout, ShieldAlert, Server, Activity,
    ChevronRight, Database, Lock, Rocket, Sparkles,
    RefreshCcw, Plus, Trash2, Edit3, X, ChevronLeft,
    FileText, Clock, HardDrive, Command, CreditCard, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useAuth } from '../context/AuthContext';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const ICONS = {
    telegram: 'https://telegram.org/favicon.ico',
    discord: 'https://discord.com/favicon.ico',
    whatsapp: 'https://whatsapp.com/favicon.ico',
    feishu: 'https://www.feishu.cn/favicon.ico',
    openai: 'https://openai.com/favicon.ico',
    anthropic: 'https://www.anthropic.com/favicon.ico',
    google: 'https://www.google.com/favicon.ico',
    brave: 'https://brave.com/static-assets/images/brave-favicon.png'
};

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
    feishuEnabled: boolean;
    feishuAppId: string;
    feishuAppSecret: string;
    webSearchApiKey: string;
    githubToken: string;
    browserEnabled: boolean;
    shellEnabled: boolean;
    restrictToWorkspace: boolean;
    gatewayHost: string;
    gatewayPort: number;
    maxToolIterations: number;
    status: string;
}

export default function Dashboard() {
    const { user } = useAuth();
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
            setProfileForm({ full_name: user.full_name, avatar_url: user.avatar_url || '', password: '' });
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
            discordEnabled: false,
            whatsappEnabled: false,
            feishuEnabled: false,
            browserEnabled: true,
            shellEnabled: false,
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ configId, action })
        });
        if (resp.ok) {
            fetchAgents();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Bot size={64} className="text-blue-500 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex font-sans overflow-hidden">
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-50 mix-blend-overlay" />

            <AnimatePresence mode="wait">
                {!editingAgent ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex-1 p-16 overflow-y-auto"
                    >
                        <header className="flex justify-between items-end mb-16">
                            <div>
                                <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-[0.4em] mb-4">
                                    <Sparkles size={14} /> Fleet Intelligence
                                </div>
                                <h1 className="text-7xl font-black italic uppercase tracking-tighter decoration-blue-600/30 underline underline-offset-8">
                                    The Squad
                                </h1>
                            </div>
                            <button
                                onClick={handleCreateAgent}
                                className="bg-white text-black px-10 py-5 rounded-3xl font-black text-sm tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
                            >
                                <Plus size={20} strokeWidth={3} /> RECRUIT AGENT
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
                            {agents.length === 0 && (
                                <div className="col-span-full py-32 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-gray-600">
                                    <Bot size={80} className="mb-6 opacity-20" />
                                    <p className="font-bold text-xl uppercase tracking-widest italic">No Active Agents in Fleet</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="flex-1 flex"
                    >
                        <Sidebar
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            onBack={() => setEditingAgent(null)}
                        />
                        <main className="flex-1 p-16 overflow-y-auto relative">
                            <header className="mb-12">
                                <button onClick={() => setEditingAgent(null)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-6">
                                    <ChevronLeft size={16} /> Return to Fleet
                                </button>
                                <div className="flex items-center gap-3 mb-2">
                                    <input
                                        value={editingAgent.name}
                                        onChange={e => setEditingAgent({ ...editingAgent, name: e.target.value })}
                                        className="bg-transparent text-6xl font-black tracking-tighter uppercase italic outline-none border-b border-transparent focus:border-white/10 w-full"
                                    />
                                </div>
                                <input
                                    value={editingAgent.description}
                                    onChange={e => setEditingAgent({ ...editingAgent, description: e.target.value })}
                                    placeholder="Short mission description..."
                                    className="bg-transparent text-gray-500 text-lg font-medium outline-none w-full"
                                />
                            </header>

                            <div className="max-w-4xl space-y-12 pb-32">
                                {activeTab === 'provider' && (
                                    <Section icon={<Cpu className="text-blue-500" />} title="Intelligence" desc="Core brain and provider keys.">
                                        <div className="grid grid-cols-2 gap-8">
                                            <InputWrapper label="Provider">
                                                <select
                                                    value={editingAgent.provider}
                                                    onChange={e => setEditingAgent({ ...editingAgent, provider: e.target.value })}
                                                    className="form-select"
                                                >
                                                    <option value="openrouter">OpenRouter (Recommended)</option>
                                                    <option value="anthropic">Anthropic</option>
                                                    <option value="openai">OpenAI</option>
                                                    <option value="deepseek">DeepSeek</option>
                                                    <option value="gemini">Google Gemini</option>
                                                    <option value="groq">Groq</option>
                                                    <option value="moonshot">Moonshot AI (Kimi)</option>
                                                    <option value="zhipu">Zhipu AI (GLM)</option>
                                                    <option value="vllm">vLLM / Self-Hosted</option>
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
                                            onToggle={(v) => setEditingAgent({ ...editingAgent, telegramEnabled: v })}
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
                                            onToggle={(v) => setEditingAgent({ ...editingAgent, discordEnabled: v })}
                                        >
                                            <input
                                                type="password"
                                                placeholder="Bot Token"
                                                value={editingAgent.discordToken}
                                                onChange={e => setEditingAgent({ ...editingAgent, discordToken: e.target.value })}
                                                className="form-input font-mono text-sm"
                                            />
                                        </ChannelInput>
                                    </div>
                                )}

                                {activeTab === 'tools' && (
                                    <div className="grid grid-cols-2 gap-8">
                                        <ToolCard
                                            title="Web Search" icon={<Search className="text-blue-500" />}
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
                                            title="Browser" icon={<Globe className="text-cyan-500" />}
                                            desc="Headless Chrome automation."
                                            onToggle={(v) => setEditingAgent({ ...editingAgent, browserEnabled: v })}
                                            checked={editingAgent.browserEnabled}
                                        />
                                        <ToolCard
                                            title="Shell" icon={<Terminal className="text-amber-500" />}
                                            desc="Isolated command execution."
                                            onToggle={(v) => setEditingAgent({ ...editingAgent, shellEnabled: v })}
                                            checked={editingAgent.shellEnabled}
                                        />
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
                                                onToggle={(v) => setEditingAgent({ ...editingAgent, restrictToWorkspace: v })}
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
                                                    { name: 'One Agent', price: '$19', color: 'border-blue-500/20', btn: 'bg-white/5' },
                                                    { name: '5 Agents', price: '$69', color: 'border-amber-500/20', btn: 'bg-amber-500/10 text-amber-500', popular: true },
                                                    { name: '10 Agents', price: '$99', color: 'border-purple-500/20', btn: 'bg-white/5' }
                                                ].map((plan: any) => (
                                                    <div key={plan.name} className={cn("p-6 rounded-[2rem] border bg-white/2 flex flex-col gap-4", plan.color, plan.popular && "bg-amber-500/5")}>
                                                        <div>
                                                            <h3 className="font-black italic uppercase text-lg">{plan.name}</h3>
                                                            <div className="text-3xl font-black mt-2">{plan.price}<span className="text-sm text-gray-500 font-medium">/mo</span></div>
                                                        </div>
                                                        <a href="https://whop.com/hub/" target="_blank" className={cn("mt-auto py-3 rounded-xl font-bold text-center text-xs uppercase tracking-widest transition-all hover:scale-105", plan.btn)}>
                                                            {plan.popular ? 'Most Popular' : 'Select Plan'}
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
                                        <Section icon={<User className="text-blue-500" />} title="Commander Profile" desc="Identity and credentials.">
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
                                                            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:scale-105 transition-all"
                                                        >
                                                            Save Profile
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Section>
                                    </div>
                                )}

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
                                        className="bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black text-sm tracking-widest shadow-2xl shadow-blue-600/30 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
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
                "bg-white/2 border border-white/5 rounded-[3rem] p-10 flex flex-col gap-8 transition-all relative overflow-hidden group hover:border-white/10",
                isRunning && "bg-blue-600/[0.03] border-blue-500/20"
            )}
        >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onDelete} className="text-gray-600 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                </button>
            </div>

            <div className="flex items-center justify-between">
                <div className={cn(
                    "w-16 h-16 rounded-3xl flex items-center justify-center transition-all",
                    isRunning ? "bg-blue-500 text-white shadow-2xl shadow-blue-500/40" : "bg-white/5 text-gray-500"
                )}>
                    <Bot size={32} />
                </div>
                <div className="flex items-center gap-2">
                    {agent.telegramEnabled && <img src={ICONS.telegram} className="w-4 h-4 rounded-full" />}
                    {agent.discordEnabled && <img src={ICONS.discord} className="w-4 h-4 rounded-full" />}
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1 leading-none">{agent.name}</h3>
                <p className="text-sm text-gray-500 font-medium line-clamp-1">{agent.description}</p>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", isRunning ? "bg-green-500 animate-pulse" : "bg-gray-700")} />
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", isRunning ? "text-green-500" : "text-gray-600")}>
                        {isRunning ? 'Deployed' : 'IDLE'}
                    </span>
                </div>
                <div className="flex gap-4">
                    <button onClick={onEdit} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors text-gray-400">
                        <Edit3 size={18} />
                    </button>
                    <button
                        onClick={onToggle}
                        className={cn(
                            "p-4 rounded-2xl transition-all shadow-xl",
                            isRunning ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-white text-black hover:scale-105"
                        )}
                    >
                        {isRunning ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function Sidebar({ activeTab, setActiveTab, onBack }: any) {
    return (
        <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-3xl p-8 flex flex-col gap-10">
            <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <Bot size={22} className="text-white" />
                </div>
                <div>
                    <span className="text-xl font-black italic tracking-tighter uppercase block leading-none">zakibot</span>
                    <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Enterprise</span>
                </div>
            </div>
            <nav className="flex flex-col gap-2">
                <SidebarTab active={activeTab === 'provider'} onClick={() => setActiveTab('provider')} icon={<Cpu size={18} />} label="Intelligence" />
                <SidebarTab active={activeTab === 'channels'} onClick={() => setActiveTab('channels')} icon={<Share2 size={18} />} label="Chat Hub" />
                <SidebarTab active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} icon={<Terminal size={18} />} label="Capabilities" />
                <SidebarTab active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Server size={18} />} label="Deployment" />

                <div className="h-px bg-white/5 my-4" />

                <SidebarTab active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={<CreditCard size={18} />} label="Billing" />
                <SidebarTab active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18} />} label="Profile" />
            </nav>
        </aside>
    );
}

function SidebarTab({ icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm tracking-tight transition-all text-left",
                active ? "bg-blue-600/10 text-blue-500" : "text-gray-500 hover:text-white"
            )}
        >
            <div className={cn("transition-colors", active ? "text-blue-500" : "text-gray-600")}>
                {icon}
            </div>
            {label}
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
            enabled ? "bg-blue-600/5 border-blue-500/20" : "bg-white/2 border-white/5"
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
            "p-10 rounded-[2.5rem] border transition-all relative overflow-hidden group",
            (checked || (!onToggle && children)) ? "bg-blue-600/5 border-blue-500/20" : "bg-white/2 border-white/5"
        )}>
            <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center">
                    {icon}
                </div>
                {onToggle && <Toggle checked={checked} onChange={onToggle} />}
            </div>
            <h3 className="text-xl font-black italic uppercase mb-2">{title}</h3>
            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">{desc}</p>
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
            <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 block opacity-60 px-1">{label}</label>
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
            <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    );
}
