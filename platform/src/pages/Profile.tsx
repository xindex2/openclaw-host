import { useState, useEffect } from 'react';
import { User, Shield, Camera, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function Profile() {
    const { user } = useAuth();
    const [profileForm, setProfileForm] = useState({ full_name: '', avatar_url: '', password: '' });
    const [status, setStatus] = useState({ loading: false, error: '', success: '' });

    useEffect(() => {
        if (user) {
            setProfileForm({
                full_name: user.full_name || '',
                avatar_url: user.avatar_url || '',
                password: ''
            });
        }
    }, [user]);

    const handleUpdate = async () => {
        setStatus({ loading: true, error: '', success: '' });
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(profileForm)
            });
            if (res.ok) {
                setStatus({ loading: false, error: '', success: 'Profile updated successfully!' });
            } else {
                setStatus({ loading: false, error: 'Failed to update profile.', success: '' });
            }
        } catch (err) {
            setStatus({ loading: false, error: 'Network error occurred.', success: '' });
        }
    };

    return (
        <div className="space-y-12 max-w-4xl">
            <header>
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" /> Identity Management
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Commander Profile</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="col-span-1 space-y-6">
                    <div className="aspect-square rounded-3xl bg-slate-50 border border-gray-100 flex items-center justify-center overflow-hidden relative group shadow-sm">
                        {profileForm.avatar_url ? (
                            <img src={profileForm.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                        ) : (
                            <User size={64} className="text-slate-200" />
                        )}
                        <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="text-white" size={24} />
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-indigo-50/30 border border-indigo-100/50">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield size={16} className="text-indigo-600" />
                            <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Access Role</h3>
                        </div>
                        <p className="text-xl font-bold text-slate-900 capitalize">{user?.role || 'Officer'}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-tight">Level 4 Operational Grade</p>
                    </div>
                </div>

                <div className="col-span-2 space-y-8">
                    <section className="bg-white border border-gray-200 rounded-3xl p-10 shadow-sm space-y-8">
                        <div className="grid grid-cols-1 gap-8">
                            <InputWrapper label="Full Name">
                                <input
                                    value={profileForm.full_name}
                                    onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                    className="form-input"
                                    placeholder="Enter your name"
                                />
                            </InputWrapper>
                            <InputWrapper label="Avatar URL">
                                <input
                                    value={profileForm.avatar_url}
                                    onChange={e => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                                    className="form-input"
                                    placeholder="https://images.com/photo..."
                                />
                            </InputWrapper>
                            <InputWrapper label="Update Password">
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={profileForm.password}
                                        onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                                        className="form-input pr-12"
                                        placeholder="••••••••"
                                    />
                                    <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                </div>
                            </InputWrapper>
                        </div>

                        {status.success && (
                            <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-xs font-bold rounded-xl flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                {status.success}
                            </div>
                        )}

                        {status.error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                {status.error}
                            </div>
                        )}

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={handleUpdate}
                                disabled={status.loading}
                                className="bg-zinc-950 text-white px-10 py-4 rounded-xl font-bold text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-xl shadow-zinc-950/10 disabled:opacity-50"
                            >
                                {status.loading ? 'Synchronizing...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function InputWrapper({ label, children }: any) {
    return (
        <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 block px-1">{label}</label>
            {children}
        </div>
    );
}
