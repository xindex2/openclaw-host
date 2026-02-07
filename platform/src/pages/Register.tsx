import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { Shield, ArrowRight, CheckCircle2, Bot, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
    const [formData, setFormData] = useState({ full_name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: formData.full_name,
                    email: formData.email,
                    password: formData.password,
                    acquisition_source: new URLSearchParams(window.location.search).get('utm_source') || new URLSearchParams(window.location.search).get('ref') || 'Direct'
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Registration failed');

            login(data.token || 'demo-token', data.user || data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row">
            {/* Left side: branding/intro */}
            <div className="hidden md:flex flex-1 bg-[#101828] p-16 flex-col justify-between text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-blue-500 blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500 blur-[100px]" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <Logo size={40} />
                        <span className="text-2xl font-bold tracking-tight">Nanobot</span>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <h1 className="text-5xl font-bold leading-tight tracking-tight">
                            Build and deploy autonomous agents in minutes.
                        </h1>
                        <p className="text-xl text-[#98a2b3] leading-relaxed">
                            The professional platform for hosting, managing, and scaling your AI workforce.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[#53b1fd]">
                            <Zap size={20} />
                            <span className="font-bold uppercase tracking-wider text-xs">High Speed</span>
                        </div>
                        <p className="text-sm text-[#cecfd2]">Low-latency execution for real-time automation.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[#7f56d9]">
                            <Shield size={20} />
                            <span className="font-bold uppercase tracking-wider text-xs">Secure</span>
                        </div>
                        <p className="text-sm text-[#cecfd2]">Isolated workspaces per agent for maximum security.</p>
                    </div>
                </div>
            </div>

            {/* Right side: Registration form */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-16">
                <div className="w-full max-w-md space-y-8">
                    <div className="md:hidden flex justify-center mb-8">
                        <Logo size={48} />
                    </div>

                    <header className="space-y-2">
                        <h2 className="text-3xl font-bold text-[#101828]">Create your account</h2>
                        <p className="text-[#475467]">Start your 14-day free trial on us.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#344054]">Full Name</label>
                            <input
                                name="full_name"
                                type="text"
                                required
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                className="w-full bg-white border border-[#d0d5dd] rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-[#101828]/5 focus:border-[#101828] transition-all shadow-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#344054]">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="w-full bg-white border border-[#d0d5dd] rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-[#101828]/5 focus:border-[#101828] transition-all shadow-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#344054]">Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create password"
                                    className="w-full bg-white border border-[#d0d5dd] rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-[#101828]/5 focus:border-[#101828] transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-[#344054]">Confirm</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    className="w-full bg-white border border-[#d0d5dd] rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-[#101828]/5 focus:border-[#101828] transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#101828] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1d2939] transition-all shadow-sm disabled:opacity-50 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Get Started'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <footer className="pt-6 text-center">
                        <p className="text-sm text-[#475467]">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#101828] font-bold hover:underline">Log in</Link>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}

function Loader2({ className, size }: { className?: string, size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
