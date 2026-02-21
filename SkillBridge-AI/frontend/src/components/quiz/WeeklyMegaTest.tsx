"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MCQQuestion } from "@/types";
import { generateWeeklyTest, submitQuizResult } from "@/lib/quiz-api";

interface WeeklyMegaTestProps {
    weekNumber: number;
    weekKey: string;
    weekTopics: string[];
    onClose: () => void;
    onComplete: (
        score: number,
        passed: boolean,
        topicScores: Record<string, number>,
        questions: MCQQuestion[],
        userAnswers: number[],
        timeTaken: number,
    ) => void;
}

export function WeeklyMegaTest({ weekNumber, weekKey, weekTopics, onClose, onComplete }: WeeklyMegaTestProps) {
    const [questions, setQuestions] = useState<MCQQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [showingAnswer, setShowingAnswer] = useState(false);
    const [finished, setFinished] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [topicScores, setTopicScores] = useState<Record<string, number>>({});
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        const load = async () => {
            try {
                const data = await generateWeeklyTest(weekNumber, weekTopics);
                setQuestions(data.questions || []);
            } catch {
                // Fallback mock
                setQuestions(weekTopics.map((t) => ({
                    question: `Which of the following best describes ${t}?`,
                    options: ["A. Input processing", "B. Core concept implementation", "C. Output rendering", "D. Error handling"],
                    correct_index: 1,
                    explanation: `${t} is fundamentally about core concept implementation.`,
                    topic: t,
                })));
            } finally {
                setLoading(false);
                startTimeRef.current = Date.now();
            }
        };
        load();
    }, [weekNumber, weekTopics]);

    const handleSelect = (index: number) => {
        if (showingAnswer) return;
        setSelected(index);
        setShowingAnswer(true);
        setTimeout(() => {
            const newAnswers = [...answers, index];
            setAnswers(newAnswers);
            if (currentQ + 1 >= questions.length) {
                finishTest(newAnswers);
            } else {
                setTimeout(() => {
                    setCurrentQ(q => q + 1);
                    setSelected(null);
                    setShowingAnswer(false);
                }, 800);
            }
        }, 1000);
    };

    const finishTest = async (finalAnswers: number[]) => {
        let correct = 0;
        const tScores: Record<string, number[]> = {};

        questions.forEach((q, i) => {
            const isCorrect = finalAnswers[i] === q.correct_index;
            if (isCorrect) correct++;
            const topic = q.topic || "General";
            if (!tScores[topic]) tScores[topic] = [];
            tScores[topic].push(isCorrect ? 1 : 0);
        });

        const score = Math.round((correct / questions.length) * 100);
        const computed: Record<string, number> = {};
        for (const [t, scores] of Object.entries(tScores)) {
            computed[t] = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
        }

        const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);

        setFinalScore(score);
        setTopicScores(computed);
        setFinished(true);

        const passed = score >= 60;
        try {
            await submitQuizResult({
                quiz_type: "weekly",
                week_key: weekKey,
                score,
                total_questions: questions.length,
                correct_answers: correct,
                topic_scores: computed,
                passed,
            });
        } catch { /* non-fatal */ }

        onComplete(score, passed, computed, questions, finalAnswers, timeTaken);
    };

    const q = questions[currentQ];
    const passed = finalScore >= 60;
    const progress = questions.length > 0 ? (currentQ / questions.length) * 100 : 0;

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 flex flex-col items-center gap-4 max-w-md w-full mx-4">
                    <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-600 dark:text-zinc-400 font-bold text-center">
                        🧠 Building your Week {weekNumber} comprehensive test...<br />
                        <span className="text-sm font-normal opacity-70">This takes a few seconds</span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-6 text-white flex-shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-80">Week {weekNumber} Mega Test</p>
                            <p className="font-bold text-lg">Comprehensive Review</p>
                        </div>
                        <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-4">
                        <div className="bg-white rounded-full h-2 transition-all duration-300" style={{ width: `${finished ? 100 : progress}%` }} />
                    </div>
                    {!finished && <p className="text-xs opacity-70 mt-1">{currentQ + 1} of {questions.length} questions</p>}
                </div>

                <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {finished ? (
                            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center">
                                <div className="text-6xl mb-4">{passed ? "🏆" : "📖"}</div>
                                <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">
                                    {passed ? "Week Complete! 🎉" : "Almost there!"}
                                </h3>
                                <div className="text-5xl font-black mb-2" style={{ color: passed ? "#22c55e" : "#f97316" }}>
                                    {finalScore}%
                                </div>
                                <p className="text-zinc-500 mb-6">
                                    {passed ? "✅ You scored above 60% — Week unlocked!" : "⚠️ Score below 60% — Review weak topics before proceeding"}
                                </p>
                                {!passed && (
                                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 mb-6 text-left">
                                        <p className="text-sm font-bold text-orange-700 dark:text-orange-400 mb-2">Topics to review:</p>
                                        {Object.entries(topicScores).filter(([, s]) => s < 60).map(([t]) => (
                                            <p key={t} className="text-sm text-orange-600 dark:text-orange-300">❌ {t}</p>
                                        ))}
                                    </div>
                                )}
                                <button onClick={onClose} className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:scale-105 transition-all">
                                    {passed ? "View Detailed Report →" : "Review & Retry"}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-8">
                                {q?.topic && (
                                    <span className="inline-block px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-[10px] font-black rounded-full uppercase tracking-wider mb-4">
                                        {q.topic}
                                    </span>
                                )}
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 leading-relaxed">{q?.question}</h3>
                                <div className="grid gap-3">
                                    {q?.options.map((opt, i) => {
                                        const isCorrect = showingAnswer && i === q.correct_index;
                                        const isWrong = showingAnswer && selected === i && i !== q.correct_index;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleSelect(i)}
                                                disabled={showingAnswer}
                                                className={`text-left p-4 rounded-2xl border-2 font-medium text-sm transition-all
                                                    ${isCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" :
                                                        isWrong ? "border-red-400 bg-red-50 dark:bg-red-900/20" :
                                                            selected === i ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20" :
                                                                "border-zinc-200 dark:border-zinc-700 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10"}`}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
