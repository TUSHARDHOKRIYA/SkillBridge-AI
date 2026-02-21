"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/features/auth/AuthContext";
import { Sidebar, DashboardStage } from "@/components/dashboard/Sidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { apiPost, apiGet } from "@/lib/api";

// Import existing sections
import { InputsSection } from "@/components/dashboard/sections/InputsSection";
import { RecommendationSection } from "@/components/dashboard/sections/RecommendationSection";
import { RoadmapSection } from "@/components/dashboard/sections/RoadmapSection";
import { InterviewSection } from "@/components/dashboard/sections/InterviewSection";
import { ExportSection } from "@/components/dashboard/sections/ExportSection";
import { StudentDashboard } from "@/components/dashboard/sections/StudentDashboard";

// --- Types ---
export interface PipelineData {
    inputs: {
        domain: string;
        skills: string[];
        goals: string;
        knowledge: string;
        weekly_hours: number;
        duration_weeks: number;
    };
    roadmap: any | null;
    exportUrl: string | null;
}

const INITIAL_DATA: PipelineData = {
    inputs: {
        domain: "",
        skills: [],
        goals: "",
        knowledge: "",
        weekly_hours: 10,
        duration_weeks: 16,
    },
    roadmap: null,
    exportUrl: null
};

export default function DashboardPage() {
    // 1. Core State
    const [currentStage, setCurrentStage] = useState<DashboardStage>("profile");
    const [maxUnlockedStage, setMaxUnlockedStage] = useState(1);
    const [data, setData] = useState<PipelineData>(INITIAL_DATA);
    const [isLoading, setIsLoading] = useState(false);

    // 2. Navigation Helper
    const advanceStage = (nextStage: DashboardStage) => {
        const stageOrder: DashboardStage[] = ["profile", "inputs", "recommendation", "roadmap", "interview", "export"];
        const nextIndex = stageOrder.indexOf(nextStage);

        if (nextIndex > maxUnlockedStage) {
            setMaxUnlockedStage(nextIndex);
        }
        setCurrentStage(nextStage);
    };

    // 2.5 Retrieve Persisted Roadmap
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                // If user has a saved roadmap, fetch it.
                const result = await apiGet(`/roadmap/me`);
                if (result && result.roadmap) {
                    setData(prev => ({
                        ...prev,
                        inputs: {
                            domain: result.domain || prev.inputs.domain,
                            skills: result.skills || prev.inputs.skills,
                            goals: result.career_goal || prev.inputs.goals,
                            knowledge: "",
                            weekly_hours: result.weekly_hours || 10,
                            duration_weeks: result.duration_weeks || 16,
                        },
                        roadmap: result.roadmap,
                        exportUrl: result.google_sheet_url || prev.exportUrl
                    }));
                    // Automatically unlock up to the roadmap/export stage since they clearly generated it already
                    setMaxUnlockedStage(5);
                }
            } catch (err) {
                // 404 means no roadmap yet, completely fine.
                console.log("[Dashboard] No persisted roadmap found. User will start fresh.");
            }
        };

        if (user && !authLoading) {
            fetchRoadmap();
        }
    }, [user, authLoading]);

    // 3. Stage Handlers

    // Stage 1: Profile Setup -> AI Recommendation
    const handleInputsComplete = (inputs: any) => {
        setData(prev => ({
            ...prev,
            inputs: {
                domain: inputs.domain,
                skills: inputs.skills,
                goals: inputs.goals,
                knowledge: inputs.knowledge,
                weekly_hours: inputs.weekly_hours,
                duration_weeks: inputs.duration_weeks
            }
        }));
        advanceStage("recommendation");
    };

    // Stage 2: AI Recommendation -> Roadmap (REAL API CALL)
    const handleRecommendationComplete = async (recommendedDomain: string) => {
        setIsLoading(true);
        // Use the AI recommended domain instead of the typed one
        const finalInputs = {
            ...data.inputs,
            domain: recommendedDomain
        };

        setData(prev => ({
            ...prev,
            inputs: finalInputs
        }));

        try {
            // Call Backend with auth token
            const result = await apiPost(`/roadmap/generate`, {
                domain: finalInputs.domain,
                skills: finalInputs.skills,
                career_goal: finalInputs.goals,
                knowledge_description: finalInputs.knowledge,
                weekly_hours: finalInputs.weekly_hours,
                duration_weeks: finalInputs.duration_weeks
            });

            console.log("RAW BACKEND ROADMAP RESULT:", JSON.stringify(result.roadmap, null, 2));

            setData(prev => ({
                ...prev,
                roadmap: result.roadmap,
                exportUrl: result.google_sheet_url && result.google_sheet_url.startsWith("http")
                    ? result.google_sheet_url
                    : null
            }));

            setIsLoading(false);
            advanceStage("roadmap");

        } catch (error) {
            console.error("Roadmap generation error:", error);
            alert("Roadmap generation failed. Please try again or check console for details.");
            setIsLoading(false);
        }
    };

    // Stage 3: Roadmap Review -> Interview
    const handleRoadmapConfirm = () => {
        advanceStage("interview");
    };

    // Stage 3: Interview Prep -> Export
    const handleInterviewComplete = () => {
        advanceStage("export");
    };

    // Stage 4: Export Generator
    const handleExport = async () => {
        if (!data.exportUrl) {
            if (!data.roadmap) {
                alert("Please fill out your profile setup first to generate a roadmap. The Google Sheets export will be created automatically during roadmap generation.");
            } else {
                alert("Google Sheets export failed during roadmap generation. The roadmap is available in the app, but the sheet couldn't be created. Please check your log.");
            }
        }
    };

    // 4. Render Content Switcher
    const renderStageContent = () => {
        switch (currentStage) {
            case "profile":
                return <StudentDashboard />;
            case "inputs":
                return (
                    <InputsSection
                        initialData={null}
                        onComplete={handleInputsComplete}
                        isLoading={isLoading}
                    />
                );
            case "recommendation":
                return (
                    <RecommendationSection
                        onComplete={handleRecommendationComplete}
                        onBack={() => setCurrentStage("inputs")}
                        inputs={data.inputs}
                        isGenerating={isLoading}
                    />
                );
            case "roadmap":
                return (
                    <RoadmapSection
                        onComplete={handleRoadmapConfirm}
                        onNext={handleRoadmapConfirm}
                        roadmapData={data.roadmap}
                    />
                );
            case "interview":
                return (
                    <InterviewSection
                        domain={data.inputs.domain}
                        skills={data.inputs.skills}
                        onComplete={handleInterviewComplete}
                    />
                );
            case "export":
                return (
                    <ExportSection
                        exportUrl={data.exportUrl}
                        onExport={handleExport}
                        isLoading={isLoading}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
                {/* Fixed Sidebar */}
                <Sidebar
                    currentStage={currentStage}
                    maxUnlockedStage={maxUnlockedStage}
                    onStageChange={setCurrentStage}
                />

                {/* Main Scrollable Content Area */}
                <DashboardContent currentStage={currentStage}>
                    {renderStageContent()}
                </DashboardContent>
            </div>
        </ProtectedRoute>
    );
}
