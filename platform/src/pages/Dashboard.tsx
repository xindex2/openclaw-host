import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bot, Cpu, Share2, Terminal, Server, CreditCard, User, LogOut, Search, Globe, HardDrive, Clock,
    Trash2, Play, Square, Settings, LayoutDashboard, ChevronRight, CheckCircle, Plus, Rocket,
    Cloud, FileText, Lock, Sparkles, ChevronLeft, Edit3, Activity, Check, Info, Loader2, Zap, Layout,
    MessageSquare, Smartphone, QrCode, ShieldAlert, Layers, ExternalLink, Mail, Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useAuth } from '../context/AuthContext';
import DeployWizard from '../components/DeployWizard';
import Logo from '../components/Logo';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const PROVIDER_MODELS: Record<string, string[]> = {
    openrouter: [
        'anthropic/claude-3.5-sonnet',
        'anthropic/claude-3-opus',
        'openai/gpt-4o',
        'openai/gpt-4o-mini',
        'deepseek/deepseek-chat',
        'google/gemini-pro-1.5',
        'meta-llama/llama-3.1-405b',
        'qwen/qwen-2.5-72b-instruct'
    ],
    anthropic: [
        'claude-3-5-sonnet-20240620',
        'claude-3-opus-20240229',
        'claude-3-haiku-20240307'
    ],
    openai: [
        'gpt-4o',
        'gpt-4o-mini',
        'o1-preview',
        'gpt-4-turbo',
        'gpt-3.5-turbo'
    ],
    deepseek: [
        'deepseek-chat',
        'deepseek-coder'
    ],
    google: [
        'gemini-1.5-pro',
        'gemini-1.5-flash'
    ],
    groq: [
        'llama-3.1-70b-versatile',
        'llama-3.1-8b-instant',
        'mixtral-8x7b-32768'
    ],
    moonshot: [
        'moonshot-v1-8k',
        'moonshot-v1-32k'
    ],
    dashscope: [
        'qwen-max',
        'qwen-plus',
        'qwen-turbo'
    ],
    vllm: [
        'custom-local-model'
    ]
};

