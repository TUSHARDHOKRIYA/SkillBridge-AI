"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiPost } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuestionFeedback {
    question: string;
    answer: string;
    feedback: string;
}

interface InterviewResult {
    overall_score: number;
    justification: string;
    feedbacks: QuestionFeedback[];
}

interface InterviewSectionProps {
    domain: string;
    skills: string[];
    onComplete: () => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function InterviewSection({ domain, skills, onComplete }: InterviewSectionProps) {
    // Setup state
    const [step, setStep] = useState<"setup" | "interview" | "analyzing" | "results">("setup");
    const [field, setField] = useState(domain || "");
    const [company, setCompany] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("Mid-level");
    const [numQuestions, setNumQuestions] = useState(5);

    // Interview state
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [answers, setAnswers] = useState<string[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Results state
    const [results, setResults] = useState<InterviewResult | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Expanded feedback state
    const [expandedQ, setExpandedQ] = useState<number | null>(null);

    // Init speech recognition
    useEffect(() => {
        if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
            const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SR();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = "en-US";
            recognitionRef.current.onresult = (event: any) => {
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                setUserAnswer(transcript);
            };
            recognitionRef.current.onerror = () => setIsRecording(false);
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            setUserAnswer("");
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    // ─── Step 1: Start Interview ─────────────────────────────────────────────

    const handleStartInterview = async () => {
        if (!field.trim() || !company.trim()) return;
        setLoading(true);
        setError("");
        try {
            const data = await apiPost<{ questions: string[] }>("/api/v1/ai/interview/generate", {
                field,
                company,
                experience_level: experienceLevel,
                num_questions: numQuestions,
            });
            setQuestions(data.questions || []);
            setAnswers([]);
            setCurrentIndex(0);
            setUserAnswer("");
            setStep("interview");
        } catch (err: any) {
            setError(err.message || "Failed to generate questions.");
        } finally {
            setLoading(false);
        }
    };

    // ─── Step 2: Next / Finish ───────────────────────────────────────────────

    const handleNext = async () => {
        if (!userAnswer.trim()) return;
        const newAnswers = [...answers, userAnswer];
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setUserAnswer("");
            if (isRecording) {
                recognitionRef.current?.stop();
                setIsRecording(false);
            }
        } else {
            // All done — evaluate
            setStep("analyzing");
            if (isRecording) {
                recognitionRef.current?.stop();
                setIsRecording(false);
            }
            try {
                const interviewData = questions.map((q, i) => ({
                    question: q,
                    answer: newAnswers[i],
                }));
                const evalResult = await apiPost<InterviewResult>("/api/v1/ai/interview/evaluate", {
                    interview_data: interviewData,
                    field,
                    company,
                    experience_level: experienceLevel,
                });
                setResults(evalResult);
                setStep("results");
            } catch (err: any) {
                setError(err.message || "Failed to evaluate interview.");
                setStep("interview");
            }
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    const scoreColor = (score: number) =>
        score >= 80 ? "text-green-500" : score >= 60 ? "text-blue-500" : "text-orange-500";

    return (
        <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
                {/* ═══════════ SETUP ═══════════ */}
                {step === "setup" && (
                    <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <header className="mb-10">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-violet-500/20">
                                    Interview Prep
                                </span>
                                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                                    Mock Interview
                                </h1>
                            </div>
                            <p className="text-zinc-500 font-medium">
                                Practice with AI-generated questions tailored to your target role.
                            </p>
                        </header>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left: Features */}
                            <div className="space-y-4">
                                {[
                                    { icon: "⚡", title: "Dynamic Questions", desc: "AI generates role-specific questions for any company." },
                                    { icon: "🎙️", title: "Voice Input", desc: "Speak your answers naturally with speech-to-text." },
                                    { icon: "📊", title: "Performance Analysis", desc: "Get a full score breakdown with per-question feedback." },
                                ].map((f, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                                        <span className="text-2xl">{f.icon}</span>
                                        <div>
                                            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{f.title}</h3>
                                            <p className="text-xs text-zinc-500">{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right: Form */}
                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl">
                                <h2 className="text-lg font-black text-zinc-900 dark:text-white mb-6">Set Up Your Session</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">🎯 Target Field</label>
                                        <input
                                            value={field}
                                            onChange={e => setField(e.target.value)}
                                            placeholder="e.g. Software Engineer, Product Manager"
                                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">🏢 Target Company</label>
                                        <input
                                            value={company}
                                            onChange={e => setCompany(e.target.value)}
                                            placeholder="e.g. Google, IBM, Local Startup"
                                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Experience</label>
                                            <select
                                                value={experienceLevel}
                                                onChange={e => setExperienceLevel(e.target.value)}
                                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                                            >
                                                <option value="Entry-level">Entry-level</option>
                                                <option value="Mid-level">Mid-level</option>
                                                <option value="Senior-level">Senior-level</option>
                                                <option value="Executive">Executive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Questions</label>
                                            <select
                                                value={numQuestions}
                                                onChange={e => setNumQuestions(parseInt(e.target.value))}
                                                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                                            >
                                                <option value={3}>3 Questions</option>
                                                <option value={5}>5 Questions</option>
                                                <option value={7}>7 Questions</option>
                                                <option value={10}>10 Questions</option>
                                            </select>
                                        </div>
                                    </div>

                                    {error && <p className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</p>}

                                    <button
                                        onClick={handleStartInterview}
                                        disabled={!field.trim() || !company.trim() || loading}
                                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Generating Questions...
                                            </span>
                                        ) : (
                                            "Start Interview Session →"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══════════ INTERVIEW ═══════════ */}
                {step === "interview" && questions.length > 0 && (
                    <motion.div key="interview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        {/* Progress */}
                        <div className="mb-8">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-black text-violet-600">Question {currentIndex + 1} of {questions.length}</span>
                                <span className="text-xs font-bold text-zinc-400">{Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete</span>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-violet-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Question card */}
                        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                            <div className="p-6 bg-violet-50 dark:bg-violet-900/20 border-b border-violet-100 dark:border-violet-800">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">💬</span>
                                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white leading-relaxed">
                                        {questions[currentIndex]}
                                    </h2>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <textarea
                                    value={userAnswer}
                                    onChange={e => setUserAnswer(e.target.value)}
                                    placeholder="Share your response here..."
                                    rows={8}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-medium leading-relaxed focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                                />

                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={toggleRecording}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-black border transition-all ${isRecording
                                                ? "bg-red-500 text-white border-red-500 animate-pulse"
                                                : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600 hover:border-violet-500"
                                            }`}
                                    >
                                        {isRecording ? "🔴 Stop Recording" : "🎙️ Voice Input"}
                                    </button>

                                    <button
                                        onClick={handleNext}
                                        disabled={!userAnswer.trim()}
                                        className="px-8 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl font-black text-sm hover:scale-105 transition-all shadow-lg disabled:opacity-50"
                                    >
                                        {currentIndex < questions.length - 1 ? "Next Question →" : "Finish Interview ✓"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Context chips */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            {[
                                { label: "Field", value: field },
                                { label: "Target", value: company },
                                { label: "Level", value: experienceLevel },
                            ].map(c => (
                                <div key={c.label} className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
                                    <span className="block text-sm font-bold text-zinc-900 dark:text-white truncate">{c.value}</span>
                                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">{c.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ═══════════ ANALYZING ═══════════ */}
                {step === "analyzing" && (
                    <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                            <span className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">⚡</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Interview Complete!</h2>
                            <p className="text-zinc-500 font-medium mt-2 max-w-sm">Our AI coach is analyzing your performance and generating detailed feedback...</p>
                        </div>
                    </motion.div>
                )}

                {/* ═══════════ RESULTS ═══════════ */}
                {step === "results" && results && (
                    <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Left column: Score + Summary */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl p-8 text-center">
                                    <span className="text-4xl mb-4 block">🏆</span>
                                    <h2 className="text-lg font-black text-zinc-900 dark:text-white mb-4">Overall Score</h2>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", bounce: 0.5 }}
                                        className={`text-7xl font-black ${scoreColor(results.overall_score)}`}
                                    >
                                        {results.overall_score}
                                        <span className="text-2xl text-zinc-400">/100</span>
                                    </motion.div>
                                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 mt-4 mb-4">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${results.overall_score}%` }}
                                            transition={{ duration: 1 }}
                                            className="bg-gradient-to-r from-violet-600 to-blue-600 h-3 rounded-full"
                                        />
                                    </div>
                                    <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
                                        {results.overall_score >= 80 ? "🌟 Exceptional Candidate!" :
                                            results.overall_score >= 60 ? "💪 Strong Potential" :
                                                "📈 Growth Opportunity"}
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
                                    <h3 className="text-xs font-black text-violet-600 uppercase tracking-widest">Target Summary</h3>
                                    {[
                                        { label: "Role", value: field },
                                        { label: "Company", value: company },
                                        { label: "Experience", value: experienceLevel },
                                    ].map(item => (
                                        <div key={item.label} className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0">
                                            <span className="text-xs text-zinc-500">{item.label}</span>
                                            <span className="text-sm font-bold text-zinc-900 dark:text-white">{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setStep("setup"); setResults(null); setError(""); }}
                                        className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl font-bold text-sm hover:scale-105 transition-all"
                                    >
                                        🔄 Retry
                                    </button>
                                    <button
                                        onClick={onComplete}
                                        className="flex-1 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:scale-105 transition-all"
                                    >
                                        Done →
                                    </button>
                                </div>
                            </div>

                            {/* Right column: Feedback */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Justification */}
                                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl p-6">
                                    <h3 className="text-sm font-black text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                                        📊 Performance Analysis
                                    </h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                        {results.justification}
                                    </p>
                                </div>

                                {/* Per-question feedback */}
                                <div>
                                    <h3 className="text-sm font-black text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                        💬 Question-wise Feedback
                                    </h3>
                                    <div className="space-y-3">
                                        {results.feedbacks.map((item, idx) => {
                                            const isExpanded = expandedQ === idx;
                                            return (
                                                <div key={idx} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                                                    <button
                                                        onClick={() => setExpandedQ(isExpanded ? null : idx)}
                                                        className="w-full p-4 text-left flex items-start gap-3"
                                                    >
                                                        <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-black">
                                                            {idx + 1}
                                                        </div>
                                                        <span className="text-sm font-bold text-zinc-900 dark:text-white flex-1 line-clamp-1">{item.question}</span>
                                                        <span className={`text-zinc-400 text-sm transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                                                    </button>

                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="border-t border-zinc-100 dark:border-zinc-800"
                                                            >
                                                                <div className="p-5 space-y-4">
                                                                    <div>
                                                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                                                                            ✅ Your Answer
                                                                        </span>
                                                                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 italic border border-zinc-200 dark:border-zinc-700">
                                                                            &ldquo;{item.answer}&rdquo;
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest flex items-center gap-1 mb-2">
                                                                            ⭐ Coach&apos;s Feedback
                                                                        </span>
                                                                        <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
                                                                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">{item.feedback}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
