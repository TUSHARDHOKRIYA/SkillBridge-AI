"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Roadmap, Phase, Resource, MCQQuestion, Project, MajorProject } from "@/types";
import { VideoQuiz } from "@/components/quiz/VideoQuiz";
import { AlternativeVideos } from "@/components/quiz/AlternativeVideos";
import { WeeklyMegaTest } from "@/components/quiz/WeeklyMegaTest";
import { PerformancePanel } from "@/components/quiz/PerformancePanel";
import { ProjectEvalModal } from "@/components/dashboard/sections/ProjectEvalModal";

interface RoadmapSectionProps {
    onComplete: () => void;
    onNext: () => void;
    roadmapData: Roadmap | null;
}

// ─── Video Resource Card ──────────────────────────────────────────────────────

function VideoCard({
    res, topic, skills, weekKey, weekNumber, onWatched
}: {
    res: Resource;
    topic: string;
    skills: string[];
    weekKey: string;
    weekNumber: number;
    onWatched: () => void;
}) {
    const [watched, setWatched] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizPassed, setQuizPassed] = useState(false);
    const isVideo = res.type === "video" || res.type === "playlist";

    // stable video id derived from URL for Firestore
    const videoId = `${weekKey}_${res.title.toLowerCase().replace(/\s+/g, "_").slice(0, 30)}`;

    const markDone = () => {
        if (!watched) {
            setWatched(true);
            onWatched();
        }
    };

    return (
        <>
            <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group/res
                ${watched
                    ? "border-green-400/50 bg-green-50/50 dark:bg-green-900/10"
                    : "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-blue-400 hover:bg-white dark:hover:bg-zinc-800"
                }`}
            >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="text-2xl">{res.type === "playlist" ? "📑" : isVideo ? "📺" : "📖"}</span>
                    <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover/res:text-blue-600 truncate max-w-[200px] hover:underline"
                    >
                        {res.title}
                    </a>
                    {watched && <span className="text-xs font-bold text-green-600 flex-shrink-0">✅ Done</span>}
                    {quizPassed && <span className="text-xs font-bold text-blue-600 flex-shrink-0">🎯 +Quiz</span>}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Alternative videos — only for video resources */}
                    {isVideo && (
                        <AlternativeVideos topic={topic} currentUrl={res.url} />
                    )}

                    {/* Mark as watched */}
                    {!watched && (
                        <button
                            onClick={markDone}
                            className="px-3 py-1.5 text-xs font-bold border border-zinc-300 dark:border-zinc-600 hover:border-green-500 hover:text-green-600 rounded-xl transition-all"
                        >
                            Mark Done
                        </button>
                    )}

                    {/* Take quiz — only after watching, only for videos */}
                    {watched && isVideo && !quizPassed && (
                        <button
                            onClick={() => setShowQuiz(true)}
                            className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all animate-pulse"
                        >
                            Take Quiz 🧠
                        </button>
                    )}
                </div>
            </div>

            {/* Video Quiz Modal */}
            {showQuiz && (
                <VideoQuiz
                    videoTitle={res.title}
                    topic={topic}
                    skills={skills}
                    weekKey={weekKey}
                    videoId={videoId}
                    onClose={() => setShowQuiz(false)}
                    onPassed={() => {
                        setQuizPassed(true);
                        setShowQuiz(false);
                    }}
                />
            )}
        </>
    );
}

// ─── Week Card ────────────────────────────────────────────────────────────────

function WeekCard({
    week, weekKey, pIndex, wIndex, locked, onWeekPassed
}: {
    week: any;
    weekKey: string;
    pIndex: number;
    wIndex: number;
    locked: boolean;
    onWeekPassed: (weekKey: string) => void;
}) {
    const [watchedCount, setWatchedCount] = useState(0);
    const videoResources = (week.learning_resources || []).filter((r: Resource) => r.type === "video" || r.type === "playlist");
    const allWatched = videoResources.length > 0 && watchedCount >= videoResources.length;

    const [showMegaTest, setShowMegaTest] = useState(false);
    const [showPerformance, setShowPerformance] = useState(false);
    const [testScore, setTestScore] = useState(0);
    const [testPassed, setTestPassed] = useState(false);
    const [topicScores, setTopicScores] = useState<Record<string, number>>({});
    const [weekCompleted, setWeekCompleted] = useState(false);

    // Store full test data for detailed report
    const [testQuestions, setTestQuestions] = useState<MCQQuestion[]>([]);
    const [testAnswers, setTestAnswers] = useState<number[]>([]);
    const [testTimeTaken, setTestTimeTaken] = useState(0);

    // Mini project state
    const [showProjectEval, setShowProjectEval] = useState(false);
    const [projectSubmitted, setProjectSubmitted] = useState(false);
    const [projectScore, setProjectScore] = useState(0);

    const weekTopics = [week.topic, ...(week.skillsCovered || [])].filter(Boolean).slice(0, 6);

    const handleWatched = useCallback(() => {
        setWatchedCount(c => c + 1);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="group relative"
        >
            {/* Connector dot */}
            <div className="absolute -left-[32px] top-10 w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 border-4 border-zinc-50 dark:border-black group-hover:bg-blue-600 transition-colors hidden md:block" />

            <div className={`bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-sm border transition-all duration-500
                ${weekCompleted
                    ? "border-green-400/50 shadow-green-100 dark:shadow-none"
                    : locked
                        ? "border-zinc-200/50 dark:border-zinc-800/50 opacity-60"
                        : "border-zinc-200 dark:border-zinc-800 hover:shadow-2xl hover:border-blue-500/30"
                }`}
            >
                {/* Week header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
                    <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Week {week.week}</p>
                        <h3 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{week.topic}</h3>
                        {weekCompleted && (
                            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">
                                ✅ Week Complete
                            </span>
                        )}
                        {locked && (
                            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-full text-xs font-bold">
                                🔒 Complete previous week first
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(week.skillsCovered || []).map((skill: string) => (
                            <span key={skill} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black rounded-full uppercase tracking-wider border border-zinc-200 dark:border-zinc-700">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                    {/* Deliverable */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Weekly Deliverable</h4>
                        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">{week.deliverable}</p>
                        </div>
                    </div>

                    {/* Resources */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Learning Resources</h4>
                        <div className="grid gap-3">
                            {(week.learning_resources || []).map((res: Resource, rIndex: number) => (
                                <VideoCard
                                    key={rIndex}
                                    res={res}
                                    topic={week.topic}
                                    skills={week.skillsCovered || []}
                                    weekKey={weekKey}
                                    weekNumber={week.week}
                                    onWatched={handleWatched}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mini Project Section */}
                {!locked && week.mini_project && (
                    <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                        <h4 className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-3">📋 Weekly Mini Project</h4>
                        <div className={`p-5 rounded-2xl border-2 transition-all ${projectSubmitted
                            ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10"
                            : "border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10"
                            }`}>
                            <h5 className="text-sm font-black text-zinc-900 dark:text-white mb-1">{week.mini_project.title}</h5>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">{week.mini_project.description}</p>
                            {week.mini_project.requirements && week.mini_project.requirements.length > 0 && (
                                <ul className="space-y-1 mb-3">
                                    {week.mini_project.requirements.map((r: string, ri: number) => (
                                        <li key={ri} className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5">
                                            <span className="text-violet-500">•</span> {r}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="flex items-center gap-3">
                                {!projectSubmitted ? (
                                    <button
                                        onClick={() => setShowProjectEval(true)}
                                        className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-xs font-black hover:scale-105 transition-all shadow-md"
                                    >
                                        Submit Project 🚀
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-green-600">✅ Submitted — Score: {projectScore}%</span>
                                        <button onClick={() => setShowProjectEval(true)} className="text-xs font-bold text-blue-600 hover:underline">View Report</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Week progress + Mega Test trigger */}
                {!locked && videoResources.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-zinc-500">
                                Videos watched: {Math.min(watchedCount, videoResources.length)}/{videoResources.length}
                            </p>
                            {weekCompleted && testScore > 0 && (
                                <button
                                    onClick={() => setShowPerformance(true)}
                                    className="text-xs font-bold text-blue-600 hover:underline"
                                >
                                    View Detailed Report →
                                </button>
                            )}
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 mb-4">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((watchedCount / videoResources.length) * 100, 100)}%` }}
                            />
                        </div>

                        {/* Start Week Test button */}
                        {allWatched && !weekCompleted && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => setShowMegaTest(true)}
                                className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-violet-500/30"
                            >
                                🎯 Start Week {week.week} Mega Test — Unlock Next Week
                            </motion.button>
                        )}

                        {weekCompleted && testPassed && (
                            <div className="flex items-center justify-center gap-2 py-3 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                                <span>🏆</span>
                                <span className="text-sm font-bold text-green-700 dark:text-green-400">Week {week.week} passed with {testScore}%</span>
                            </div>
                        )}
                        {weekCompleted && !testPassed && (
                            <div className="flex items-center justify-between py-3 px-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                                <span className="text-sm font-bold text-orange-700 dark:text-orange-400">⚠️ Review needed ({testScore}%) — Next week locked until ≥60%</span>
                                <button onClick={() => { setWeekCompleted(false); setShowMegaTest(true); }} className="text-xs font-bold text-blue-600 hover:underline">Retry</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Weekly Mega Test Modal */}
            {showMegaTest && (
                <WeeklyMegaTest
                    weekNumber={week.week}
                    weekKey={weekKey}
                    weekTopics={weekTopics}
                    onClose={() => setShowMegaTest(false)}
                    onComplete={(score, passed, tScores, questions, userAnswers, timeTaken) => {
                        setTestScore(score);
                        setTestPassed(passed);
                        setTopicScores(tScores);
                        setTestQuestions(questions);
                        setTestAnswers(userAnswers);
                        setTestTimeTaken(timeTaken);
                        setWeekCompleted(true);
                        setShowMegaTest(false);
                        setShowPerformance(true);
                        if (passed) {
                            onWeekPassed(weekKey);
                        }
                    }}
                />
            )}

            {/* Performance Panel (Detailed Report) */}
            {showPerformance && (
                <PerformancePanel
                    weekNumber={week.week}
                    totalScore={testScore}
                    topicScores={topicScores}
                    questions={testQuestions}
                    userAnswers={testAnswers}
                    timeTaken={testTimeTaken}
                    onClose={() => setShowPerformance(false)}
                    onRetryWeek={() => {
                        setShowPerformance(false);
                        setWeekCompleted(false);
                        setShowMegaTest(true);
                    }}
                />
            )}

            {/* Mini Project Eval Modal */}
            {showProjectEval && week.mini_project && (
                <ProjectEvalModal
                    project={week.mini_project}
                    weekNumber={week.week}
                    onClose={() => setShowProjectEval(false)}
                    onEvaluated={(score, passed) => {
                        setProjectSubmitted(true);
                        setProjectScore(score);
                    }}
                />
            )}
        </motion.div>
    );
}