const PROVIDERS = [
    { id: 'openrouter', name: 'OpenRouter' },
    { id: 'anthropic', name: 'Anthropic' },
    { id: 'openai', name: 'OpenAI' },
    { id: 'deepseek', name: 'DeepSeek' },
    { id: 'google', name: 'Google Gemini' },
    { id: 'groq', name: 'Groq' },
    { id: 'moonshot', name: 'Moonshot' },
    { id: 'dashscope', name: 'DashScope' },
    { id: 'vllm', name: 'vLLM (Local)' },
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
    const { user, token, logout } = useAuth();
    const [agents, setAgents] = useState<AgentConfig[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
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
                if (!selectedAgent && data.length > 0) {
                    setSelectedAgent(data[0]);
                }
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
            id: 'temp-' + Date.now(),
            name: 'New Agent',
            description: 'AI-driven task executor',
            provider: 'openrouter',
            model: 'anthropic/claude-3-haiku-20240307',
            apiKey: '',
            apiBase: '',
            telegramEnabled: false,
            discordEnabled: false,
            whatsappEnabled: false,
            feishuEnabled: false,
            browserEnabled: true,
            shellEnabled: false,
            tmuxEnabled: false,
            restrictToWorkspace: false,
            weatherEnabled: false,
            summarizeEnabled: false,
            gatewayHost: '0.0.0.0',
            gatewayPort: 18790 + (agents.length * 2),
            maxToolIterations: 20,
            status: 'stopped'
        };
        setAgents([newAgent, ...agents]);
        setSelectedAgent(newAgent);
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
                body: JSON.stringify({ ...selectedAgent, userId: user?.id })
            });
            const data = await resp.json();
            if (!resp.ok) {
                if (data.error?.startsWith('AGENT_LIMIT_REACHED')) {
                    if (confirm('Operational Capacity Reached: You have reached your plan limit. Upgrade your account to create more agents?')) {
                        navigate('/billing');
                    }
                } else {
                    throw new Error(data.error || 'Failed to save config');
                }
                return;
            }
            alert('Protocol Updated: Bot configuration saved successfully.');
            fetchAgents();
            fetchSubscription();
        } catch (err: any) {
            alert('Protocol Error: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteAgent = async (id: string) => {
        if (id.startsWith('temp-')) {
            setAgents(agents.filter(a => a.id !== id));
            setSelectedAgent(agents[0] || null);
            return;
        }
        if (!confirm('Are you sure you want to delete this bot?')) return;
        try {
            await fetch(`/api/config/${id}`, { method: 'DELETE' });
            await fetchAgents();
            setSelectedAgent(agents.find(a => a.id !== id) || null);
        } catch (e) { }
    };

    const toggleBot = async (configId: string, currentStatus: string) => {
        if (configId.startsWith('temp-')) {
            alert('Please save the bot before starting it.');
            return;
        }
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

    const filteredAgents = agents.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-[#101828]" size={32} />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8">
                        <Logo size={32} />
                    </div>
                    <span className="text-xl font-bold text-[#101828]">Nanobot</span>
                </div>

                <nav className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-[#f2f4f7] rounded-lg">
                        <button className="flex-1 text-xs font-semibold py-1.5 rounded-md bg-white shadow-sm border border-[#eaecf0]">User</button>
                        <button onClick={() => navigate('/admin')} className="flex-1 text-xs font-semibold py-1.5 text-[#475467]">Admin</button>
                    </div>

                    <NavItem icon={<Inbox size={18} />} label="Inbox" />
                    <NavItem icon={<Bot size={18} />} label="My bots" active />
                    <NavItem icon={<User size={18} />} label="My profile" onClick={() => navigate('/profile')} />
                    <NavItem icon={<Settings size={18} />} label="Settings" />
                    <NavItem icon={<CreditCard size={18} />} label="Billing" onClick={() => navigate('/billing')} />
                </nav>

                <div className="pt-6 border-t border-[#eaecf0] mt-auto">
                    <div className="bg-[#f9fafb] p-4 rounded-xl border border-[#eaecf0]">
                        <p className="text-xs text-[#475467] mb-1">Signed in as</p>
                        <p className="text-xs font-semibold text-[#101828] truncate mb-4">{user?.email}</p>
                        <button onClick={logout} className="w-full flex items-center gap-2 text-xs font-bold text-[#b42318] hover:bg-red-50 p-2 rounded-lg transition-all">
                            <LogOut size={14} /> Log out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                {/* List Column */}
                <div className="list-column">
                    <div className="p-6 border-b border-[#eaecf0] flex items-center justify-between">
                        <h2 className="text-lg font-bold text-[#101828]">My bots</h2>
                        <button onClick={handleCreateAgent} className="btn-primary py-1.5 px-3">
                            <Plus size={16} /> Add
                        </button>
                    </div>
                    <div className="p-4 border-b border-[#eaecf0]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" size={16} />
                            <input
                                type="text"
                                placeholder="Search bots..."
                                className="w-full pl-10 pr-4 py-2 bg-[#f9fafb] border border-[#d0d5dd] rounded-lg text-sm outline-none focus:border-[#101828]"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredAgents.map(agent => (
                            <div
                                key={agent.id}
                                onClick={() => setSelectedAgent(agent)}
                                className={cn("card-item", selectedAgent?.id === agent.id && "active")}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                        agent.status === 'running' ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#f2f4f7] text-[#475467]"
                                    )}>
                                        <Bot size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <span className="font-semibold text-sm text-[#101828] truncate">{agent.name}</span>
                                            {agent.status === 'running' && <span className="badge badge-success">Running</span>}
                                        </div>
                                        <p className="text-xs text-[#475467] truncate">{agent.description || 'No description'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail Column */}
                <div className="detail-column">
                    {selectedAgent ? (
                        <>
                            <div className="sticky top-0 bg-white h-16 border-b border-[#eaecf0] px-8 flex items-center justify-between z-10">
                                <h1 className="text-lg font-bold text-[#101828]">{selectedAgent.name}</h1>
                                <div className="flex items-center gap-3">
                                    <button className="btn-secondary h-9 py-0">
                                        <ExternalLink size={16} /> View
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 space-y-10 max-w-3xl overflow-y-auto" style={{ maxHeight: 'calc(100vh - 128px)' }}>
                                {/* Status Toggle Box */}
                                <div className={cn(
                                    "p-6 rounded-xl border flex items-center justify-between",
                                    selectedAgent.status === 'running' ? "bg-[#ecfdf3] border-[#abefc6]" : "bg-[#f9fafb] border-[#eaecf0]"
                                )}>
                                    <div>
                                        <h3 className="font-bold text-[#101828] mb-1">
                                            {selectedAgent.status === 'running' ? 'Bot is running' : 'Bot is offline'}
                                        </h3>
                                        <p className="text-sm text-[#475467]">
                                            Turn the bot on or off.
                                        </p>
                                    </div>
                                    <div
                                        onClick={() => toggleBot(selectedAgent.id, selectedAgent.status)}
                                        className={cn(
                                            "w-12 h-6 rounded-full relative cursor-pointer transition-all",
                                            selectedAgent.status === 'running' ? "bg-[#039855]" : "bg-[#d0d5dd]"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                            selectedAgent.status === 'running' ? "left-7" : "left-1"
                                        )} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-8 pb-32">
                                    <h2 className="text-base font-bold text-[#101828] -mb-4">General Info</h2>
                                    <div>
                                        <label className="label-text">Bot Name</label>
                                        <input
                                            value={selectedAgent.name}
                                            onChange={e => setSelectedAgent({ ...selectedAgent, name: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="label-text">Description</label>
                                        <textarea
                                            value={selectedAgent.description}
                                            onChange={e => setSelectedAgent({ ...selectedAgent, description: e.target.value })}
                                            className="input-field min-h-[100px] py-3"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-[#eaecf0]" />
                                    <h2 className="text-base font-bold text-[#101828] -mb-4">AI Provider</h2>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-text">Provider</label>
                                            <select
                                                value={selectedAgent.provider}
                                                onChange={e => setSelectedAgent({ ...selectedAgent, provider: e.target.value })}
                                                className="input-field bg-white"
                                            >
                                                {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-text">Model</label>
                                            <div className="relative">
                                                <input
                                                    list="models"
                                                    value={selectedAgent.model}
                                                    onChange={e => setSelectedAgent({ ...selectedAgent, model: e.target.value })}
                                                    className="input-field font-mono"
                                                    placeholder="Select or enter model..."
                                                />
                                                <datalist id="models">
                                                    {(PROVIDER_MODELS[selectedAgent.provider] || []).map(m => (
                                                        <option key={m} value={m} />
                                                    ))}
                                                </datalist>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label-text">API Key</label>
                                        <input
                                            type="password"
                                            value={selectedAgent.apiKey}
                                            onChange={e => setSelectedAgent({ ...selectedAgent, apiKey: e.target.value })}
                                            className="input-field font-mono"
                                            placeholder="sk-..."
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-[#eaecf0]" />
                                    <h2 className="text-base font-bold text-[#101828] -mb-4">Connect Channels</h2>

                                    <div className="space-y-4">
                                        <ChannelToggle
                                            name="Telegram"
                                            icon={<MessageSquare size={18} />}
                                            checked={selectedAgent.telegramEnabled}
                                            onToggle={(v: boolean) => setSelectedAgent({ ...selectedAgent, telegramEnabled: v })}
                                        >
                                            <div className="space-y-4 pt-4">
                                                <input
                                                    value={selectedAgent.telegramToken || ''}
                                                    onChange={e => setSelectedAgent({ ...selectedAgent, telegramToken: e.target.value })}
                                                    placeholder="Bot Token"
                                                    className="input-field text-xs"
                                                />
                                                <input
                                                    value={selectedAgent.telegramAllowFrom || ''}
                                                    onChange={e => setSelectedAgent({ ...selectedAgent, telegramAllowFrom: e.target.value })}
                                                    placeholder="Allowed User IDs (comma separated)"
                                                    className="input-field text-xs"
                                                />
                                            </div>
                                        </ChannelToggle>

                                        <ChannelToggle
                                            name="Discord"
                                            icon={<Layout size={18} />}
                                            checked={selectedAgent.discordEnabled}
                                            onToggle={(v: boolean) => setSelectedAgent({ ...selectedAgent, discordEnabled: v })}
                                        >
                                            <div className="space-y-4 pt-4">
                                                <input
                                                    value={selectedAgent.discordToken || ''}
                                                    onChange={e => setSelectedAgent({ ...selectedAgent, discordToken: e.target.value })}
                                                    placeholder="Bot Token"
                                                    className="input-field text-xs"
                                                />
                                            </div>
                                        </ChannelToggle>

                                        <ChannelToggle
                                            name="WhatsApp"
                                            icon={<Smartphone size={18} />}
                                            checked={selectedAgent.whatsappEnabled}
                                            onToggle={(v: boolean) => setSelectedAgent({ ...selectedAgent, whatsappEnabled: v })}
                                        >
                                            <div className="space-y-4 pt-4">
                                                <div className="flex items-center gap-4 p-4 bg-[#f9fafb] rounded-lg border border-[#eaecf0]">
                                                    <div className="w-24 h-24 bg-white border rounded-lg flex items-center justify-center p-2">
                                                        {qrCode ? (
                                                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrCode)}`} className="w-full h-full" />
                                                        ) : (
                                                            <QrCode className="text-[#d0d5dd]" size={32} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-semibold mb-2">Scan QR to sync</p>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); fetchQr(selectedAgent.id); }}
                                                            className="text-xs font-bold text-[#101828] bg-white border border-[#d0d5dd] px-3 py-1.5 rounded-lg hover:bg-[#f9fafb]"
                                                        >
                                                            Refresh QR
                                                        </button>
                                                    </div>
                                                </div>
                                                <input
                                                    value={selectedAgent.whatsappAllowFrom || ''}
                                                    onChange={e => setSelectedAgent({ ...selectedAgent, whatsappAllowFrom: e.target.value })}
                                                    placeholder="Allowed Numbers (+CountryCode)"
                                                    className="input-field text-xs"
                                                />
                                            </div>
                                        </ChannelToggle>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="sticky bottom-0 bg-white border-t border-[#eaecf0] p-6 px-8 flex items-center justify-between mt-auto z-10">
                                <button
                                    onClick={() => deleteAgent(selectedAgent.id)}
                                    className="text-sm font-semibold text-[#b42318] flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                                <button
                                    onClick={() => saveConfig(selectedAgent)}
                                    disabled={isSaving}
                                    className="btn-primary"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                    Save changes
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-[#667085] p-20 text-center h-full">
                            <Bot size={64} className="mb-6 opacity-20" />
                            <h3 className="text-lg font-bold text-[#101828] mb-2">No bot selected</h3>
                            <p className="text-sm max-w-xs">Select a bot from the list or create a new one to get started.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button onClick={onClick} className={cn("nav-item w-full", active && "active")}>
            {icon}
            {label}
        </button>
    );
}

function ChannelToggle({ name, icon, checked, onToggle, children }: any) {
    return (
        <div className={cn(
            "border border-[#eaecf0] rounded-xl overflow-hidden transition-all",
            checked ? "bg-white shadow-sm ring-1 ring-[#101828]/5" : "bg-[#f9fafb]"
        )}>
            <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => onToggle(!checked)}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        checked ? "bg-[#101828] text-white" : "bg-white border text-[#667085]"
                    )}>
                        {icon}
                    </div>
                    <span className="text-sm font-bold text-[#101828]">{name}</span>
                </div>
                <div className={cn(
                    "w-10 h-5 rounded-full relative transition-all",
                    checked ? "bg-[#101828]" : "bg-[#d0d5dd]"
                )}>
                    <div className={cn(
                        "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all",
                        checked ? "left-5.5" : "left-0.5"
                    )} style={{ left: checked ? '22px' : '2px' }} />
                </div>
            </div>
            {checked && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
}
