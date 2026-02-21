"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/features/auth/AuthContext";
import { apiGet, apiPatch } from "@/lib/api";

interface ProfileData {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    createdAt: string;
    skills: string[];
    interests: string[];
    bio: string;
    goal: string;
    stats: {
        weeksCompleted: number;
        quizzesTaken: number;
        avgScore: number;
        bestScore: number;
        totalCorrect: number;
        totalQuestions: number;
        weeklyScores: { week: string; score: number; passed: boolean; timestamp: string }[];
    };
}

export function StudentDashboard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingSkills, setEditingSkills] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "progress" | "activity">("overview");

    const loadProfile = useCallback(async () => {
        try {
            const data = await apiGet<ProfileData>("/api/v1/profile");
            setProfile(data);
            setSkills(data.skills || []);
        } catch (e) {
            console.warn("[Dashboard] Failed to load profile:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) loadProfile();
    }, [user, loadProfile]);

    const handleAddSkill = () => {
        const s = newSkill.trim();
        if (s && !skills.includes(s)) {
            setSkills([...skills, s]);
            setNewSkill("");
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const handleSaveSkills = async () => {
        setSaving(true);
        try {
            await apiPatch("/api/v1/profile", { skills });
            setProfile(prev => prev ? { ...prev, skills } : prev);
            setEditingSkills(false);
        } catch (e) {
            console.error("Failed to save skills:", e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 max-w-5xl mx-auto">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-36 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 animate-pulse" />
                ))}
            </div>
        );
    }

    const stats = profile?.stats;
    const weeklyScores = stats?.weeklyScores || [];

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Welcome header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-2"
            >
                <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">My Dashboard</span>
            </motion.div>

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
                <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 p-8 pb-20 relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
                </div>
                <div className="px-8 pb-8 -mt-14">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-2xl bg-white dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                            {profile?.photoURL ? (
                                <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl">👤</span>
                            )}
                        </div>
                        <div className="flex-1 mt-4 md:mt-6">
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                                {profile?.displayName || "Student"}
                            </h2>
                            <p className="text-sm text-zinc-500 font-medium mt-1">{profile?.email}</p>
                            {profile?.goal && (
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-md">
                                    🎯 <span className="font-medium">{profile.goal}</span>
                                </p>
                            )}
                        </div>
                        {profile?.createdAt && (
                            <div className="text-xs text-zinc-400 font-bold mt-6 whitespace-nowrap">
                                📅 Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                {[
                    { label: "Weeks Completed", value: stats?.weeksCompleted ?? 0, icon: "📅", color: "from-blue-500 to-blue-600" },
                    { label: "Quizzes Taken", value: stats?.quizzesTaken ?? 0, icon: "🧠", color: "from-violet-500 to-violet-600" },
                    { label: "Average Score", value: `${stats?.avgScore ?? 0}%`, icon: "📊", color: "from-emerald-500 to-emerald-600" },
                    { label: "Best Score", value: `${stats?.bestScore ?? 0}%`, icon: "🏆", color: "from-amber-500 to-amber-600" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.05 }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 hover:shadow-lg hover:border-blue-300/50 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl group-hover:scale-110 transition-transform">{stat.icon}</span>
                            <div className={`w-10 h-1 rounded-full bg-gradient-to-r ${stat.color}`} />
                        </div>
                        <p className="text-2xl font-black text-zinc-900 dark:text-white">{stat.value}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-1">
                {(["overview", "progress", "activity"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-sm font-black rounded-xl transition-all capitalize ${activeTab === tab
                            ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                            : "text-zinc-500 hover:text-zinc-700"
                            }`}
                    >
                        {tab === "overview" ? "📋 Skills & Info" : tab === "progress" ? "📈 Progress" : "⚡ Activity"}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        {/* Skills Manager */}
                        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-zinc-900 dark:text-white">🛠 My Skills</h3>
                                <button
                                    onClick={() => {
                                        if (editingSkills) {
                                            setSkills(profile?.skills || []);
                                        }
                                        setEditingSkills(!editingSkills);
                                    }}
                                    className="text-xs font-bold text-blue-600 hover:underline"
                                >
                                    {editingSkills ? "Cancel" : "Edit Skills"}
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                    <span key={skill} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-bold rounded-full border border-blue-200 dark:border-blue-800">
                                        {skill}
                                        {editingSkills && (
                                            <button onClick={() => handleRemoveSkill(skill)} className="text-blue-400 hover:text-red-500 transition-colors ml-1">✕</button>
                                        )}
                                    </span>
                                ))}
                                {skills.length === 0 && (
                                    <p className="text-sm text-zinc-400">No skills added yet. Click "Edit Skills" to add some!</p>
                                )}
                            </div>

                            {editingSkills && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={e => setNewSkill(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && handleAddSkill()}
                                            placeholder="e.g. Python, React, Machine Learning..."
                                            className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        <button onClick={handleAddSkill} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                                            Add
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSaveSkills}
                                        disabled={saving}
                                        className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:scale-[1.02] transition-all disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Save Skills ✓"}
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        {/* Interests */}
                        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-8">
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-4">🎯 Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {(profile?.interests || []).map(interest => (
                                    <span key={interest} className="px-4 py-2 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-sm font-bold rounded-full border border-violet-200 dark:border-violet-800">
                                        {interest}
                                    </span>
                                ))}
                                {(!profile?.interests || profile.interests.length === 0) && (
                                    <p className="text-sm text-zinc-400">No interests set yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Accuracy */}
                        {(stats?.totalQuestions ?? 0) > 0 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-8">
                                <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-4">🎯 Overall Accuracy</h3>
                                <div className="flex items-center gap-6">
                                    <div className="relative w-28 h-28">
                                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-100 dark:text-zinc-800" />
                                            <circle
                                                cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                                                strokeDasharray={`${((stats?.totalCorrect ?? 0) / (stats?.totalQuestions ?? 1)) * 264} 264`}
                                                strokeLinecap="round"
                                                className="text-blue-600"
                                                stroke="currentColor"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xl font-black text-zinc-900 dark:text-white">
                                                {Math.round(((stats?.totalCorrect ?? 0) / (stats?.totalQuestions ?? 1)) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            <span className="font-black text-zinc-900 dark:text-white">{stats?.totalCorrect}</span> correct out of <span className="font-black text-zinc-900 dark:text-white">{stats?.totalQuestions}</span> total questions
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === "progress" && (
                    <motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-8">
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-6">📈 Weekly Test Scores</h3>
                            {weeklyScores.length > 0 ? (
                                <div className="space-y-4">
                                    {weeklyScores.map((ws, i) => (
                                        <motion.div
                                            key={ws.week}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center gap-4"
                                        >
                                            <span className="text-xs font-black text-zinc-400 w-16 uppercase">{ws.week.replace("_", " ")}</span>
                                            <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full h-4 relative overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${ws.score}%` }}
                                                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                                                    className={`h-4 rounded-full ${ws.score >= 75 ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                                        : ws.score >= 60 ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                                            : "bg-gradient-to-r from-orange-400 to-red-400"
                                                        }`}
                                                />
                                            </div>
                                            <span className="text-sm font-black text-zinc-700 dark:text-zinc-300 w-12 text-right">{ws.score}%</span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${ws.passed
                                                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                                : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                                }`}>
                                                {ws.passed ? "✅" : "❌"}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <span className="text-5xl mb-4 block">📊</span>
                                    <p className="text-zinc-500 font-medium">No test scores yet</p>
                                    <p className="text-sm text-zinc-400 mt-1">Complete weekly mega tests to see your progress here!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === "activity" && (
                    <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-8">
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-6">⚡ Recent Activity</h3>
                            {weeklyScores.length > 0 ? (
                                <div className="space-y-4 relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-zinc-200 dark:bg-zinc-700" />

                                    {weeklyScores.slice().reverse().map((ws, i) => (
                                        <motion.div
                                            key={ws.week}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-start gap-4 relative"
                                        >
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${ws.passed
                                                ? "bg-green-100 dark:bg-green-900/30"
                                                : "bg-orange-100 dark:bg-orange-900/30"
                                                }`}>
                                                <span className="text-sm">{ws.passed ? "🏆" : "📝"}</span>
                                            </div>
                                            <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                                        {ws.passed ? "Passed" : "Attempted"} {ws.week.replace("_", " ").replace("w", "W")} Mega Test
                                                    </span>
                                                    <span className={`text-sm font-black ${ws.score >= 60 ? "text-green-600" : "text-orange-600"}`}>
                                                        {ws.score}%
                                                    </span>
                                                </div>
                                                {ws.timestamp && (
                                                    <p className="text-[10px] text-zinc-400 font-medium">
                                                        {new Date(ws.timestamp).toLocaleDateString("en-US", {
                                                            month: "short", day: "numeric", year: "numeric",
                                                            hour: "2-digit", minute: "2-digit"
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <span className="text-5xl mb-4 block">⚡</span>
                                    <p className="text-zinc-500 font-medium">No activity yet</p>
                                    <p className="text-sm text-zinc-400 mt-1">Your learning journey starts when you take your first quiz!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
