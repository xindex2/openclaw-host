'use client';

import { useState, useEffect } from 'react';
import {
    Bot, Settings, Cpu, Share2, Play, Square,
    CheckCircle2, AlertCircle, Globe, MessageSquare
} from 'lucide-react';

const USER_ID = 'demo-user'; // Mock user ID for demonstration

export default function Dashboard() {
    const [provider, setProvider] = useState('openai');
    const [apiKey, setApiKey] = useState('');
    const [channel, setChannel] = useState('discord');
    const [channelToken, setChannelToken] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch initial config and status
        const fetchData = async () => {
            try {
                const configResp = await fetch(`/api/config?userId=${USER_ID}`);
                if (configResp.ok) {
                    const config = await configResp.json();
                    if (config) {
                        setProvider(config.provider || 'openai');
                        setApiKey(config.apiKey || '');
                        setChannel(config.channel || 'discord');
                        setChannelToken(config.channelToken || '');
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

    const saveConfig = async () => {
        await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: USER_ID,
                provider,
                apiKey,
                channel,
                channelToken
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
            <aside className="w-64 border-r border-white/5 bg-black/30 p-6 flex flex-col gap-8">
                <div className="flex items-center gap-2 px-2">
                    <Bot size={28} className="text-blue-500" />
                    <span className="text-xl font-black">nanobot</span>
                </div>

                <nav className="flex flex-col gap-2">
                    <SidebarLink icon={<Settings size={20} />} label="Bot Config" active />
                    <SidebarLink icon={<Share2 size={20} />} label="Connections" />
                    <SidebarLink icon={<Cpu size={20} />} label="Instances" />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-12 overflow-y-auto">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black mb-2">Bot Configuration</h1>
                        <p className="text-gray-400">Configure your model providers and communication channels.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-sm font-bold ${isRunning ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-gray-500/50 bg-gray-500/10 text-gray-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                            {isRunning ? 'Instance Active' : 'Offline'}
                        </div>
                    </div>
                </header>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* LLM Provider Card */}
                    <div className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                                <Cpu size={24} />
                            </div>
                            <h2 className="text-xl font-bold">Model Provider</h2>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-400">Select Provider</label>
                                <select
                                    value={provider}
                                    onChange={(e) => setProvider(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="openai">OpenAI (GPT-4)</option>
                                    <option value="anthropic">Anthropic (Claude)</option>
                                    <option value="gemini">Google Gemini</option>
                                    <option value="deepseek">DeepSeek</option>
                                    <option value="openrouter">OpenRouter</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-400">API Key</label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Channel Card */}
                    <div className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500">
                                <MessageSquare size={24} />
                            </div>
                            <h2 className="text-xl font-bold">Communication Channel</h2>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-400">Select Channel</label>
                                <select
                                    value={channel}
                                    onChange={(e) => setChannel(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="discord">Discord Bot</option>
                                    <option value="telegram">Telegram Bot</option>
                                    <option value="whatsapp">WhatsApp (QR Code)</option>
                                    <option value="feishu">Feishu (Open Platform)</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-400">Channel Token / Credentials</label>
                                <input
                                    type="password"
                                    value={channelToken}
                                    onChange={(e) => setChannelToken(e.target.value)}
                                    placeholder="Bot Token..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills Card */}
                    <div className="glass-card p-8 md:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500">
                                    <Globe size={24} />
                                </div>
                                <h2 className="text-xl font-bold">Enabled Skills</h2>
                            </div>
                            <span className="text-xs text-blue-400 font-bold uppercase tracking-widest">Premium Enabled</span>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4">
                            <SkillToggle label="Browser Control" active />
                            <SkillToggle label="Web Search" active />
                            <SkillToggle label="GitHub Integration" />
                            <SkillToggle label="System Shell" />
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="mt-12 p-8 glass-card border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold">Ready to Launch?</h3>
                        <p className="text-sm text-gray-400">Your configuration looks good. Start your nanobot instance now.</p>
                    </div>
                    <button
                        onClick={toggleBot}
                        className={`btn-primary flex items-center gap-3 px-10 py-4 ${isRunning ? 'bg-red-500 shadow-red-500/50' : ''}`}
                        style={isRunning ? { background: isRunning ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : '' } : {}}
                    >
                        {isRunning ? (
                            <><Square size={20} fill="currentColor" /> Stop Bot Instance</>
                        ) : (
                            <><Play size={20} fill="currentColor" /> Launch Bot Now</>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}

function SidebarLink({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${active ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            {icon}
            <span className="font-bold">{label}</span>
        </div>
    );
}

function SkillToggle({ label, active = false }: { label: string, active?: boolean }) {
    return (
        <div className={`p-4 rounded-xl border flex items-center justify-between ${active ? 'border-green-500/30 bg-green-500/5' : 'border-white/5 bg-white/5 opacity-50'}`}>
            <span className={`text-sm font-bold ${active ? 'text-green-500' : 'text-gray-400'}`}>{label}</span>
            {active ? <CheckCircle2 size={16} className="text-green-500" /> : <div className="w-4 h-4 rounded-full border border-gray-600" />}
        </div>
    );
}
