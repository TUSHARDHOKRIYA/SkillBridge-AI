"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/features/auth/AuthContext";

export type DashboardStage = "profile" | "inputs" | "recommendation" | "roadmap" | "interview" | "export";

interface SidebarProps {
    currentStage: DashboardStage;
    maxUnlockedStage: number;
    onStageChange: (stage: DashboardStage) => void;
}

const stages: { id: DashboardStage; label: string; icon: string }[] = [
    { id: "profile", label: "My Dashboard", icon: "📊" },
    { id: "inputs", label: "Profile Setup", icon: "👤" },
    { id: "recommendation", label: "AI Recommendation", icon: "🎯" },
    { id: "roadmap", label: "Learning Roadmap", icon: "🗺️" },
    { id: "interview", label: "Interview Prep", icon: "🎙️" },
    { id: "export", label: "Export & Share", icon: "📤" },
];

export const Sidebar = ({ currentStage, maxUnlockedStage, onStageChange }: SidebarProps) => {
    const { logout } = useAuth();

    return (
        <aside className="w-72 min-h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col sticky top-0">
            <div className="p-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-black text-blue-600 tracking-tighter mb-12"
                >
                    SkillBridge AI
                </motion.div>

                <nav className="space-y-1">
                    {stages.map((stage, index) => {
                        const isLocked = index > maxUnlockedStage;
                        const isActive = currentStage === stage.id;
                        const isCompleted = index < maxUnlockedStage;

                        return (
                            <motion.button
                                key={stage.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => !isLocked && onStageChange(stage.id)}
                                disabled={isLocked}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative group ${isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                    : isLocked
                                        ? "opacity-40 cursor-not-allowed grayscale"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-blue-600 rounded-xl -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                <span className="text-xl">{stage.icon}</span>
                                <span className="font-bold text-sm tracking-tight">{stage.label}</span>

                                {isCompleted && !isActive && (
                                    <span className="ml-auto text-green-500 text-xs">✓</span>
                                )}
                                {isLocked && (
                                    <span className="ml-auto text-zinc-400 text-xs">🔒</span>
                                )}
                            </motion.button>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-8 border-t border-zinc-100 dark:border-zinc-800">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold text-sm transition-colors"
                >
                    <span>🚪</span> Logout
                </button>
            </div>
        </aside>
    );
};
