import { auth } from "@/lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getToken(): Promise<string | null> {
    if (!auth?.currentUser) return null;
    try { return await auth.currentUser.getIdToken(); } catch { return null; }
}

async function buildHeaders(): Promise<HeadersInit> {
    const token = await getToken();
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
}

export async function generateVideoQuiz(videoTitle: string, topic: string, skills: string[]) {
    const res = await fetch(`${API_URL}/quiz/generate-video-quiz`, {
        method: "POST",
        headers: await buildHeaders(),
        body: JSON.stringify({ video_title: videoTitle, topic, skills_covered: skills }),
    });
    if (!res.ok) throw new Error(`Quiz generation failed: ${res.status}`);
    return res.json();
}

export async function generateWeeklyTest(weekNumber: number, weekTopics: string[]) {
    const res = await fetch(`${API_URL}/quiz/generate-weekly-test`, {
        method: "POST",
        headers: await buildHeaders(),
        body: JSON.stringify({ week_number: weekNumber, week_topics: weekTopics }),
    });
    if (!res.ok) throw new Error(`Weekly test generation failed: ${res.status}`);
    return res.json();
}

export async function submitQuizResult(data: {
    quiz_type: "video" | "weekly";
    week_key: string;
    video_id?: string;
    score: number;
    total_questions: number;
    correct_answers: number;
    topic_scores?: Record<string, number>;
    passed: boolean;
}) {
    const res = await fetch(`${API_URL}/quiz/submit-result`, {
        method: "POST",
        headers: await buildHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
    return res.json();
}

export async function getAlternativeVideos(topic: string, currentUrl: string) {
    const params = new URLSearchParams({ topic, current_url: currentUrl });
    const token = await getToken();
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/youtube/alternatives?${params}`, { headers });
    if (!res.ok) throw new Error(`Alternatives fetch failed: ${res.status}`);
    return res.json();
}

export async function getWeekResults(weekKey: string) {
    const res = await fetch(`${API_URL}/quiz/results/${weekKey}`, {
        headers: await buildHeaders(),
    });
    if (!res.ok) throw new Error(`Results fetch failed: ${res.status}`);
    return res.json();
}
