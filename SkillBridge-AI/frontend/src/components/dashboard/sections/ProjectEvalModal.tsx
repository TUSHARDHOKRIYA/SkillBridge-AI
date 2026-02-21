"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPost } from "@/lib/api";
import { Project, MajorProject } from "@/types";

interface EvalResult {
    score: number;
    passed: boolean;
    grade: string;
    summary: string;
    strengths: string[];
    improvements: string[];
    feedback: string;
}

interface ProjectEvalModalProps {
    project: Project | MajorProject;
    weekNumber?: number; // undefined for major projects
    onClose: () => void;
    onEvaluated: (score: number, passed: boolean) => void;
}

export function ProjectEvalModal({ project, weekNumber, onClose, onEvaluated }: ProjectEvalModalProps) {
    const [submission, setSubmission] = useState("");
    const [evaluating, setEvaluating] = useState(false);
    const [result, setResult] = useState<EvalResult | null>(null);
    const [error, setError] = useState("");

    const isMajor = !weekNumber;

    const handleSubmit = async () => {
        if (!submission.trim()) return;
        setEvaluating(true);
        setError("");
        try {
            const data = await apiPost<EvalResult>("/api/v1/ai/project/evaluate", {
                project_title: project.title,
                project_description: project.description,
                requirements: project.requirements || [],
                expected_output: project.expected_output || "",
                user_submission: submission,
            });
            setResult(data);
            onEvaluated(data.score, data.passed);
        } catch (err: any) {
            setError(err.message || "Evaluation failed. Please try again.");
        } finally {
            setEvaluating(false);
        }
    };

    const getGradeColor = (grade: string) => {
        if (grade.startsWith("A")) return "text-green-600 bg-green-100 dark:bg-green-900/30";
        if (grade.startsWith("B")) return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
        if (grade.startsWith("C")) return "text-amber-600 bg-amber-100 dark:bg-amber-900/30";
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className={`p-6 text-white flex-shrink-0 ${isMajor
                    ? "bg-gradient-to-r from-purple-600 to-pink-600"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600"
                    }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                                {isMajor ? "🏆 Major Project" : `📋 Week ${weekNumber} Mini Project`}
                            </p>
                            <h2 className="text-xl font-black mt-1">{project.title}</h2>
                        </div>
                        <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {!result ? (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                {/* Project details */}
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-5 space-y-3">
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{project.description}</p>

                                    {project.requirements && project.requirements.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Requirements</h4>
                                            <ul className="space-y-1">
                                                {project.requirements.map((r, i) => (
                                                    <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                                                        <span className="text-blue-500 mt-0.5">•</span> {r}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {project.expected_output && (
                                        <div>
                                            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Expected Output</h4>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{project.expected_output}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Submission */}
                                <div>
                                    <h4 className="text-sm font-black text-zinc-900 dark:text-white mb-3">📝 Your Submission</h4>
                                    <textarea
                                        value={submission}
                                        onChange={e => setSubmission(e.target.value)}
                                        placeholder="Paste your GitHub repository link, or describe what you built and the key decisions you made..."
                                        rows={6}
                                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm font-bold border border-red-200 dark:border-red-800">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={!submission.trim() || evaluating}
                                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {evaluating ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            AI is evaluating your project...
                                        </span>
                                    ) : (
                                        "Submit for AI Evaluation 🚀"
                                    )}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                {/* Score header */}
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-4 mb-4">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", bounce: 0.5 }}
                                            className="text-6xl font-black"
                                            style={{ color: result.score >= 60 ? "#22c55e" : "#f97316" }}
                                        >
                                            {result.score}
                                        </motion.div>
                                        <div className="text-left">
                                            <span className={`text-2xl font-black px-3 py-1 rounded-xl ${getGradeColor(result.grade)}`}>
                                                {result.grade}
                                            </span>
                                            <p className="text-xs text-zinc-500 mt-1 font-bold">
                                                {result.passed ? "✅ Project Passed" : "⚠️ Needs More Work"}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium max-w-md mx-auto">{result.summary}</p>
                                </div>

                                {/* Strengths */}
                                {result.strengths.length > 0 && (
                                    <div className="bg-green-50 dark:bg-green-900/15 rounded-2xl p-5 border border-green-200 dark:border-green-800">
                                        <h4 className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <span>💪</span> Strengths
                                        </h4>
                                        <ul className="space-y-2">
                                            {result.strengths.map((s, i) => (
                                                <li key={i} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5">✓</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Improvements */}
                                {result.improvements.length > 0 && (
                                    <div className="bg-amber-50 dark:bg-amber-900/15 rounded-2xl p-5 border border-amber-200 dark:border-amber-800">
                                        <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <span>📈</span> Areas for Improvement
                                        </h4>
                                        <ul className="space-y-2">
                                            {result.improvements.map((s, i) => (
                                                <li key={i} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                                                    <span className="text-amber-500 mt-0.5">→</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Detailed Feedback */}
                                <div className="bg-blue-50 dark:bg-blue-900/15 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
                                    <h4 className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span>💡</span> Detailed Feedback
                                    </h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">{result.feedback}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-zinc-100 dark:border-zinc-800 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm hover:scale-105 transition-all"
                    >
                        {result ? "Done ✓" : "Cancel"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
