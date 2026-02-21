"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Roadmap } from "@/types";

interface ExportSectionProps {
    exportUrl: string | null;
    onExport: () => Promise<void>;
    isLoading: boolean;
}

export const ExportSection = ({ exportUrl, onExport, isLoading }: ExportSectionProps) => {
    // We rely on parent to handle export logic if needed, or if URL is already there we show success.

    // Logic:
    // If exportUrl exists -> Show "Open Sheet" UI (Success state).
    // If not exists -> Show "Export" button (which calls onExport).

    const [localExporting, setLocalExporting] = useState(false);

    const handleExportClick = async () => {
        setLocalExporting(true);
        await onExport(); // Parent handles logic
        setLocalExporting(false);
    };

    const isExporting = isLoading || localExporting;
    const hasUrl = !!exportUrl;

    return (
        <div className="max-w-3xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">
                    Export & Continuity
                </h1>
                <p className="text-zinc-500 font-medium">
                    Take your roadmap with you. Export to Google Sheets for long-term tracking and sharing.
                </p>
            </header>

            <div className="bg-white dark:bg-zinc-900 p-12 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">
                        📊
                    </div>

                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                        Google Sheets Integration
                    </h2>
                    <p className="text-sm text-zinc-500 mb-12 max-w-md mx-auto leading-relaxed">
                        We&apos;ll generate a personalized spreadsheet with your weekly tasks, resources, and progress trackers. You can share this with mentors or use it for offline tracking.
                    </p>

                    <AnimatePresence mode="wait">
                        {!hasUrl ? (
                            <motion.button
                                key="export-btn"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={handleExportClick}
                                disabled={isExporting}
                                className="px-12 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50 flex items-center gap-4 mx-auto"
                            >
                                {isExporting ? (
                                    <>
                                        <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            ⏳
                                        </motion.span>
                                        Generating Sheet...
                                    </>
                                ) : (
                                    <>
                                        <span>📊</span> Export to Sheets
                                    </>
                                )}
                            </motion.button>
                        ) : (
                            <motion.div
                                key="export-success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-8"
                            >
                                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-3xl border border-green-100 dark:border-green-900/30">
                                    <p className="text-green-600 font-black uppercase tracking-widest text-xs mb-2">Success!</p>
                                    <p className="text-zinc-900 dark:text-white font-bold">Your roadmap has been exported successfully.</p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <a
                                        href={exportUrl || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20 block"
                                    >
                                        Open Google Sheet ↗
                                    </a>
                                    <button
                                        onClick={() => {
                                            if (exportUrl) {
                                                navigator.clipboard.writeText(exportUrl);
                                            }
                                        }}
                                        className="text-sm font-bold text-zinc-400 hover:text-blue-600 transition-colors"
                                    >
                                        Copy Link to Clipboard
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Background Decoration */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
            </div>
        </div>
    );
};
