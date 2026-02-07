import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { Shield, ArrowRight, CheckCircle2, Bot, Zap, Crown, Loader2 } from 'lucide-react';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userData = params.get('user');
        const googleError = params.get('error');

        if (token && userData) {
            try {
                const user = JSON.parse(decodeURIComponent(userData));
                login(token, user);
                navigate('/dashboard');
            } catch (e) {
                console.error('Failed to parse user data from Google', e);
                setError('Authentication failed. Please try again.');
            }
        } else if (googleError) {
            setError('Google authentication failed. Please try again.');
        }
    }, [location, login, navigate]);

    const handleGoogleLogin = () => {
        setLoading(true);
        window.location.href = '/api/auth/google';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed');

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
                            Access your fleet from anywhere.
                        </h1>
                        <p className="text-xl text-[#98a2b3] leading-relaxed">
                            Sign in to manage your autonomous agents and monitor performance in real-time.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[#53b1fd]">
                            <Zap size={20} />
                            <span className="font-bold uppercase tracking-wider text-xs">Efficient</span>
                        </div>
                        <p className="text-sm text-[#cecfd2]">Optimized engine for maximum resource efficiency.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[#7f56d9]">
                            <CheckCircle2 size={20} />
                            <span className="font-bold uppercase tracking-wider text-xs">Reliable</span>
                        </div>
                        <p className="text-sm text-[#cecfd2]">99.9% uptime for your mission-critical agents.</p>
                    </div>
                </div>
            </div>

            {/* Right side: Login form */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-16">
                <div className="w-full max-w-md space-y-8">
                    <div className="md:hidden flex justify-center mb-8">
                        <Logo size={48} />
                    </div>

                    <header className="space-y-2">
                        <h2 className="text-3xl font-bold text-[#101828]">Welcome back</h2>
                        <p className="text-[#475467]">Please enter your details to sign in.</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

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

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-[#344054]">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-white border border-[#d0d5dd] rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-[#101828]/5 focus:border-[#101828] transition-all shadow-sm"
                            />
                        </div>

                        <div className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-[#d0d5dd] text-[#101828] focus:ring-[#101828]/5" />
                                <span className="text-sm text-[#475467]">Remember me</span>
                            </div>
                            <button type="button" className="text-sm font-bold text-[#101828] hover:underline">Forgot password?</button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#101828] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1d2939] transition-all shadow-sm disabled:opacity-50 mt-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign in'}
                            {!loading && <ArrowRight size={18} />}
                        </button>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full bg-white border border-[#d0d5dd] text-[#344054] py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#f9fafb] transition-all shadow-sm disabled:opacity-50"
                        >
                            <svg width="20" height="20" viewBox="0 0 18 18">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285f4" />
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34a853" />
                                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.172.282-1.712V4.956H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.044l3.007-2.332z" fill="#fbbc05" />
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.956l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#ea4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </form>

                    <footer className="pt-6 text-center border-t border-[#eaecf0]">
                        <p className="text-sm text-[#475467]">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-[#101828] font-bold hover:underline">Sign up</Link>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
