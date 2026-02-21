"""
Quiz routes: generate video quiz, weekly mega test, submit results.
Uses Google Gemini Flash for MCQ generation.
"""
import os
import json
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
from google import genai
from datetime import datetime, timezone

from ai.api.firebase_helper import get_uid_from_header, get_db

router = APIRouter(prefix="/quiz", tags=["Quiz"])

GEMINI_MODEL = "gemini-2.5-flash"

def get_gemini_client():
    return genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))


# ─── Schemas ─────────────────────────────────────────────────────────────────

class VideoQuizRequest(BaseModel):
    video_title: str
    topic: str
    skills_covered: List[str] = []

class WeeklyTestRequest(BaseModel):
    week_number: int
    week_topics: List[str]   # e.g. ["React Hooks", "State Management", "API Calls"]

class QuizSubmitRequest(BaseModel):
    quiz_type: str            # "video" or "weekly"
    week_key: str             # e.g. "week_1"
    video_id: Optional[str] = None
    score: int                # 0-100
    total_questions: int
    correct_answers: int
    topic_scores: dict = {}   # {"topic": score_percent}
    passed: bool


# ─── Helpers ─────────────────────────────────────────────────────────────────

def parse_gemini_json(text: str) -> list:
    """Extract JSON from Gemini response, stripping markdown fences."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1])
    return json.loads(text)


def generate_mcqs(prompt: str, num_questions: int) -> list:
    """Call Gemini Flash and return parsed MCQ list."""
    client = get_gemini_client()
    response = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
    questions = parse_gemini_json(response.text)
    return questions[:num_questions]


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/generate-video-quiz")
async def generate_video_quiz(request: VideoQuizRequest):
    """
    Generate 5 MCQs for a video resource using Gemini Flash.
    Mix: 2 conceptual + 2 practical + 1 tricky edge case.
    """
    skills_str = ", ".join(request.skills_covered) if request.skills_covered else request.topic

    prompt = f"""You are a friendly learning assistant for engineering students.
Generate exactly 5 multiple choice questions about this video:
- Video title: "{request.video_title}"
- Topic area: "{request.topic}"
- Skills involved: {skills_str}

Question mix (MUST follow this):
- Questions 1-2: Conceptual understanding (What is / Why does)
- Questions 3-4: Practical application (How would you / Which code does)
- Question 5: Tricky edge case (What happens when / Why might this fail)

Rules:
- Keep language friendly, NOT exam-like. Use "Hmm, think about this..." style
- 4 options each (A, B, C, D)
- Only one correct answer per question
- Provide a short friendly explanation for the correct answer

Return ONLY a valid JSON array (no markdown):
[
  {{
    "question": "...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correct_index": 0,
    "explanation": "...",
    "type": "conceptual"
  }}
]"""

    try:
        questions = generate_mcqs(prompt, 5)
        return {"questions": questions, "total": len(questions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")


@router.post("/generate-weekly-test")
async def generate_weekly_test(request: WeeklyTestRequest):
    """
    Generate 15-20 comprehensive MCQs covering all topics of the week.
    """
    topics_str = "\n".join(f"- {t}" for t in request.week_topics)
    num_questions = min(max(len(request.week_topics) * 3, 15), 20)

    prompt = f"""You are generating a comprehensive weekly review test for engineering students.
Week {request.week_number} covered these topics:
{topics_str}

Generate exactly {num_questions} multiple choice questions that cover ALL the topics above.
Distribute questions roughly evenly across topics.

Rules:
- Mix conceptual, practical, and edge case questions
- 4 options each (A, B, C, D), only one correct
- Include which topic each question tests using the "topic" field
- Keep it thorough but not trick-based

Return ONLY a valid JSON array (no markdown):
[
  {{
    "question": "...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correct_index": 0,
    "explanation": "...",
    "topic": "exact topic name from the list above"
  }}
]"""

    try:
        questions = generate_mcqs(prompt, num_questions)
        return {
            "questions": questions,
            "total": len(questions),
            "week_number": request.week_number,
            "pass_threshold": 60
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate weekly test: {str(e)}")


@router.post("/submit-result")
async def submit_quiz_result(
    data: QuizSubmitRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Save quiz or test result to Firestore.
    """
    uid = get_uid_from_header(authorization)
    if not uid:
        return {"status": "not_saved", "message": "No auth token — result not persisted"}

    db = get_db()
    timestamp = datetime.now(timezone.utc).isoformat()
    result_doc = data.dict()
    result_doc["timestamp"] = timestamp
    result_doc["uid"] = uid

    if data.quiz_type == "video":
        # Save under quiz_results/{uid}/video_quizzes/{video_id}
        doc_id = data.video_id or data.week_key
        db.collection("quiz_results").document(uid)\
          .collection("video_quizzes").document(doc_id)\
          .set(result_doc, merge=True)
    else:
        # Save under quiz_results/{uid}/weekly_tests/{week_key}
        db.collection("quiz_results").document(uid)\
          .collection("weekly_tests").document(data.week_key)\
          .set(result_doc)

        # Update video_progress to mark week as completed if passed
        if data.passed:
            db.collection("video_progress").document(uid)\
              .set({"completed_weeks": {data.week_key: True}}, merge=True)

    return {"status": "saved", "passed": data.passed, "score": data.score}


@router.get("/results/{week_key}")
async def get_week_results(
    week_key: str,
    authorization: Optional[str] = Header(None)
):
    """Get a student's weekly test result from Firestore."""
    uid = get_uid_from_header(authorization)
    if not uid:
        raise HTTPException(status_code=401, detail="Authorization required")

    db = get_db()
    doc = db.collection("quiz_results").document(uid)\
            .collection("weekly_tests").document(week_key).get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="No result found for this week")

    return doc.to_dict()
