"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlternativeVideo } from "@/types";
import { getAlternativeVideos } from "@/lib/quiz-api";

interface AlternativeVideosProps {
    topic: string;
    currentUrl: string;
}

const LABEL_STYLES: Record<string, string> = {
    "Short Crash Course": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "In-Depth Guide": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "Project-Based": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};
const LABEL_ICONS: Record<string, string> = {
    "Short Crash Course": "⚡",
    "In-Depth Guide": "📘",
    "Project-Based": "🛠️",
};

export function AlternativeVideos({ topic, currentUrl }: AlternativeVideosProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alternatives, setAlternatives] = useState<AlternativeVideo[]>([]);
    const [error, setError] = useState("");

    const load = async () => {
        if (alternatives.length > 0) { setOpen(true); return; }
        setLoading(true);
        setOpen(true);
        try {
            const data = await getAlternativeVideos(topic, currentUrl);
            setAlternatives(data.alternatives || []);
        } catch {
            setError("Couldn't fetch alternatives. Check your YouTube API key.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={load}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 rounded-xl transition-all"
            >
                🔄 Try Another
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute left-0 top-10 z-50 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden"
                        >
                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-wider">Not vibing?</p>
                                    <p className="font-bold text-zinc-900 dark:text-white text-sm">Try these instead</p>
                                </div>
                                <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600 text-lg">✕</button>
                            </div>

                            <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                                {loading && (
                                    <div className="flex items-center justify-center py-8 gap-3 text-zinc-400">
                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm">Finding alternatives...</span>
                                    </div>
                                )}
                                {error && <p className="text-xs text-red-500 p-3">{error}</p>}
                                {alternatives.map((alt, i) => (
                                    <a
                                        key={i}
                                        href={alt.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all group"
                                    >
                                        {alt.thumbnail && (
                                            <img src={alt.thumbnail} alt="" className="w-16 h-11 rounded-lg object-cover flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${LABEL_STYLES[alt.label] || ""}`}>
                                                {LABEL_ICONS[alt.label]} {alt.label}
                                            </span>
                                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {alt.title}
                                            </p>
                                            <p className="text-[10px] text-zinc-400 mt-1">{alt.channel} · {alt.duration}</p>
                                        </div>
                                    </a>
                                ))}
                                {!loading && !error && alternatives.length === 0 && (
                                    <p className="text-sm text-zinc-400 text-center py-4">No alternatives found for this topic.</p>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
