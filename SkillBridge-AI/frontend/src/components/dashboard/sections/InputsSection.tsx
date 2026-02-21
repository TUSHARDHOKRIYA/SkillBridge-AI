"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { motion } from "framer-motion";
import { UserOnboarding } from "@/types";
import { apiGet, apiPost } from "@/lib/api";

interface InputsSectionProps {
    onComplete: (data: any) => void;
    initialData?: UserOnboarding | null;
    isLoading?: boolean;
}

export const InputsSection = ({ onComplete, initialData, isLoading = false }: InputsSectionProps) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        domain: "",
        skills: [] as string[],
        goals: "",
        knowledge: "",
        weekly_hours: 10,
        duration_weeks: 16,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                domain: initialData.domain || "",
                skills: initialData.skills || [],
                goals: initialData.goals || "",
                knowledge: initialData.knowledge || "",
                weekly_hours: initialData.weekly_hours || 10,
                duration_weeks: initialData.duration_weeks || 16,
            });
        }
    }, [initialData]);

    // Load saved onboarding data from Firestore on mount
    useEffect(() => {
        const loadSavedData = async () => {
            try {
                const saved = await apiGet("/api/v1/onboarding");
                if (saved) {
                    setFormData({
                        domain: saved.domain || "",
                        skills: saved.skills || [],
                        goals: saved.goals || "",
                        knowledge: saved.knowledge || "",
                        weekly_hours: saved.weekly_hours || 10,
                        duration_weeks: saved.duration_weeks || 16,
                    });
                }
            } catch {
                // 404 means no saved data yet — that's fine, start fresh
            }
        };
        loadSavedData();
    }, []);

    const [skillInput, setSkillInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const { user } = useAuth();

    const addSkill = () => {
        if (skillInput && !formData.skills.includes(skillInput)) {
            setFormData({ ...formData, skills: [...formData.skills, skillInput] });
            setSkillInput("");
        }
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            // Save onboarding data to Firestore via backend
            await apiPost("/api/v1/onboarding", formData);
        } catch (e) {
            console.warn("[Onboarding] Could not save to backend:", e);
        } finally {
            setIsSaving(false);
        }
        onComplete(formData);
    };

    const getWorkloadLabel = (hours: number) => {
        if (hours <= 5) return "Light Check-in";
        if (hours <= 15) return "Steady Part-Time";
        if (hours <= 30) return "Serious Commitment";
        if (hours <= 40) return "Full-Time Job";
        return "⚠️ Burnout Risk";
    };

    return (
        <div className="max-w-3xl mx-auto">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">
                    Profile Setup
                </h1>
                <p className="text-zinc-500 font-medium">
                    Tell us what you want to learn so we can build your personalized roadmap.
                </p>
            </header>

            <div className="bg-white dark:bg-zinc-900 p-10 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800">
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex-1 flex flex-col items-center">
                                <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${step >= i
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                                        }`}
                                >
                                    {i}
                                </div>
                                <div className={`h-1.5 w-full mt-4 rounded-full transition-all duration-700 ${step > i ? "bg-blue-600" : "bg-zinc-100 dark:bg-zinc-800"}`} />
                            </div>
                        ))}
                    </div>
                    <motion.h2
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-bold text-zinc-900 dark:text-white"
                    >
                        {step === 1 && "What do you want to learn?"}
                        {step === 2 && "What are your career goals?"}
                        {step === 3 && "How much do you currently know?"}
                        {step === 4 && "Commitment & Duration"}
                    </motion.h2>
                    <p className="text-sm text-zinc-500 mt-2">
                        {step === 1 && "Specify your target domain and let us know your current technical skills."}
                        {step === 2 && "Where do you see yourself in the near future?"}
                        {step === 3 && "Tell us about your background with these specific skills."}
                        {step === 4 && "Set a realistic weekly schedule for your roadmap."}
                    </p>
                </div>

                <div className="min-h-[200px]">
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">
                                    Target Domain
                                </label>
                                <input
                                    type="text"
                                    value={formData.domain}
                                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                    placeholder="e.g. Full Stack Web Developer, Machine Learning Engineer"
                                />
                            </div>

                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">
                                    Current Skills
                                </label>
                                <div className="flex gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        className="flex-1 px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                        placeholder="e.g. Python, React, SQL"
                                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                                    />
                                    <button
                                        onClick={addSkill}
                                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills.map((skill: string) => (
                                        <motion.span
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            key={skill}
                                            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-bold flex items-center gap-2 border border-blue-100 dark:border-blue-900/30"
                                        >
                                            {skill}
                                            <button onClick={() => setFormData({ ...formData, skills: formData.skills.filter((s: string) => s !== skill) })} className="hover:text-red-500 transition-colors">×</button>
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="relative">
                                <textarea
                                    value={formData.goals}
                                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                                    className="w-full h-40 px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none"
                                    placeholder="Explain your goals... e.g., 'I want to land a Junior Developer role at a top tech company looking for React developers within 6 months.'"
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="relative">
                                <textarea
                                    value={formData.knowledge}
                                    onChange={(e) => setFormData({ ...formData, knowledge: e.target.value })}
                                    className="w-full h-40 px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium resize-none"
                                    placeholder="Describe your current knowledge level... e.g., 'I know basic JavaScript and can build simple pages, but I struggle with complex React hooks and state management.'"
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                            {/* Realistic Weekly Commitment */}
                            <div className="relative">
                                <div className="flex justify-between items-end mb-4">
                                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest">
                                        Weekly Study Commitment
                                    </label>
                                    <div className="text-right">
                                        <span className="text-4xl font-black text-blue-600 tabular-nums">{formData.weekly_hours}</span>
                                        <span className="text-zinc-400 text-sm ml-1 font-bold">hrs</span>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="2"
                                    max="50"
                                    step="1"
                                    value={formData.weekly_hours}
                                    onChange={(e) => setFormData({ ...formData, weekly_hours: parseInt(e.target.value) })}
                                    className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
                                />
                                <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    <span>2h</span>
                                    <span>25h</span>
                                    <span>50h (Max)</span>
                                </div>
                                <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors
                                    ${formData.weekly_hours > 40 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                    {formData.weekly_hours > 40 ? '⚠️' : '💡'} {getWorkloadLabel(formData.weekly_hours)}
                                </div>
                            </div>

                            {/* Realistic Duration (Semesters) */}
                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest">
                                        Roadmap Duration (Weeks)
                                    </label>
                                    <div className="text-right">
                                        <span className="text-4xl font-black text-purple-600 tabular-nums">{formData.duration_weeks}</span>
                                        <span className="text-zinc-400 text-sm ml-1 font-bold">weeks</span>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="4"
                                    max="24"
                                    step="1"
                                    value={formData.duration_weeks}
                                    onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
                                    className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-purple-600 hover:accent-purple-500 transition-all"
                                />
                                <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    <span>4w (Quick)</span>
                                    <span>16w (Semester)</span>
                                    <span>24w (Deep Dive)</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="mt-16 flex justify-between items-center">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-8 py-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-bold transition-colors"
                        >
                            ← Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 4 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={(step === 1 && formData.domain.trim() === "")}
                            className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black transition-all disabled:opacity-50 shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95"
                        >
                            Next Step →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || formData.weekly_hours <= 0 || formData.duration_weeks <= 0}
                            className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black transition-all disabled:opacity-50 shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95"
                        >
                            {isLoading ? "Saving..." : "Generate Roadmap →"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
