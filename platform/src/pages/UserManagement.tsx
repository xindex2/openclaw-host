import { useState, useEffect } from 'react';
import { Search, Trash2, Shield, Gem, CheckCircle, XCircle, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserData {
    id: string;
    email: string;
    full_name: string;
    role: string;
    acquisition_source: string;
    subscription?: {
        plan: string;
        maxInstances: number;
    };
    _count: {
        configs: number;
    };
    createdAt: string;
}

export default function UserManagement() {
    const { token } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadUsers();
    }, [token]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUsers(data.users);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure? This will mission-kill the user and all their assets.')) return;
        // Mocking delete for now
        alert('Deletion command sent to core.');
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-[#ff4d4d] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Personnel Files</h1>
                    <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-[10px]">OpenClaw Host Registered Commanders</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="SEARCH COMMANDERS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl pl-16 pr-6 py-4 outline-none focus:border-[#ff4d4d]/50 transition-all font-bold text-xs tracking-widest uppercase"
                    />
                </div>
            </div>

            <div className="bg-white/2 border border-white/5 rounded-[3.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-white/5">
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Commander</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Clearance</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Assigned Fleet</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Assets</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Joined</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black italic text-[#ff4d4d]">
                                                {u.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-black italic uppercase tracking-tighter group-hover:text-white transition-colors">{u.full_name}</div>
                                                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className={`inline-flex px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${u.role === 'admin' ? 'bg-[#ff4d4d]/10 border-[#ff4d4d]/20 text-[#ff4d4d]' : 'bg-white/5 border-white/5 text-gray-400'
                                            }`}>
                                            {u.role}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <Gem size={14} className="text-blue-400" />
                                            <span className="text-xs font-black italic uppercase tracking-tight">{u.subscription?.plan || 'Free'}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 font-black italic">{u._count.configs}</td>
                                    <td className="px-10 py-8 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-10 py-8">
                                        <button
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between px-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                    Showing {filteredUsers.length} of {users.length} profiles
                </p>
                <div className="flex items-center gap-4">
                    <button className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-[#ff4d4d]/20 transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <button className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-[#ff4d4d]/20 transition-all">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
