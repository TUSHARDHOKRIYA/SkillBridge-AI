"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/features/auth/AuthContext";
import { useRouter } from "next/navigation";

import { Recommendation } from "@/types";

export default function RecommendationPage() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const fetchRecommendation = async () => {
            try {
                const token = await user?.getIdToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/recommend-domain`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
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
    }, [user]);

    const topDomain = recommendations[0];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
                        Your Personalized Recommendation
                    </h1>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-zinc-600 dark:text-zinc-400 animate-pulse">
                                AI is calculating your career fit...
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-2xl">🎯</div>
                                        <div>
                                            <h2 className="text-sm font-medium text-blue-600 uppercase tracking-wider">
                                                Top Recommended Domain
                                            </h2>
                                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                                {topDomain?.domain}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-zinc-500 uppercase">Match Score</p>
                                        <p className="text-3xl font-black text-blue-600">{(topDomain?.final_score * 100).toFixed(0)}%</p>
                                    </div>
                                </div>

                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 mb-8">
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                                        <span>📊</span> How we calculated this
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-500">Interest Score (60%)</span>
                                                <span className="font-bold text-blue-600">{(topDomain?.interest_score * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${topDomain?.interest_score * 100}%` }} />
                                            </div>
                                            <p className="text-[10px] text-zinc-400 italic">Based on your onboarding interests and goals.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-zinc-500">Readiness Score (40%)</span>
                                                <span className="font-bold text-green-600">{(topDomain?.readiness_score * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500" style={{ width: `${topDomain?.readiness_score * 100}%` }} />
                                            </div>
                                            <p className="text-[10px] text-zinc-400 italic">Based on your current skill set and experience level.</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            <span className="font-bold text-zinc-900 dark:text-white">AI Reasoning:</span> We recommended <span className="text-blue-600 font-semibold">{topDomain?.domain}</span> because your high interest in AI and Web Dev aligns with your foundational knowledge of Python and React. This path offers the most efficient bridge to your career goals.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Skill Gap Analysis</h3>
                                    <div className="grid gap-4">
                                        <div className="p-4 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                                            <p className="text-xs font-bold text-green-600 uppercase mb-3">✅ Fully Covered</p>
                                            <div className="flex flex-wrap gap-2">
                                                {topDomain?.skill_gap.fully_covered.map((s: string) => (
                                                    <span key={s} className="px-2 py-1 bg-white dark:bg-zinc-800 text-green-700 dark:text-green-300 rounded border border-green-200 dark:border-green-800 text-xs font-medium">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                                            <p className="text-xs font-bold text-yellow-600 uppercase mb-3">⚠️ Partially Covered</p>
                                            <div className="flex flex-wrap gap-2">
                                                {topDomain?.skill_gap.partially_covered.map((s: string) => (
                                                    <span key={s} className="px-2 py-1 bg-white dark:bg-zinc-800 text-yellow-700 dark:text-yellow-300 rounded border border-yellow-200 dark:border-yellow-800 text-xs font-medium">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                                            <p className="text-xs font-bold text-red-600 uppercase mb-3">❌ Missing Skills (Your Focus)</p>
                                            <div className="flex flex-wrap gap-2">
                                                {topDomain?.skill_gap.missing.map((s: string) => (
                                                    <span key={s} className="px-2 py-1 bg-white dark:bg-zinc-800 text-red-700 dark:text-red-300 rounded border border-red-200 dark:border-red-800 text-xs font-medium">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => router.push("/syllabus-upload")}
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Confirm & Continue to Syllabus Upload
                                </button>
                                <button
                                    onClick={() => router.push("/onboarding")}
                                    className="px-6 py-4 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Retake Onboarding
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
