"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MCQQuestion } from "@/types";

interface TopicResult {
    topic: string;
    score: number;
}

interface PerformancePanelProps {
    weekNumber: number;
    totalScore: number;
    topicScores: Record<string, number>;
    questions: MCQQuestion[];
    userAnswers: number[];
    timeTaken?: number; // in seconds
    onClose: () => void;
    onRetryWeek: () => void;
}

function getStatus(score: number): { label: string; icon: string; color: string; bg: string } {
    if (score >= 75) return { label: "Strong", icon: "✅", color: "text-green-700 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/20" };
    if (score >= 50) return { label: "Needs Review", icon: "⚠️", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/20" };
    return { label: "Weak", icon: "❌", color: "text-red-700 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/20" };
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
}

type Tab = "overview" | "questions";

export function PerformancePanel({
    weekNumber, totalScore, topicScores, questions, userAnswers, timeTaken, onClose, onRetryWeek
}: PerformancePanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [expandedQ, setExpandedQ] = useState<number | null>(null);

    const topics: TopicResult[] = Object.entries(topicScores).map(([topic, score]) => ({ topic, score }));
    const passed = totalScore >= 60;
    const weakTopics = topics.filter(t => t.score < 50);
    const reviewTopics = topics.filter(t => t.score >= 50 && t.score < 75);
    const strongTopics = topics.filter(t => t.score >= 75);
    const correctCount = questions.length > 0 ? userAnswers.filter((a, i) => a === questions[i]?.correct_index).length : 0;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className={`p-6 text-white flex-shrink-0 ${passed ? "bg-gradient-to-r from-green-600 to-emerald-600" : "bg-gradient-to-r from-orange-500 to-red-500"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-80">Week {weekNumber} Detailed Report</p>
                            <p className="font-black text-2xl">{passed ? "Great job! 🎉" : "Room to grow! 💪"}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-black">{totalScore}%</div>
                            <p className="text-xs opacity-80">{correctCount}/{questions.length} correct</p>
                        </div>
                    </div>
                    {/* Stats row */}
                    <div className="flex gap-4 mt-4">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 rounded-xl text-xs font-bold">
                            {passed ? "✅ Passed" : "⚠️ Below 60%"}
                        </div>
                        {timeTaken != null && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 rounded-xl text-xs font-bold">
                                ⏱ {formatTime(timeTaken)}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 rounded-xl text-xs font-bold">
                            📊 {topics.length} Topics
                        </div>
                    </div>
                    {/* Overall bar */}
                    <div className="w-full bg-white/20 rounded-full h-3 mt-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalScore}%` }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="bg-white rounded-full h-3"
                        />
                    </div>
                </div>

                {/* Tab switcher */}
                <div className="flex border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`flex-1 py-3 text-sm font-black text-center transition-all ${activeTab === "overview"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-zinc-400 hover:text-zinc-600"
                            }`}
                    >
                        📊 Topic Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("questions")}
                        className={`flex-1 py-3 text-sm font-black text-center transition-all ${activeTab === "questions"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-zinc-400 hover:text-zinc-600"
                            }`}
                    >
                        📝 Question Review ({questions.length})
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {activeTab === "overview" ? (
                            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                                {/* Summary chips */}
                                <div className="flex gap-3 flex-wrap">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                                        <span>✅</span>
                                        <span className="text-xs font-bold text-green-700 dark:text-green-400">{strongTopics.length} Strong</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/20 rounded-2xl">
                                        <span>⚠️</span>
                                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{reviewTopics.length} Review</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 rounded-2xl">
                                        <span>❌</span>
                                        <span className="text-xs font-bold text-red-700 dark:text-red-400">{weakTopics.length} Weak</span>
                                    </div>
                                </div>

                                {/* Topic breakdown */}
                                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Topic Breakdown</h3>
                                {topics.sort((a, b) => b.score - a.score).map((t, i) => {
                                    const status = getStatus(t.score);
                                    return (
                                        <motion.div
                                            key={t.topic}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="space-y-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-black px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                                                        {status.icon} {status.label}
                                                    </span>
                                                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{t.topic}</span>
                                                </div>
                                                <span className="text-sm font-black text-zinc-500">{t.score}%</span>
                                            </div>
                                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${t.score}%` }}
                                                    transition={{ delay: 0.5 + i * 0.07, duration: 0.6 }}
                                                    className={`h-2 rounded-full ${t.score >= 75 ? "bg-green-500" : t.score >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {/* Recommendations */}
                                {weakTopics.length > 0 && (
                                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">💡 Recommended Actions</p>
                                        {weakTopics.map(t => (
                                            <p key={t.topic} className="text-sm text-blue-700 dark:text-blue-400 mb-1">
                                                • Re-watch videos on <span className="font-bold">{t.topic}</span> — you scored {t.score}%
                                            </p>
                                        ))}
                                        {!passed && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-bold">
                                                ⚠️ You need ≥60% to unlock the next week. Review the weak topics and retry!
                                            </p>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                {questions.map((q, i) => {
                                    const userAnswer = userAnswers[i];
                                    const isCorrect = userAnswer === q.correct_index;
                                    const isExpanded = expandedQ === i;

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className={`rounded-2xl border-2 overflow-hidden transition-all ${isCorrect
                                                ? "border-green-200 dark:border-green-800"
                                                : "border-red-200 dark:border-red-800"
                                                }`}
                                        >
                                            {/* Question header */}
                                            <button
                                                onClick={() => setExpandedQ(isExpanded ? null : i)}
                                                className="w-full flex items-center gap-3 p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                            >
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black ${isCorrect
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                                    }`}>
                                                    {isCorrect ? "✓" : "✗"}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{q.question}</p>
                                                    {q.topic && <span className="text-[10px] font-bold text-zinc-400 uppercase">{q.topic}</span>}
                                                </div>
                                                <span className="text-zinc-400 text-sm flex-shrink-0">{isExpanded ? "▲" : "▼"}</span>
                                            </button>

                                            {/* Expanded detail */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="border-t border-zinc-100 dark:border-zinc-800"
                                                    >
                                                        <div className="p-4 space-y-2">
                                                            {q.options.map((opt, oi) => {
                                                                const isUserPick = oi === userAnswer;
                                                                const isCorrectOpt = oi === q.correct_index;
                                                                return (
                                                                    <div key={oi} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${isCorrectOpt
                                                                        ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold"
                                                                        : isUserPick && !isCorrectOpt
                                                                            ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 line-through"
                                                                            : "text-zinc-600 dark:text-zinc-400"
                                                                        }`}>
                                                                        {isCorrectOpt && <span>✅</span>}
                                                                        {isUserPick && !isCorrectOpt && <span>❌</span>}
                                                                        <span>{opt}</span>
                                                                        {isUserPick && <span className="ml-auto text-[10px] font-black uppercase">Your answer</span>}
                                                                    </div>
                                                                );
                                                            })}
                                                            {q.explanation && (
                                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/15 rounded-xl">
                                                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400">💡 Explanation</p>
                                                                    <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">{q.explanation}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer actions */}
                <div className="flex gap-3 p-6 border-t border-zinc-100 dark:border-zinc-800 flex-shrink-0">
                    {!passed && (
                        <button
                            onClick={onRetryWeek}
                            className="flex-1 py-3 border-2 border-zinc-300 dark:border-zinc-600 rounded-2xl font-bold text-sm hover:border-blue-500 transition-colors"
                        >
                            Retry Test 🔄
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm hover:scale-105 transition-all"
                    >
                        {passed ? "Continue →" : "Review Videos"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
