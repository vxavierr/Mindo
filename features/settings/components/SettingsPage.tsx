import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useMindoStore } from '../../../store/useMindoStore';
import { supabase } from '../../../lib/supabase';
import {
    User,
    Settings,
    Moon,
    Sun,
    LogOut,
    Save,
    Loader2,
    Shield,
    Activity,
    Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileData {
    full_name: string;
    avatar_url: string;
    confidence_score: number;
    streak_days: number;
    total_nodes: number;
}

export function SettingsPage() {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useMindoStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileData>({
        full_name: '',
        avatar_url: '',
        confidence_score: 0,
        streak_days: 0,
        total_nodes: 0
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (error) throw error;

            if (data) {
                setProfile({
                    full_name: data.full_name || '',
                    avatar_url: data.avatar_url || '',
                    confidence_score: data.confidence_score || 0,
                    streak_days: data.streak_days || 0,
                    total_nodes: data.total_nodes || 0
                });
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    avatar_url: profile.avatar_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user?.id);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-mindo-primary" />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-[#F8FAFC] dark:bg-mindo-void p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <Settings className="w-8 h-8 text-mindo-primary" />
                            Settings
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Manage your profile and application preferences
                        </p>
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-mindo-depth border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm"
                >
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-mindo-primary" />
                        Profile Information
                    </h2>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-white/5 bg-slate-100 dark:bg-black/20">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <div className="w-full max-w-xs">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1">Avatar URL</label>
                                <input
                                    type="text"
                                    value={profile.avatar_url}
                                    onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-800 dark:text-white focus:ring-2 focus:ring-mindo-primary outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-800 dark:text-white focus:ring-2 focus:ring-mindo-primary outline-none transition-all"
                                    placeholder="Your Name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Managed by Supabase Auth
                                </p>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="bg-mindo-primary hover:bg-mindo-primary/90 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                                {message && (
                                    <span className={`ml-4 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {message.text}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-mindo-depth border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Confidence Score</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{profile.confidence_score}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-mindo-depth border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Day Streak</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{profile.streak_days} days</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-mindo-depth border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <BrainCircuit className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Nodes</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{profile.total_nodes}</p>
                        </div>
                    </motion.div>
                </div>

                {/* Preferences */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-mindo-depth border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm"
                >
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-mindo-primary" />
                        Preferences
                    </h2>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center shadow-sm">
                                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="font-medium text-slate-800 dark:text-white">Appearance</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {theme === 'dark' ? 'Dark Mode is active' : 'Light Mode is active'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="px-4 py-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/20 transition-colors"
                        >
                            Toggle Theme
                        </button>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}

// Helper component for the icon
function BrainCircuit(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
            <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
            <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
            <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
            <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
            <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
            <path d="M6 18a4 4 0 0 1-1.97-1.375" />
            <path d="M19.97 16.625A4.002 4.002 0 0 1 18 18" />
        </svg>
    )
}
