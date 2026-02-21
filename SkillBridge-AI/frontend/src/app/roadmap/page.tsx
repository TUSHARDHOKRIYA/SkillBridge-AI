"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/features/auth/AuthContext";

import { Roadmap } from "@/types";

export default function RoadmapPage() {
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                const token = await user?.getIdToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/generate-roadmap`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setRoadmap(data);
            } catch (error) {
                console.error("Error fetching roadmap", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchRoadmap();
        }
    }, [user]);

    const [exporting, setExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        // Simulate export process
        await new Promise(r => setTimeout(r, 2000));
        setExporting(false);
        setExportSuccess(true);
        if (roadmap?.google_sheet_url) {
            window.open(roadmap.google_sheet_url, "_blank");
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Active Path</span>
                                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                                    {roadmap?.domain || "Your Career Roadmap"}
                                </h1>
                            </div>
                            <p className="text-zinc-500 font-medium flex items-center gap-4">
                                <span>📅 {roadmap?.totalDurationWeeks} Weeks</span>
                                <span>⏳ {roadmap?.weeklyHours} Hours/Week</span>
                                <span className="text-blue-600">🎯 Industry Ready</span>
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <button
                                onClick={handleExport}
                                disabled={exporting || !roadmap?.google_sheet_url}
                                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg ${exportSuccess
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-105"
                                    } disabled:opacity-50`}
                            >
                                {exporting ? (
                                    <span className="animate-spin">⏳</span>
                                ) : exportSuccess ? (
                                    <span>✅ Exported</span>
                                ) : (
                                    <span>📊 Export to Sheets</span>
                                )}
                            </button>
                            {exportSuccess && (
                                <p className="text-[10px] text-green-600 font-bold animate-bounce">Sheet generated successfully!</p>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-48 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-20 relative">
                            {/* Vertical Line for the whole roadmap */}
                            <div className="absolute left-[20px] top-10 bottom-10 w-0.5 bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

                            {roadmap?.phases.map((phase, pIndex) => (
                                <div key={pIndex} className="relative">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black z-10 shadow-lg shadow-blue-500/30">
                                            {pIndex + 1}
                                        </div>
                                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                                            {phase.phaseName}
                                        </h2>
                                    </div>

                                    <div className="space-y-12 ml-4 md:ml-12">
                                        {phase.weeklyPlan.map((week, wIndex) => (
                                            <div key={wIndex} className="group relative">
                                                {/* Connector dot */}
                                                <div className="absolute -left-[32px] top-8 w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 border-4 border-zinc-50 dark:border-black group-hover:bg-blue-600 transition-colors hidden md:block" />

                                                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300">
                                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                                                        <div>
                                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Week {week.week}</p>
                                                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                                                                {week.topic}
                                                            </h3>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {week.skillsCovered.map(skill => (
                                                                <span key={skill} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-8">
                                                        <div className="space-y-4">
                                                            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Deliverable</h4>
                                                            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                                                <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                                                                    {week.deliverable}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Learning Resources</h4>
                                                            <div className="grid gap-3">
                                                                {week.learning_resources.map((res, rIndex) => (
                                                                    <a
                                                                        key={rIndex}
                                                                        href={res.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:border-blue-500 hover:bg-white dark:hover:bg-zinc-800 transition-all group/res"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-xl">{res.type === 'video' ? '📺' : '📖'}</span>
                                                                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover/res:text-blue-600 truncate max-w-[150px]">
                                                                                {res.title}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-blue-600 opacity-0 group-hover/res:opacity-100 transition-opacity">→</span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
