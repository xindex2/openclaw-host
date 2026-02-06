'use client';

import { useState, useEffect } from 'react';
import {
    Bot, Settings, Cpu, Share2, Play, Square,
    CheckCircle2, Globe, MessageSquare, Github,
    CloudRain, Terminal, Search, Zap, Layout,
    ShieldAlert, Server, Activity, ChevronRight,
    Database, Lock, Rocket
} from 'lucide-react';

const USER_ID = 'demo-user';

// Official Favicons
const ICONS = {
    telegram: 'https://telegram.org/favicon.ico',
    discord: 'https://discord.com/favicon.ico',
    whatsapp: 'https://whatsapp.com/favicon.ico',
    feishu: 'https://www.feishu.cn/favicon.ico',
    openai: 'https://openai.com/favicon.ico',
    anthropic: 'https://www.anthropic.com/favicon.ico',
    google: 'https://www.google.com/favicon.ico'
};

export default function Dashboard() {
    const [formData, setFormData] = useState({
        provider: 'openrouter',
        apiKey: '',
        apiBase: '',
        model: 'anthropic/claude-opus-4-5',
        telegramEnabled: false,
        telegramToken: '',
        discordEnabled: false,
        discordToken: '',
        whatsappEnabled: false,
        feishuEnabled: false,
        feishuAppId: '',
        feishuAppSecret: '',
        webSearchApiKey: '',
        githubToken: '',
        browserEnabled: true,
        shellEnabled: false,
        restrictToWorkspace: true,
        gatewayHost: '0.0.0.0',
        gatewayPort: 18790,
        maxToolIterations: 20
    });

    const [isRunning, setIsRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('provider');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const configResp = await fetch(`/api/config?userId=${USER_ID}`);
                if (configResp.ok) {
                    const config = await configResp.json();
                    if (config && Object.keys(config).length > 0) {
                        setFormData(prev => ({ ...prev, ...config }));
                    }
                }

                const statusResp = await fetch('/api/bot/control', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: USER_ID, action: 'status' })
                });
                if (statusResp.ok) {
                    const { status } = await statusResp.json();
                    setIsRunning(status === 'running');
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
        }));
    };

    const saveConfig = async () => {
        setIsSaving(true);
        try {
            await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: USER_ID,
                    ...formData
                })
            });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleBot = async () => {
        await saveConfig();
        const action = isRunning ? 'stop' : 'start';
        const resp = await fetch('/api/bot/control', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: USER_ID, action })
        });
        if (resp.ok) {
            const { status } = await resp.json();
            setIsRunning(status === 'running');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                    <Bot size={64} className="text-blue-500 animate-pulse relative z-10" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-xl p-8 flex flex-col gap-12 sticky top-0 h-screen">
                <div className="flex items-center gap-4 px-2 group cursor-pointer">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                        <Bot size={28} className="text-white" />
                    </div>
                    <div>
                        <span className="text-2xl font-black tracking-tighter block uppercase italic">zakibot</span>
                        <span className="text-[10px] text-blue-500 font-bold tracking-[0.2em] uppercase opacity-80">Autonomous Core</span>
                    </div>
                </div>

                <nav className="flex flex-col gap-3">
                    <SidebarTab active={activeTab === 'provider'} onClick={() => setActiveTab('provider')} icon={<Cpu size={18} />} label="AI Brain" sub="Model & Provider" />
                    <SidebarTab active={activeTab === 'channels'} onClick={() => setActiveTab('channels')} icon={<Share2 size={18} />} label="Chat Hub" sub="Telegram, Discord..." />
                    <SidebarTab active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} icon={<Terminal size={18} />} label="Capabilities" sub="Tools & Skills" />
                    <SidebarTab active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Server size={18} />} label="Infrastructure" sub="Gateway & Resources" />
                </nav>

                <div className="mt-auto flex flex-col gap-4">
                    <div className={`p-6 rounded-2xl border transition-all duration-500 ${isRunning ? 'border-green-500/30 bg-green-500/5' : 'border-white/5 bg-white/2'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-gray-600'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isRunning ? 'text-green-500' : 'text-gray-500'}`}>
                                    {isRunning ? 'System Online' : 'Core Offline'}
                                </span>
                            </div>
                            <Activity size={12} className={isRunning ? 'text-green-500' : 'text-gray-600'} />
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                            {isRunning ? 'Subagent manager active. Processing inbound triggers.' : 'Core dormant. Awaiting initialization command.'}
                        </p>
                    </div>

                    <button
                        onClick={toggleBot}
                        disabled={isSaving}
                        className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-sm tracking-widest transition-all transform active:scale-95 disabled:opacity-50 ${isRunning ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20' : 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'}`}
                    >
                        {isRunning ? (
                            <><Square size={16} fill="currentColor" /> TERMINATE CORE</>
                        ) : (
                            <><Play size={16} fill="currentColor" /> INITIALIZE CORE</>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-16 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,_#111_0%,_transparent_50%)]">
                <header className="flex flex-col gap-4 mb-16 relative">
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -z-10" />
                    <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-[0.3em]">
                        <ChevronRight size={14} /> System Configuration
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter">
                        {activeTab === 'provider' && 'Intelligence Hub'}
                        {activeTab === 'channels' && 'Omni-Channel'}
                        {activeTab === 'tools' && 'Skill Registry'}
                        {activeTab === 'system' && 'Core Infrastructure'}
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl font-medium">
                        Fine-tune your autonomous agents brain, communication reach, and interaction toolkit.
                    </p>
                </header>

                <div className="max-w-5xl space-y-12 pb-20">
                    {activeTab === 'provider' && (
                        <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <Section
                                icon={<Lock className="text-blue-500" />}
                                title="Authentication & Provider"
                                desc="Link your LLM core provider and specific intelligence model."
                            >
                                <div className="grid md:grid-cols-2 gap-10">
                                    <InputWrapper label="Intelligence Provider">
                                        <select
                                            name="provider"
                                            value={formData.provider}
                                            onChange={handleChange}
                                            className="form-select text-base"
                                        >
                                            <option value="openrouter">OpenRouter (Global Access)</option>
                                            <option value="anthropic">Anthropic Claude (Direct)</option>
                                            <option value="openai">OpenAI GPT (Direct)</option>
                                            <option value="deepseek">DeepSeek AI</option>
                                            <option value="gemini">Google Gemini</option>
                                            <option value="groq">Groq (LPU Processing)</option>
                                            <option value="zhipu">Zhipu (ChatGLM)</option>
                                            <option value="moonshot">Moonshot (Kimi)</option>
                                            <option value="vllm">Custom vLLM Node</option>
                                        </select>
                                    </InputWrapper>
                                    <InputWrapper label="Model Identifier">
                                        <input
                                            name="model"
                                            value={formData.model}
                                            onChange={handleChange}
                                            placeholder="e.g. anthropic/claude-3.5-sonnet"
                                            className="form-input text-base"
                                        />
                                    </InputWrapper>
                                    <InputWrapper label="Encryption Key (API Key)" full>
                                        <input
                                            name="apiKey"
                                            type="password"
                                            value={formData.apiKey}
                                            onChange={handleChange}
                                            placeholder="sk-..."
                                            className="form-input text-base font-mono"
                                        />
                                    </InputWrapper>
                                    {formData.provider === 'vllm' && (
                                        <InputWrapper label="Custom API Base URL" full>
                                            <input
                                                name="apiBase"
                                                value={formData.apiBase}
                                                onChange={handleChange}
                                                placeholder="http://vllm-node:8000/v1"
                                                className="form-input text-base font-mono"
                                            />
                                        </InputWrapper>
                                    )}
                                </div>
                            </Section>
                        </div>
                    )}

                    {activeTab === 'channels' && (
                        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <ChannelRow
                                name="Telegram"
                                icon={ICONS.telegram}
                                enabled={formData.telegramEnabled}
                                onToggle={handleChange}
                                toggleName="telegramEnabled"
                            >
                                <InputWrapper label="Bot API Token">
                                    <input
                                        name="telegramToken"
                                        type="password"
                                        value={formData.telegramToken}
                                        onChange={handleChange}
                                        placeholder="123456789:ABC..."
                                        className="form-input py-3 text-sm"
                                    />
                                </InputWrapper>
                            </ChannelRow>

                            <ChannelRow
                                name="Discord"
                                icon={ICONS.discord}
                                enabled={formData.discordEnabled}
                                onToggle={handleChange}
                                toggleName="discordEnabled"
                            >
                                <InputWrapper label="Application Bot Token">
                                    <input
                                        name="discordToken"
                                        type="password"
                                        value={formData.discordToken}
                                        onChange={handleChange}
                                        placeholder="MTIzNDU2..."
                                        className="form-input py-3 text-sm"
                                    />
                                </InputWrapper>
                            </ChannelRow>

                            <ChannelRow
                                name="WhatsApp"
                                icon={ICONS.whatsapp}
                                enabled={formData.whatsappEnabled}
                                onToggle={handleChange}
                                toggleName="whatsappEnabled"
                            >
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="text-xs text-blue-400 font-bold mb-2 uppercase tracking-widest">Initialization Required</p>
                                    <p className="text-xs text-gray-500">Scan QR code via CLI: <code className="bg-black/50 px-2 py-0.5 rounded text-white">nanobot channels login</code></p>
                                </div>
                            </ChannelRow>

                            <ChannelRow
                                name="Feishu / Lark"
                                icon={ICONS.feishu}
                                enabled={formData.feishuEnabled}
                                onToggle={handleChange}
                                toggleName="feishuEnabled"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <InputWrapper label="App ID">
                                        <input name="feishuAppId" value={formData.feishuAppId} onChange={handleChange} className="form-input py-3 text-sm" />
                                    </InputWrapper>
                                    <InputWrapper label="App Secret">
                                        <input name="feishuAppSecret" type="password" value={formData.feishuAppSecret} onChange={handleChange} className="form-input py-3 text-sm" />
                                    </InputWrapper>
                                </div>
                            </ChannelRow>
                        </div>
                    )}

                    {activeTab === 'tools' && (
                        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <ToolCard
                                icon={<Search className="text-blue-500" />}
                                title="Web Search"
                                desc="Live data scanning via Brave Search API."
                            >
                                <input
                                    name="webSearchApiKey"
                                    type="password"
                                    value={formData.webSearchApiKey}
                                    onChange={handleChange}
                                    placeholder="Brave API Key"
                                    className="form-input py-3 text-sm"
                                />
                            </ToolCard>

                            <ToolCard
                                icon={<Github className="text-white" />}
                                title="GitHub Management"
                                desc="Control repos, issues, and pull requests."
                            >
                                <input
                                    name="githubToken"
                                    type="password"
                                    value={formData.githubToken}
                                    onChange={handleChange}
                                    placeholder="GitHub Access Token"
                                    className="form-input py-3 text-sm"
                                />
                            </ToolCard>

                            <ToolCard
                                icon={<Globe className="text-cyan-400" />}
                                title="Browser Automation"
                                desc="Headless browser via Playwright (Chrome)."
                                toggleName="browserEnabled"
                                checked={formData.browserEnabled}
                                onToggle={handleChange}
                            />

                            <ToolCard
                                icon={<Terminal className="text-amber-500" />}
                                title="System Sandbox"
                                desc="Isolated shell command execution."
                                toggleName="shellEnabled"
                                checked={formData.shellEnabled}
                                onToggle={handleChange}
                            />
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <Section icon={<ShieldAlert className="text-red-500" />} title="Security Sandbox" desc="Restrict agent focus and execution boundaries.">
                                <div className="flex items-center justify-between p-6 bg-white/2 rounded-2xl border border-white/5">
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Restrict to Workspace</h4>
                                        <p className="text-sm text-gray-500">Ensure the agent ONLY accesses files within its designated project folder.</p>
                                    </div>
                                    <Toggle name="restrictToWorkspace" checked={formData.restrictToWorkspace} onChange={handleChange} />
                                </div>
                            </Section>

                            <Section icon={<Database className="text-purple-500" />} title="Infrastructure" desc="Gateway binding and resource limits.">
                                <div className="grid md:grid-cols-3 gap-6">
                                    <InputWrapper label="Gateway Host">
                                        <input name="gatewayHost" value={formData.gatewayHost} onChange={handleChange} className="form-input py-4 text-sm font-mono" />
                                    </InputWrapper>
                                    <InputWrapper label="Gateway Port">
                                        <input name="gatewayPort" type="number" value={formData.gatewayPort} onChange={handleChange} className="form-input py-4 text-sm font-mono" />
                                    </InputWrapper>
                                    <InputWrapper label="Max Tool Cycles">
                                        <input name="maxToolIterations" type="number" value={formData.maxToolIterations} onChange={handleChange} className="form-input py-4 text-sm font-mono" />
                                    </InputWrapper>
                                </div>
                            </Section>
                        </div>
                    )}
                </div>

                {/* Floating Save Button */}
                <div className="fixed bottom-10 right-10 flex items-center gap-4">
                    {isSaving && (
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-500 animate-pulse bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                            <Activity size={14} /> PERSISTING STATE...
                        </div>
                    )}
                    <button
                        onClick={saveConfig}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-sm tracking-widest shadow-2xl shadow-blue-500/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <Rocket size={18} /> SAVE CONFIG
                    </button>
                </div>
            </main>
        </div>
    );
}

function SidebarTab({ icon, label, sub, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-4 px-6 py-5 rounded-2xl transition-all text-left group ${active ? 'bg-gradient-to-r from-blue-600/20 to-transparent border-l-4 border-blue-500 text-white' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40' : 'bg-white/5 group-hover:bg-white/10'}`}>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-black tracking-wide">{label}</span>
                <span className="text-[10px] opacity-60 font-medium uppercase tracking-tighter">{sub}</span>
            </div>
        </button>
    );
}

