import { useState, useEffect } from 'react';
import { Search, Trash2, Shield, Gem, CheckCircle, XCircle, ChevronLeft, ChevronRight, User as UserIcon, Edit2, Loader2, Save, X, MoreVertical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

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
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Edit State
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [editForm, setEditForm] = useState({ role: '', plan: '', maxInstances: 1 });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadUsers();
        }, 300); // Simple debounce
        return () => clearTimeout(timeoutId);
    }, [token, page, search]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '15',
                search: search
            });

            const response = await fetch(`/api/admin/users?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUsers(data.users);
            setTotalPages(data.totalPages);
            setTotalUsers(data.total);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? All their bots will also be removed.')) return;
        try {
            await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadUsers();
        } catch (e) {
            alert('Failed to delete user');
        }
    };

    const handleEditUser = (user: UserData) => {
        setEditingUser(user);
        setEditForm({
            role: user.role,
            plan: user.subscription?.plan || 'Free',
            maxInstances: user.subscription?.maxInstances || 1
        });
    };

    const saveUser = async () => {
        if (!editingUser) return;
        setIsSaving(true);
        try {
            await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });
            setEditingUser(null);
            loadUsers();
        } catch (e) {
            alert('Failed to save user');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#101828] mb-1">Users</h1>
                        <p className="text-sm text-[#475467]">Manage all accounts and subscriptions.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="input-field pl-10"
                        />
                    </div>
                </div>

                <div className="bg-white border border-[#eaecf0] rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#f9fafb] border-b border-[#eaecf0]">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#475467] uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#475467] uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#475467] uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#475467] uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#475467] uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#eaecf0]">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-[#f9fafb] transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#f2f4f7] flex items-center justify-center text-xs font-bold text-[#475467]">
                                                    {u.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-[#101828]">{u.full_name}</div>
                                                    <div className="text-xs text-[#475467]">{u.email}</div>
                                                </div>
                                                {u.role === 'admin' && <span className="badge badge-success !text-[10px] ml-2">Admin</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-[#101828]">{u.subscription?.plan || 'Free'}</div>
                                            <div className="text-[10px] text-[#475467]">{u._count.configs} / {u.subscription?.maxInstances || 1} bots</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-[#475467] bg-[#f2f4f7] px-2 py-1 rounded-md">{u.acquisition_source || 'Direct'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-[#475467]">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEditUser(u)} className="p-2 text-[#475467] hover:bg-gray-100 rounded-lg">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-[#b42318] hover:bg-red-50 rounded-lg">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 flex items-center justify-between bg-[#f9fafb] border-t border-[#eaecf0]">
                        <span className="text-xs text-[#475467] font-medium">Page {page} of {totalPages || 1}</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn-secondary px-3 py-1.5 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="btn-secondary px-3 py-1.5 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingUser && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-[#101828]">Edit user</h2>
                                <button onClick={() => setEditingUser(null)} className="text-[#667085] hover:text-[#101828]">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="label-text">Role</label>
                                    <select
                                        className="input-field"
                                        value={editForm.role}
                                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="label-text">Subscription Plan</label>
                                    <input
                                        className="input-field"
                                        value={editForm.plan}
                                        onChange={e => setEditForm({ ...editForm, plan: e.target.value })}
                                        placeholder="Free, Pro, etc."
                                    />
                                </div>

                                <div>
                                    <label className="label-text">Max Instances (Bots)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={editForm.maxInstances}
                                        onChange={e => setEditForm({ ...editForm, maxInstances: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button onClick={() => setEditingUser(null)} className="flex-1 btn-secondary justify-center py-2.5">Cancel</button>
                                    <button onClick={saveUser} disabled={isSaving} className="flex-1 btn-primary justify-center py-2.5">
                                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save changes'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
