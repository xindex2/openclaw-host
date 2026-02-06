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
        <div className="min-h-screen bg-[#fcfcfc] text-slate-900 flex flex-col font-sans overflow-hidden">
            {/* Topbar Header */}
            <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 relative z-[60] shrink-0 shadow-sm">
                <Link to="/dashboard" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center">
                        <Bot size={18} className="text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-tight uppercase">SimpleClaw<span className="text-slate-400">.com</span></span>
                </Link>

                <div className="flex items-center gap-6">
                    <a href="mailto:support@simpleclaw.com" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">
                        <MessageSquare size={14} /> Support
                    </a>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r border-gray-200 bg-[#f7f7f8] p-6 flex flex-col gap-8 relative z-10 shrink-0">
                    <nav className="flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-3">
                            <p className="px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Platform</p>
                            <div className="space-y-0.5">
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
                            <div className="space-y-3">
                                <p className="px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-500/70">Intelligence</p>
                                <div className="space-y-0.5">
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
                    <div className="mt-auto pt-6 border-t border-gray-200 flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-2 h-10">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-zinc-950 border border-gray-200 overflow-hidden text-xs">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                    user?.full_name?.charAt(0) || 'U'
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                    <p className="text-[11px] font-bold text-slate-900 truncate">
                                        {user?.full_name || 'Commander'}
                                    </p>
                                    <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                                        <LogOut size={12} />
                                    </button>
                                </div>
                                <p className="text-[9px] font-medium text-slate-500 truncate uppercase tracking-widest">{user?.role || 'Officer'}</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto relative z-10 p-12 bg-[#fcfcfc]">
                    <div className="max-w-6xl mx-auto">
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
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-bold text-[11px] transition-all text-left group ${active
                ? 'bg-white text-slate-950 shadow-sm border border-gray-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-gray-200/50'
                }`}
        >
            <div className={`transition-colors duration-200 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {icon}
            </div>
            <span className="translate-y-px">{label}</span>
        </button>
    );
}
