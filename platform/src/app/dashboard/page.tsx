'use client';

import { useState, useEffect } from 'react';
import {
    Bot, Settings, Cpu, Share2, Play, Square,
    CheckCircle2, Globe, MessageSquare, Github,
    CloudRain, Terminal, Search, Zap, Layout
} from 'lucide-react';

const USER_ID = 'demo-user';

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
    });

    const [isRunning, setIsRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('provider');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const configResp = await fetch(`/api/config?userId=${USER_ID}`);
                if (configResp.ok) {
                    const config = await configResp.json();
                    if (config) {
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
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const saveConfig = async () => {
        await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: USER_ID,
                ...formData
            })
        });
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
            <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
                <Bot size={48} className="text-blue-500 animate-bounce" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 bg-black/30 p-8 flex flex-col gap-10">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Bot size={24} className="text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter">zakibot</span>
                </div>

                <nav className="flex flex-col gap-2">
                    <SidebarTab active={activeTab === 'provider'} onClick={() => setActiveTab('provider')} icon={<Cpu size={20} />} label="Model Provider" />
                    <SidebarTab active={activeTab === 'channels'} onClick={() => setActiveTab('channels')} icon={<Share2 size={20} />} label="Chat Channels" />
                    <SidebarTab active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} icon={<Terminal size={20} />} label="Skills & Tools" />
                </nav>

                <div className="mt-auto">
                    <div className={`p-6 rounded-2xl border transition-all ${isRunning ? 'border-green-500/30 bg-green-500/5' : 'border-white/5 bg-white/5 opacity-50'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                            <span className="text-sm font-bold uppercase tracking-widest">{isRunning ? 'Running' : 'Offline'}</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {isRunning ? 'Instance is currently processing tasks.' : 'Launch your bot to start automating.'}
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-16 overflow-y-auto">
                <header className="flex items-center justify-between mb-16">
                    <div>
                        <h1 className="text-5xl font-black mb-3">
                            {activeTab === 'provider' && 'Intelligence Core'}
                            {activeTab === 'channels' && 'Communication Hub'}
                            {activeTab === 'tools' && 'Skill Registry'}
                        </h1>
                        <p className="text-xl text-gray-400">Manage all aspects of your nanobot's capabilities.</p>
                    </div>

                    <button
                        onClick={toggleBot}
                        className={`flex items-center gap-4 px-12 py-5 rounded-2xl font-black text-lg transition-all transform hover:scale-105 active:scale-95 ${isRunning ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'}`}
                    >
                        {isRunning ? (
                            <><Square size={22} fill="currentColor" /> STOP INSTANCE</>
                        ) : (
                            <><Play size={22} fill="currentColor" /> START INSTANCE</>
                        )}
                    </button>
                </header>

                <div className="max-w-4xl">
                    {activeTab === 'provider' && (
                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="glass-card p-10">
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                    <Layout className="text-blue-500" />
                                    Provider Configuration
                                </h2>
                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Provider</label>
                                        <select
                                            name="provider"
                                            value={formData.provider}
                                            onChange={handleChange}
                                            className="bg-white/5 border border-white/10 rounded-xl p-5 text-lg focus:outline-none focus:border-blue-500 transition-all font-medium"
                                        >
                                            <option value="openrouter">OpenRouter (Recommended)</option>
                                            <option value="anthropic">Anthropic</option>
                                            <option value="openai">OpenAI</option>
                                            <option value="deepseek">DeepSeek</option>
                                            <option value="gemini">Google Gemini</option>
                                            <option value="groq">Groq</option>
                                            <option value="zhipu">Zhipu (ChatGLM)</option>
                                            <option value="moonshot">Moonshot (Kimi)</option>
                                            <option value="vllm">Local vLLM</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Model Identifier</label>
                                        <input
                                            name="model"
                                            value={formData.model}
                                            onChange={handleChange}
                                            placeholder="anthropic/claude-3-opus"
                                            className="bg-white/5 border border-white/10 rounded-xl p-5 text-lg focus:outline-none focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3 md:col-span-2">
                                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">API Key</label>
                                        <input
                                            name="apiKey"
                                            type="password"
                                            value={formData.apiKey}
                                            onChange={handleChange}
                                            placeholder="sk-..."
                                            className="bg-white/5 border border-white/10 rounded-xl p-5 text-lg focus:outline-none focus:border-blue-500 transition-all"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Keys are encrypted and stored securely.</p>
                                    </div>
                                    {formData.provider === 'vllm' && (
                                        <div className="flex flex-col gap-3 md:col-span-2">
                                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">API Base URL</label>
                                            <input
                                                name="apiBase"
                                                value={formData.apiBase}
                                                onChange={handleChange}
                                                placeholder="http://localhost:8000/v1"
                                                className="bg-white/5 border border-white/10 rounded-xl p-5 text-lg focus:outline-none focus:border-blue-500 transition-all"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'channels' && (
                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ChannelCard
                                icon={<MessageSquare className="text-blue-400" />}
                                title="Telegram Bot"
                                enabledName="telegramEnabled"
                                enabled={formData.telegramEnabled}
                                onChange={handleChange}
                            >
                                <div className="flex flex-col gap-3 mt-6">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bot Token</label>
                                    <input
                                        name="telegramToken"
                                        type="password"
                                        value={formData.telegramToken}
                                        onChange={handleChange}
                                        placeholder="123456789:ABCDEF..."
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </ChannelCard>

                            <ChannelCard
                                icon={<Zap className="text-indigo-400" />}
                                title="Discord Bot"
                                enabledName="discordEnabled"
                                enabled={formData.discordEnabled}
                                onChange={handleChange}
                            >
                                <div className="flex flex-col gap-3 mt-6">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bot Token</label>
                                    <input
                                        name="discordToken"
                                        type="password"
                                        value={formData.discordToken}
                                        onChange={handleChange}
                                        placeholder="OTI1Mj..."
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </ChannelCard>

                            <ChannelCard
                                icon={<Globe className="text-green-400" />}
                                title="WhatsApp (QR Connect)"
                                enabledName="whatsappEnabled"
                                enabled={formData.whatsappEnabled}
                                onChange={handleChange}
                            />

                            <ChannelCard
                                icon={<Search className="text-cyan-400" />}
                                title="Feishu / Lark"
                                enabledName="feishuEnabled"
                                enabled={formData.feishuEnabled}
                                onChange={handleChange}
                            >
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">App ID</label>
                                        <input
                                            name="feishuAppId"
                                            value={formData.feishuAppId}
                                            onChange={handleChange}
                                            placeholder="cli_..."
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">App Secret</label>
                                        <input
                                            name="feishuAppSecret"
                                            type="password"
                                            value={formData.feishuAppSecret}
                                            onChange={handleChange}
                                            placeholder="***"
                                            className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-500"
                                        />
                                    </div>
                                </div>
                            </ChannelCard>
                        </div>
                    )}

                    {activeTab === 'tools' && (
                        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="glass-card p-10">
                                <h2 className="text-2xl font-bold mb-10 flex items-center gap-3">
                                    <Terminal className="text-yellow-500" />
                                    Built-in Skills
                                </h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <ToolSection
                                        icon={<Search className="text-blue-500" />}
                                        title="Web Search"
                                        description="Search the live web using Brave Search API."
                                    >
                                        <input
                                            name="webSearchApiKey"
                                            type="password"
                                            value={formData.webSearchApiKey}
                                            onChange={handleChange}
                                            placeholder="Brave API Key"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm mt-4 focus:outline-none focus:border-blue-500"
                                        />
                                    </ToolSection>

                                    <ToolSection
                                        icon={<Github className="text-white" />}
                                        title="GitHub Integration"
                                        description="Manage issues, PRs, and repositories."
                                    >
                                        <input
                                            name="githubToken"
                                            type="password"
                                            value={formData.githubToken}
                                            onChange={handleChange}
                                            placeholder="Personal Access Token"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm mt-4 focus:outline-none focus:border-white/50"
                                        />
                                    </ToolSection>

                                    <ToolSection
                                        icon={<Globe className="text-cyan-500" />}
                                        title="Browser Automation"
                                        description="Control a headless browser via Playwright."
                                        enabled={formData.browserEnabled}
                                        toggleName="browserEnabled"
                                        onToggle={handleChange}
                                    />

                                    <ToolSection
                                        icon={<Terminal className="text-red-500" />}
                                        title="System Shell"
                                        description="Execute shell commands in a sandboxed env."
                                        enabled={formData.shellEnabled}
                                        toggleName="shellEnabled"
                                        onToggle={handleChange}
                                    />

                                    <ToolSection icon={<CloudRain className="text-gray-400" />} title="Weather (OpenClaw)" description="Current weather data via OpenWeather." />
                                    <ToolSection icon={<Layout className="text-purple-400" />} title="Tmux / Terminal" description="Persistent terminal sessions." />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function SidebarTab({ icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-left ${active ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
        >
            {icon}
            <span>{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
        </button>
    );
}

function ChannelCard({ icon, title, enabledName, enabled, onChange, children }: any) {
    return (
        <div className={`glass-card p-8 border transition-all ${enabled ? 'border-blue-500/20 bg-blue-500/5' : 'border-white/5'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{title}</h3>
                        <p className="text-sm text-gray-500">{enabled ? 'Active and Configured' : 'Disabled'}</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        name={enabledName}
                        checked={enabled}
                        onChange={onChange}
                        className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
            </div>
            {enabled && children}
        </div>
    );
}

function ToolSection({ icon, title, description, children, enabled, toggleName, onToggle }: any) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        {icon}
                    </div>
                    <h3 className="font-bold">{title}</h3>
                </div>
                {onToggle && (
                    <input
                        type="checkbox"
                        name={toggleName}
                        checked={enabled}
                        onChange={onToggle}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 bg-black"
                    />
                )}
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{description}</p>
            {children}
        </div>
    );
}
