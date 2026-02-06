import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bot, Layout as LayoutIcon, Users, Settings, LogOut, ChevronRight, Activity, ShieldCheck, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Shell({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdmin = user?.role === 'admin';

    const menuItems = [
        { icon: <LayoutIcon size={18} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <Bot size={18} />, label: 'All Agents', path: '/dashboard' },
    ];

    const adminItems = [
        { icon: <Activity size={18} />, label: 'Command Center', path: '/admin' },
        { icon: <Users size={18} />, label: 'User Registry', path: '/admin/users' },
        { icon: <ShieldCheck size={18} />, label: 'System Logs', path: '/admin/events' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
            {/* Grain Overlay */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" />

            {/* Topbar Header */}
            <header className="h-20 border-b border-white/5 bg-black/50 backdrop-blur-2xl flex items-center justify-between px-12 relative z-[60] shrink-0">
                <Link to="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Bot size={18} className="text-white" />
                    </div>
                    <span className="text-lg font-black tracking-tight uppercase">SimpleClaw<span className="text-gray-600">.com</span></span>
                </Link>

                <div className="flex items-center gap-8">
                    <a href="mailto:support@simpleclaw.com" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                        <MessageSquare size={14} /> Contact Support
                    </a>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-72 border-r border-white/5 bg-black/20 backdrop-blur-3xl p-8 flex flex-col gap-10 relative z-10 shrink-0">
                    <nav className="flex flex-col gap-12 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-4">
                            <p className="px-4 text-[9px] font-black uppercase tracking-[0.3em] text-gray-700">Platform</p>
                            <div className="space-y-1">
                                {menuItems.map((item) => (
                                    <SidebarItem
                                        key={item.path}
                                        {...item}
                                        active={location.pathname === item.path}
                                        onClick={() => navigate(item.path)}
                                    />
                                ))}
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="space-y-4">
                                <p className="px-4 text-[9px] font-black uppercase tracking-[0.3em] text-[#ff4d4d]/50">Command Clearance</p>
                                <div className="space-y-1">
                                    {adminItems.map((item) => (
                                        <SidebarItem
                                            key={item.path}
                                            {...item}
                                            active={location.pathname === item.path}
                                            onClick={() => navigate(item.path)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </nav>

                    {/* User Section */}
                    <div className="mt-auto pt-8 border-t border-white/5 flex flex-col gap-6">
                        <div className="flex items-center gap-4 px-4 h-12">
                            <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center font-black italic text-coral-bright border border-white/5 overflow-hidden">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                    user?.full_name?.charAt(0) || 'U'
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[11px] font-black uppercase tracking-tight truncate">
                                        {user?.full_name || 'Commander'}
                                    </p>
                                    <button onClick={logout} className="text-gray-700 hover:text-red-500 transition-colors shrink-0">
                                        <LogOut size={12} />
                                    </button>
                                </div>
                                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest truncate">{user?.role || 'Officer'}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto relative z-10 p-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#050505] to-[#050505]">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all text-left group ${active
                ? 'bg-white/5 text-white shadow-xl shadow-black/20 border border-white/5'
                : 'text-gray-600 hover:text-white hover:bg-white/[0.02]'
                }`}
        >
            <div className={`transition-all duration-300 ${active ? 'text-white' : 'text-gray-800 group-hover:text-gray-600'}`}>
                {icon}
            </div>
            <span className="translate-y-px">{label}</span>
            {active && <div className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />}
        </button>
    );
}
