export interface SkillGap {
    fully_covered: string[];
    partially_covered: string[];
    missing: string[];
}

export interface Recommendation {
    domain: string;
    interest_score: number;
    readiness_score: number;
    final_score: number;
    skill_gap: SkillGap;
}

export interface Resource {
    title: string;
    type: 'video' | 'playlist' | 'article' | 'book';
    url: string;
}

export interface Project {
    title: string;
    description: string;
    requirements?: string[];
    expected_output?: string;
}

export interface MajorProject extends Project {
    skills_tested?: string[];
}

export interface WeeklyPlan {
    week: number;
    topic: string;
    skillsCovered: string[];
    deliverable: string;
    learning_resources: Resource[];
    mini_project?: Project;
}

export interface Phase {
    phaseName: string;
    weeklyPlan: WeeklyPlan[];
}

export interface Roadmap {
    domain: string;
    totalDurationWeeks: number;
    weeklyHours: number;
    phases: Phase[];
    google_sheet_url: string;
    missing_skills: string[];
    major_projects?: MajorProject[];
}

export interface UserOnboarding {
    domain: string;
    skills: string[];
    goals: string;
    knowledge: string;
    weekly_hours: number;
    duration_weeks: number;
    currentStage?: string;
    maxUnlockedStage?: number;
    selectedDomain?: string;
}

// ─── Quiz Types ────────────────────────────────────────────────────────────

export interface MCQQuestion {
    question: string;
    options: string[];          // ["A. ...", "B. ...", "C. ...", "D. ..."]
    correct_index: number;      // 0-3
    explanation: string;
    type?: 'conceptual' | 'practical' | 'tricky';
    topic?: string;
}

export interface QuizResult {
    score: number;              // 0-100
    total_questions: number;
    correct_answers: number;
    passed: boolean;
}

export interface TopicScore {
    topic: string;
    score: number;              // 0-100
    status: 'strong' | 'review' | 'weak';
}

export interface WeeklyTestResult extends QuizResult {
    week_key: string;
    topic_scores: TopicScore[];
}

export interface AlternativeVideo {
    title: string;
    channel: string;
    url: string;
    thumbnail: string;
    duration: string;
    label: 'Short Crash Course' | 'In-Depth Guide' | 'Project-Based';
}
