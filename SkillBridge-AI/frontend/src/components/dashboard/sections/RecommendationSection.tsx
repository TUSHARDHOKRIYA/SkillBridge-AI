"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Recommendation } from "@/types";

interface RecommendationSectionProps {
    onComplete: (domain: string) => void;
    onBack: () => void;
    inputs?: {
        domain: string;
        skills: string[];
        goals: string;
        knowledge: string;
    };
    isGenerating?: boolean;
}

export const RecommendationSection = ({ onComplete, onBack, inputs, isGenerating }: RecommendationSectionProps) => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMath, setShowMath] = useState(false);
    // Added a local progress state for the generation animation
    const [progress, setProgress] = useState(10);
    const { user } = useAuth();

    useEffect(() => {
        const fetchRecommendation = async () => {
            try {
                const token = await user?.getIdToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/recommend-domain`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        // Map the user's explicit domain + career goals into 'interests' to drive the recommendation API
                        interests: [inputs?.domain, inputs?.goals].filter(Boolean) as string[],
                        skills: inputs?.skills || []
                    })
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch recommendations");
                }

                const data = await response.json();
                setRecommendations(data);
            } catch (error) {
                console.error("Error fetching recommendation", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchRecommendation();
        }
    }, [user, inputs]);

    // Simulate progress while isGenerating is true
    useEffect(() => {
        if (isGenerating) {
            setProgress(15);
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 95) return prev;
                    // Slow down progress as it gets higher
                    const increment = prev < 50 ? 5 : prev < 80 ? 2 : 1;
                    return prev + increment;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isGenerating]);

    const topDomain = recommendations[0];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-8">
                <div className="relative w-24 h-24">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-blue-600/20 border-t-blue-600 rounded-full"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 flex items-center justify-center text-3xl"
                    >
                        🧠
                    </motion.div>
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">AI is Analyzing Your Fit</h2>
                    <p className="text-zinc-500 font-medium animate-pulse">Calculating interest vs. readiness scores...</p>
                </div>
            </div>
        );
    }

    if (isGenerating) {
        return (
            <div className="max-w-2xl mx-auto py-32 text-center space-y-8">
                <div className="relative w-32 h-32 mx-auto">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-blue-600/20 border-t-blue-600 rounded-full"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 flex items-center justify-center text-4xl"
                    >
                        🛠️
                    </motion.div>
                </div>

                <div>
                    <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-4">
                        Compiling Your Custom Curriculum
                    </h2>
                    <p className="text-zinc-500 font-medium max-w-md mx-auto mb-8">
                        Our AI is researching topics, structuring weekly milestones, sourcing high-quality tutorials, and designing capstone projects tailored just for you. This usually takes about 60 seconds.
                    </p>

                    {/* Status Bar */}
                    <div className="w-full max-w-md mx-auto bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden shadow-inner">
                        <motion.div
                            className="bg-blue-600 h-full rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="flex justify-between items-center max-w-md mx-auto mt-2 text-xs font-bold text-zinc-400">
                        <span>
                            {progress < 30 ? "Structuring weeks..." :
                                progress < 60 ? "Searching YouTube..." :
                                    progress < 85 ? "Validating projects..." :
                                        "Finalizing syllabus..."}
                        </span>
                        <span>{progress}%</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">
                        Your Recommendation
                    </h1>
                    <p className="text-zinc-500 font-medium">
                        Based on our 60/40 scoring algorithm, here is your ideal career path.
                    </p>
                </div>
                <button
                    onClick={() => setShowMath(!showMath)}
                    className="px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-colors"
                >
                    {showMath ? "Hide Logic" : "View Math"}
                </button>
            </header>

            <div className="space-y-8">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
                                🎯
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">
                                    Top Recommended Domain
                                </h2>
                                <p className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">
                                    {topDomain?.domain}
                                </p>
                            </div>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Match Score</p>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-6xl font-black text-blue-600 tracking-tighter"
                            >
                                {topDomain?.final_score?.toFixed(0)}%
                            </motion.p>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showMath && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-10 pt-10 border-t border-zinc-100 dark:border-zinc-800 overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-bold text-zinc-500">Interest Score (60%)</span>
                                            <span className="text-2xl font-black text-blue-600">{(topDomain?.interest_score * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${topDomain?.interest_score * 100}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                                className="h-full bg-blue-600"
                                            />
                                        </div>
                                        <p className="text-xs text-zinc-400 font-medium italic">Derived from your stated interests and career goals.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-bold text-zinc-500">Readiness Score (40%)</span>
                                            <span className="text-2xl font-black text-green-600">{(topDomain?.readiness_score * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${topDomain?.readiness_score * 100}%` }}
                                                transition={{ duration: 1, delay: 0.4 }}
                                                className="h-full bg-green-500"
                                            />
                                        </div>
                                        <p className="text-xs text-zinc-400 font-medium italic">Based on your current skills and experience level.</p>
                                    </div>
                                </div>
                                <div className="mt-10 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        <span className="font-black text-zinc-900 dark:text-white uppercase tracking-widest text-[10px] block mb-2">AI Reasoning</span>
                                        We recommended <span className="text-blue-600 font-bold">{topDomain?.domain}</span> because your high interest in AI and Web Dev aligns with your foundational knowledge of Python and React. This path offers the most efficient bridge to your career goals.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 bg-green-50/50 dark:bg-green-900/10 rounded-[2rem] border border-green-100 dark:border-green-900/30">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4">✅ Fully Covered</p>
                        <div className="flex flex-wrap gap-2">
                            {(topDomain?.skill_gap?.fully_covered || []).map((s: string) => (
                                <span key={s} className="px-3 py-1.5 bg-white dark:bg-zinc-800 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800 text-[10px] font-bold uppercase tracking-wider">{s}</span>
                            ))}
                            {(!topDomain?.skill_gap?.fully_covered || topDomain.skill_gap.fully_covered.length === 0) && (
                                <span className="text-xs text-zinc-400 italic">No skills fully covered yet</span>
                            )}
                        </div>
                    </div>
                    <div className="p-8 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-[2rem] border border-yellow-100 dark:border-yellow-900/30">
                        <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-4">⚠️ Partially Covered</p>
                        <div className="flex flex-wrap gap-2">
                            {(topDomain?.skill_gap?.partially_covered || []).map((s: string) => (
                                <span key={s} className="px-3 py-1.5 bg-white dark:bg-zinc-800 text-yellow-700 dark:text-yellow-300 rounded-xl border border-yellow-200 dark:border-yellow-800 text-[10px] font-bold uppercase tracking-wider">{s}</span>
                            ))}
                            {(!topDomain?.skill_gap?.partially_covered || topDomain.skill_gap.partially_covered.length === 0) && (
                                <span className="text-xs text-zinc-400 italic">No partially covered skills</span>
                            )}
                        </div>
                    </div>
                    <div className="p-8 bg-red-50/50 dark:bg-red-900/10 rounded-[2rem] border border-red-100 dark:border-red-900/30">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">❌ Missing Skills</p>
                        <div className="flex flex-wrap gap-2">
                            {(topDomain?.skill_gap?.missing || []).map((s: string) => (
                                <span key={s} className="px-3 py-1.5 bg-white dark:bg-zinc-800 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800 text-[10px] font-bold uppercase tracking-wider">{s}</span>
                            ))}
                            {(!topDomain?.skill_gap?.missing || topDomain.skill_gap.missing.length === 0) && (
                                <span className="text-xs text-zinc-400 italic">No missing skills identified</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-8">
                    <button
                        onClick={() => onComplete(topDomain.domain)}
                        className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black transition-all shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Confirm & Generate My Roadmap →
                    </button>
                    <button
                        onClick={onBack}
                        className="px-8 py-5 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                    >
                        Adjust Profile
                    </button>
                </div>
            </div>
        </div>
    );
};
