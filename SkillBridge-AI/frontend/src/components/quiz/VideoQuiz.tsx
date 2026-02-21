"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MCQQuestion } from "@/types";
import { generateVideoQuiz, submitQuizResult } from "@/lib/quiz-api";

interface VideoQuizProps {
    videoTitle: string;
    topic: string;
    skills: string[];
    weekKey: string;
    videoId: string;
    onClose: () => void;
    onPassed: () => void;
}

const EMOJI_FEEDBACK = {
    correct: ["🎉 Nailed it!", "✅ Perfect!", "🔥 You got it!", "💡 Exactly right!"],
    wrong: ["🤔 Not quite...", "💭 Think again...", "🧐 Hmm, close but no...", "📚 Almost there!"],
};

const randPick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export function VideoQuiz({ videoTitle, topic, skills, weekKey, videoId, onClose, onPassed }: VideoQuizProps) {
    const [questions, setQuestions] = useState<MCQQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [attemptsLeft, setAttemptsLeft] = useState(2);
    const [showExplanation, setShowExplanation] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await generateVideoQuiz(videoTitle, topic, skills);
                setQuestions(data.questions || []);
            } catch {
                // Fallback mock so quiz still works without API key
                setQuestions([{
                    question: `What is the main purpose of ${topic}?`,
                    options: ["A. Data storage", "B. User interface", "C. Core functionality", "D. Security"],
                    correct_index: 2,
                    explanation: `${topic} primarily handles core functionality in modern applications.`,
                    type: "conceptual"
                }]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [videoTitle, topic, skills]);

    const handleAnswer = (index: number) => {
        if (showExplanation) return;
        setSelectedOption(index);
        const q = questions[currentQ];
        if (index === q.correct_index) {
            setFeedback(randPick(EMOJI_FEEDBACK.correct));
            setCorrectCount(c => c + 1);
            setTimeout(() => {
                setShowExplanation(true);
                setTimeout(() => advance(), 1800);
            }, 600);
        } else {
            setFeedback(randPick(EMOJI_FEEDBACK.wrong));
            const newAttempts = attemptsLeft - 1;
            setAttemptsLeft(newAttempts);
            if (newAttempts <= 0) {
                setTimeout(() => setShowExplanation(true), 500);
            } else {
                setTimeout(() => {
                    setSelectedOption(null);
                    setFeedback("");
                }, 800);
            }
        }
    };

    const advance = () => {
        setSelectedOption(null);
        setShowExplanation(false);
        setAttemptsLeft(2);
        setFeedback("");
        if (currentQ + 1 >= questions.length) {
            completeQuiz();
        } else {
            setCurrentQ(q => q + 1);
        }
    };

    const completeQuiz = async () => {
        setFinished(true);
        const score = Math.round((correctCount / questions.length) * 100);
        const passed = score >= 60;
        setSubmitting(true);
        try {
            await submitQuizResult({
                quiz_type: "video",
                week_key: weekKey,
                video_id: videoId,
                score,
                total_questions: questions.length,
                correct_answers: correctCount,
                passed,
            });
        } catch { /* non-fatal */ }
        setSubmitting(false);
        if (passed) setTimeout(onPassed, 2000);
    };

    const score = finished ? Math.round((correctCount / questions.length) * 100) : 0;
    const passed = score >= 60;

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-600 dark:text-zinc-400 font-medium">Crafting your quiz with AI... ✨</p>
                </div>
            </div>
        );
    }

    const q = questions[currentQ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold opacity-80">Quick Check 🧠</span>
                        <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
                    </div>
                    <p className="text-sm opacity-80 mb-1 truncate">{videoTitle}</p>
                    {/* Progress bar */}
                    <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                        <div
                            className="bg-white rounded-full h-2 transition-all duration-500"
                            style={{ width: `${((currentQ) / questions.length) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs opacity-70 mt-1">{currentQ + 1} of {questions.length}</p>
                </div>

                <AnimatePresence mode="wait">
                    {finished ? (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 text-center"
                        >
                            <div className="text-6xl mb-4">{passed ? "🎉" : "📚"}</div>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">
                                {passed ? "You crushed it!" : "Keep learning!"}
                            </h3>
                            <p className="text-zinc-500 mb-6">
                                {correctCount} out of {questions.length} correct — {score}%
                            </p>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-4 mb-6">
                                <div
                                    className={`h-4 rounded-full transition-all duration-1000 ${passed ? "bg-green-500" : "bg-orange-400"}`}
                                    style={{ width: `${score}%` }}
                                />
                            </div>
                            <p className="text-sm text-zinc-400 mb-6">
                                {passed ? "✅ Video marked as completed! Move to the next one." : "💡 Don't worry — the videos are still unlocked. No pressure!"}
                            </p>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:scale-105 transition-all"
                            >
                                Continue Learning →
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-8">
                            {/* Attempts indicator */}
                            <div className="flex items-center gap-2 mb-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${i < attemptsLeft ? "bg-blue-500" : "bg-zinc-200 dark:bg-zinc-700"}`} />
                                ))}
                                <span className="text-xs text-zinc-400">{attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} left</span>
                                {feedback && <span className="ml-auto text-sm font-bold">{feedback}</span>}
                            </div>

                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 leading-relaxed">{q?.question}</h3>

                            <div className="grid gap-3 mb-6">
                                {q?.options.map((opt, i) => {
                                    const isSelected = selectedOption === i;
                                    const isCorrect = showExplanation && i === q.correct_index;
                                    const isWrong = showExplanation && isSelected && i !== q.correct_index;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleAnswer(i)}
                                            disabled={showExplanation}
                                            className={`text-left p-4 rounded-2xl border-2 font-medium text-sm transition-all
                                                ${isCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" :
                                                    isWrong ? "border-red-400 bg-red-50 dark:bg-red-900/20" :
                                                        isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" :
                                                            "border-zinc-200 dark:border-zinc-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10"}`}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>

                            {showExplanation && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 mb-4">
                                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">💡 {q?.explanation}</p>
                                </motion.div>
                            )}

                            {showExplanation && (
                                <button onClick={advance} className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors">
                                    {currentQ + 1 >= questions.length ? "See Results 🎯" : "Next Question →"}
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