function Section({ icon, title, desc, children }: any) {
    return (
        <div className="bg-white/2 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10">
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        {icon}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase italic">{title}</h2>
                        <p className="text-sm text-gray-500 font-medium">{desc}</p>
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}

function ChannelRow({ name, icon, enabled, onToggle, toggleName, children }: any) {
    return (
        <div className={`p-8 rounded-[2rem] border transition-all duration-500 ${enabled ? 'bg-blue-600/5 border-blue-500/20' : 'bg-white/2 border-white/5 hover:border-white/10'}`}>
            <div className="flex items-center justify-between mb-0">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white p-3 rounded-2xl shadow-xl">
                        <img src={icon} alt={name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">{name} Connectivity</h3>
                        <p className="text-xs text-gray-500 font-medium">{enabled ? 'Interface Link Active' : 'Interface Link Dormant'}</p>
                    </div>
                </div>
                <Toggle name={toggleName} checked={enabled} onChange={onToggle} />
            </div>
            {enabled && children && <div className="mt-8 pt-8 border-t border-white/5">{children}</div>}
        </div>
    );
}

function ToolCard({ icon, title, desc, toggleName, checked, onToggle, children }: any) {
    return (
        <div className={`p-10 rounded-[2.5rem] border transition-all duration-500 ${checked || (!onToggle && children) ? 'bg-blue-600/5 border-blue-500/20' : 'bg-white/2 border-white/5 hover:border-white/10'}`}>
            <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center">
                    {icon}
                </div>
                {onToggle && <Toggle name={toggleName} checked={checked} onChange={onToggle} />}
            </div>
            <h3 className="text-xl font-black tracking-tight mb-2 uppercase italic">{title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">{desc}</p>
            {children}
        </div>
    );
}

function InputWrapper({ label, children, full }: any) {
    return (
        <div className={`flex flex-col gap-3 ${full ? 'md:col-span-2' : ''}`}>
            <label className="text-[10px] font-black text-blue-500/80 uppercase tracking-[0.2em] px-1">{label}</label>
            {children}
        </div>
    );
}

function Toggle({ name, checked, onChange }: any) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="sr-only peer"
            />
            <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"></div>
        </label>
    );
}
