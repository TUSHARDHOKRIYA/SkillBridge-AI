"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";

export const OnboardingForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        skills: [] as string[],
        interests: [] as string[],
        goals: "",
        currentLevel: "beginner",
        weekly_hours: 5,
        duration_weeks: 12,
    });
    const [skillInput, setSkillInput] = useState("");
    const [interestInput, setInterestInput] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const addSkill = () => {
        if (skillInput && !formData.skills.includes(skillInput)) {
            setFormData({ ...formData, skills: [...formData.skills, skillInput] });
            setSkillInput("");
        }
    };

    const addInterest = () => {
        if (interestInput && !formData.interests.includes(interestInput)) {
            setFormData({ ...formData, interests: [...formData.interests, interestInput] });
            setInterestInput("");
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = await user?.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push("/recommendation");
            } else {
                console.error("Failed to save onboarding data");
            }
        } catch (error) {
            console.error("Error saving onboarding data", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= i
                                    ? "bg-blue-600 text-white"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                                    }`}
                            >
                                {i}
                            </div>
                            <div className={`h-1 w-full mt-2 ${step > i ? "bg-blue-600" : "bg-zinc-100 dark:bg-zinc-800"}`} />
                        </div>
                    ))}
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {step === 1 && "What are your skills?"}
                    {step === 2 && "What are you interested in?"}
                    {step === 3 && "What are your goals?"}
                    {step === 4 && "Commitment & Duration"}
                </h2>
                <p className="text-sm text-zinc-500 mt-2">
                    {step === 1 && "Tell us what you already know so we can skip the basics."}
                    {step === 2 && "This helps our AI recommend the most relevant domains for you."}
                    {step === 3 && "Where do you see yourself in the next few years?"}
                    {step === 4 && "Be realistic about your time to ensure a sustainable learning pace."}
                </p>
            </div>

            {step === 1 && (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            className="flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Python, React, Design"
                            onKeyPress={(e) => e.key === "Enter" && addSkill()}
                        />
                        <button
                            onClick={addSkill}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {formData.skills.map((skill) => (
                            <span
                                key={skill}
                                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-2"
                            >
                                {skill}
                                <button onClick={() => setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) })} className="hover:text-red-500">×</button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={interestInput}
                            onChange={(e) => setInterestInput(e.target.value)}
                            className="flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. AI, Web Dev, Finance"
                            onKeyPress={(e) => e.key === "Enter" && addInterest()}
                        />
                        <button
                            onClick={addInterest}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {formData.interests.map((interest) => (
                            <span
                                key={interest}
                                className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm flex items-center gap-2"
                            >
                                {interest}
                                <button onClick={() => setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) })} className="hover:text-red-500">×</button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4">
                    <div className="relative">
                        <textarea
                            value={formData.goals}
                            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                            className="w-full h-32 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Tell us about your career goals..."
                        />
                        <div className="absolute top-2 right-2 group">
                            <span className="cursor-help text-zinc-400">ⓘ</span>
                            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                Why we ask: This helps the AI understand the &quot;Why&quot; behind your journey to provide more motivating milestones.
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Current Experience Level
                        </label>
                        <select
                            value={formData.currentLevel}
                            onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                            className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="beginner">Beginner (Little to no experience)</option>
                            <option value="intermediate">Intermediate (Some projects/coursework)</option>
                            <option value="advanced">Advanced (Professional/Deep expertise)</option>
                        </select>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-6">
                    <div className="relative">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            How many hours per week can you study?
                        </label>
                        <input
                            type="number"
                            value={formData.weekly_hours}
                            onChange={(e) => setFormData({ ...formData, weekly_hours: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            min="1"
                            max="168"
                        />
                        <p className="text-[10px] text-zinc-500 mt-1">
                            {formData.weekly_hours < 5 && "💡 Tip: 5+ hours is recommended for steady progress."}
                            {formData.weekly_hours > 40 && "⚠️ Warning: 40+ hours might lead to burnout."}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            What is the total duration of your roadmap (in weeks)?
                        </label>
                        <input
                            type="number"
                            value={formData.duration_weeks}
                            onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            min="1"
                            max="52"
                        />
                        <p className="text-[10px] text-zinc-500 mt-1">
                            Typical semesters are 12-16 weeks.
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-10 flex justify-between items-center">
                {step > 1 ? (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="px-6 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 font-medium transition-colors"
                    >
                        Back
                    </button>
                ) : (
                    <div />
                )}

                {step < 4 ? (
                    <button
                        onClick={() => setStep(step + 1)}
                        disabled={(step === 2 && formData.interests.length === 0)}
                        className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading || formData.weekly_hours <= 0 || formData.duration_weeks <= 0}
                        className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {loading ? "Generating Your Profile..." : "Complete Onboarding"}
                    </button>
                )}
            </div>
        </div>
    );
};
