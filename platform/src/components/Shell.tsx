import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bot, Layout as LayoutIcon, Users, Settings, LogOut, ChevronRight, Activity, ShieldCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Shell({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdmin = user?.role === 'admin';

    const menuItems = [
        { icon: <LayoutIcon size={20} />, label: 'Dashboard', path: '/dashboard', color: 'text-blue-500' },
        { icon: <Bot size={20} />, label: 'Agents', path: '/dashboard', color: 'text-blue-500' }, // For now same as dashboard
    ];

    const adminItems = [
        { icon: <Activity size={20} />, label: 'Command Center', path: '/admin', color: 'text-[#ff6b6b]' },
        { icon: <Users size={20} />, label: 'Personnel', path: '/admin/users', color: 'text-[#ff6b6b]' },
        { icon: <ShieldCircle size={20} />, label: 'Maintenance', path: '/admin/maintenance', color: 'text-[#ff6b6b]' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white flex font-sans overflow-hidden">
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-50 mix-blend-overlay" />

            {/* Sidebar */}
            <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-3xl p-8 flex flex-col gap-10 relative z-10">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 bg-[#ff6b6b] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#ff6b6b]/20">
                        <Bot size={22} className="text-white" />
                    </div>
                    <div>
                        <span className="text-xl font-black italic tracking-tighter uppercase block leading-none">zakibot</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">Enterprise Fleet</span>
                    </div>
                </div>

                <nav className="flex flex-col gap-8 flex-1">
                    <div className="space-y-2">
                        <p className="px-4 text-[9px] font-black uppercase tracking-[0.4em] text-gray-700 mb-4">Tactical Operations</p>
                        {menuItems.map((item) => (
                            <SidebarItem
                                key={item.path}
                                {...item}
                                active={location.pathname === item.path}
                                onClick={() => navigate(item.path)}
                            />
                        ))}
                    </div>

                    {isAdmin && (
                        <div className="space-y-2 pt-8 border-t border-white/5">
                            <p className="px-4 text-[9px] font-black uppercase tracking-[0.4em] text-[#ff6b6b]/40 mb-4">Command Clearance</p>
                            {adminItems.map((item) => (
                                <SidebarItem
                                    key={item.path}
                                    {...item}
                                    active={location.pathname === item.path}
                                    onClick={() => navigate(item.path)}
                                />
                            ))}
                        </div>
                    )}
                </nav>

                {/* User Section */}
                <div className="mt-auto pt-8 border-t border-white/5">
                    <div className="flex items-center gap-4 px-4 mb-6">
                        <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center font-black italic text-[#ff6b6b]">
                            {user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black italic uppercase italic tracking-tighter truncate">{user?.full_name || 'Commander'}</p>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest truncate">{user?.role || 'Officer'}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                        <LogOut size={16} /> SIGN OUT SIGNAL
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 p-16">
                {children}
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick, color }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black text-sm tracking-tight transition-all text-left group ${active ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-white'
                }`}
        >
            <div className="flex items-center gap-4">
                <div className={`transition-all duration-500 ${active ? color : 'text-gray-700 group-hover:text-gray-400'}`}>
                    {icon}
                </div>
                <span className="uppercase tracking-tight italic tracking-[-0.02em]">{label}</span>
            </div>
            {active && <ChevronRight size={14} className="text-white opacity-20" />}
        </button>
    );
}