// ─── Major Projects Section ──────────────────────────────────────────────────

function MajorProjectCard({ project, index }: { project: MajorProject; index: number }) {
    const [showEval, setShowEval] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`p-8 rounded-[2rem] border-2 transition-all ${submitted
                    ? "border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-900/10"
                    : "border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10"
                    }`}
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            Major Project {index + 1}
                        </span>
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mt-3 tracking-tight">{project.title}</h3>
                    </div>
                    <span className="text-4xl">{index === 0 ? "🏗️" : "🚀"}</span>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">{project.description}</p>

                {project.requirements && project.requirements.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Requirements</h4>
                        <ul className="grid gap-2">
                            {project.requirements.map((r, ri) => (
                                <li key={ri} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-start gap-2 bg-white/60 dark:bg-zinc-800/50 p-3 rounded-xl">
                                    <span className="text-purple-500 font-bold">{ri + 1}.</span> {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {project.expected_output && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/15 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Expected Output</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{project.expected_output}</p>
                    </div>
                )}

                {project.skills_tested && project.skills_tested.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {project.skills_tested.map(s => (
                            <span key={s} className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase rounded-full tracking-wider">
                                {s}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {!submitted ? (
                        <button
                            onClick={() => setShowEval(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black text-sm hover:scale-105 transition-all shadow-lg shadow-purple-500/30"
                        >
                            Submit Project for Evaluation 🚀
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-green-600">✅ Evaluated — Score: {score}%</span>
                            <button onClick={() => setShowEval(true)} className="text-sm font-bold text-blue-600 hover:underline">View Full Report</button>
                        </div>
                    )}
                </div>
            </motion.div>

            {showEval && (
                <ProjectEvalModal
                    project={project}
                    onClose={() => setShowEval(false)}
                    onEvaluated={(s, passed) => {
                        setSubmitted(true);
                        setScore(s);
                    }}
                />
            )}
        </>
    );
}

function MajorProjectsSection({ projects }: { projects: MajorProject[] }) {
    return (
        <div className="mt-24 pt-12 border-t-2 border-dashed border-purple-200 dark:border-purple-800">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
            >
                <span className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    🏆 Capstone
                </span>
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white mt-4 tracking-tight">
                    Major Projects
                </h2>
                <p className="text-zinc-500 font-medium mt-2 max-w-lg mx-auto">
                    Put everything you&apos;ve learned together. These comprehensive projects test all your skills.
                </p>
            </motion.div>

            <div className="grid gap-8">
                {projects.map((project, i) => (
                    <MajorProjectCard key={i} project={project} index={i} />
                ))}
            </div>
        </div>
    );
}

// ─── Main Roadmap Section ─────────────────────────────────────────────────────

export const RoadmapSection = ({ onComplete, onNext, roadmapData }: RoadmapSectionProps) => {
    const handleNext = onNext || onComplete;

    // Track which weeks have been passed (score ≥ 60%)
    const [passedWeeks, setPassedWeeks] = useState<Set<string>>(new Set());

    const handleWeekPassed = useCallback((weekKey: string) => {
        setPassedWeeks(prev => new Set(prev).add(weekKey));
    }, []);

    // Build a flat list of all week keys in order to determine locking
    const allWeekKeys: string[] = [];
    if (roadmapData?.phases) {
        for (const phase of roadmapData.phases) {
            for (const week of (phase.weeklyPlan || [])) {
                allWeekKeys.push(`week_${week.week}`);
            }
        }
    }

    if (!roadmapData) {
        return (
            <div className="space-y-8 max-w-4xl mx-auto">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/20">Active Path</span>
                        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                            {roadmapData?.domain || "Your Career Roadmap"}
                        </h1>
                    </div>
                    <p className="text-zinc-500 font-medium flex items-center gap-6">
                        <span className="flex items-center gap-2">📅 <span className="text-zinc-900 dark:text-white font-bold">{roadmapData?.totalDurationWeeks} Weeks</span></span>
                        <span className="flex items-center gap-2">⏳ <span className="text-zinc-900 dark:text-white font-bold">{roadmapData?.weeklyHours}h/Week</span></span>
                        <span className="text-blue-600 font-bold">🎯 Industry Ready</span>
                    </p>
                </div>
                <button
                    onClick={handleNext}
                    className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                    Proceed to Interview Prep →
                </button>
            </header>

            <div className="space-y-24 relative">
                {/* Vertical line */}
                <div className="absolute left-[20px] top-10 bottom-10 w-0.5 bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

                {(roadmapData?.phases || []).map((phase: Phase, pIndex: number) => (
                    <div key={pIndex} className="relative">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4 mb-12"
                        >
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black z-10 shadow-xl shadow-blue-500/30">
                                {pIndex + 1}
                            </div>
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                                {phase.phaseName}
                            </h2>
                        </motion.div>

                        <div className="space-y-12 ml-4 md:ml-12">
                            {(phase.weeklyPlan || []).map((week, wIndex) => {
                                const weekKey = `week_${week.week}`;
                                // Determine if this week is locked:
                                // First week is always unlocked; subsequent weeks require previous week to be passed
                                const weekIdx = allWeekKeys.indexOf(weekKey);
                                const prevWeekKey = weekIdx > 0 ? allWeekKeys[weekIdx - 1] : null;
                                const locked = prevWeekKey ? !passedWeeks.has(prevWeekKey) : false;

                                return (
                                    <WeekCard
                                        key={wIndex}
                                        week={week}
                                        weekKey={weekKey}
                                        pIndex={pIndex}
                                        wIndex={wIndex}
                                        locked={locked}
                                        onWeekPassed={handleWeekPassed}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── Major Projects Section ─────────────────────────────── */}
            {roadmapData.major_projects && roadmapData.major_projects.length > 0 && (
                <MajorProjectsSection projects={roadmapData.major_projects} />
            )}
        </div>
    );
};
