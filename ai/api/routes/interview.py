from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
import logging
from ai.roadmap.gemini_client import generate_roadmap

logger = logging.getLogger(__name__)

router = APIRouter()


# ─── Request/Response Models ──────────────────────────────────────────────────

class InterviewGenerateRequest(BaseModel):
    field: str
    company: str
    experience_level: str = "Mid-level"
    num_questions: int = 5


class QAPair(BaseModel):
    question: str
    answer: str


class InterviewEvaluateRequest(BaseModel):
    interview_data: List[QAPair]
    field: str
    company: str
    experience_level: str


# ─── Generate Interview Questions ─────────────────────────────────────────────

@router.post("/generate")
async def generate_interview_questions(request: InterviewGenerateRequest):
    if not request.field:
        raise HTTPException(status_code=400, detail="Field is required")

    system_prompt = """
    You are an expert interview question generator.
    Generate high-quality interview questions for a candidate.
    The questions should be a mix of:
    - Technical skills assessment
    - Behavioral/situational questions
    - Company-specific cultural fit questions

    Output EXACTLY this JSON schema:
    {
      "questions": ["string"]
    }

    Rules:
    - Generate exactly the requested number of questions
    - Questions should be realistic and match the experience level
    - Each question should be a complete, well-formed question string
    - Output valid JSON only, no markdown
    """

    user_prompt = f"""
Field: {request.field}
Target Company: {request.company}
Experience Level: {request.experience_level}
Number of Questions: {request.num_questions}
"""

    try:
        response_text = generate_roadmap(system_prompt=system_prompt, user_prompt=user_prompt)
        data = json.loads(response_text)
        return data
    except json.JSONDecodeError:
        logger.error(f"Failed to parse interview questions JSON")
        raise HTTPException(status_code=500, detail="AI returned invalid JSON format.")
    except Exception as e:
        logger.error(f"Error generating interview questions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Evaluate Interview Performance ───────────────────────────────────────────

@router.post("/evaluate")
async def evaluate_interview(request: InterviewEvaluateRequest):
    if not request.interview_data:
        raise HTTPException(status_code=400, detail="Interview data is required")

    qa_text = ""
    for i, qa in enumerate(request.interview_data):
        qa_text += f"""
Question {i+1}: {qa.question}
Answer: {qa.answer}
---
"""

    system_prompt = """
    You are an expert interview performance evaluator.
    You will receive question and answer pairs from a mock interview.

    Generate:
    1. An overall score (0-100)
    2. A detailed justification highlighting general strengths and areas for improvement
    3. Individual constructive feedback for EACH question/answer pair

    Output EXACTLY this JSON schema:
    {
      "overall_score": <integer 0-100>,
      "justification": "<detailed paragraph about overall performance>",
      "feedbacks": [
        {
          "question": "<the question>",
          "answer": "<the user's answer>",
          "feedback": "<constructive feedback for this specific answer>"
        }
      ]
    }

    Rules:
    - Be encouraging but honest
    - Give specific, actionable feedback
    - Score fairly based on the experience level expected
    - Output valid JSON only, no markdown
    """

    user_prompt = f"""
Field: {request.field}
Target Company: {request.company}
Experience Level: {request.experience_level}

Interview Content:
{qa_text}
"""

    try:
        response_text = generate_roadmap(system_prompt=system_prompt, user_prompt=user_prompt)
        data = json.loads(response_text)
        return data
    except json.JSONDecodeError:
        logger.error(f"Failed to parse interview evaluation JSON")
        raise HTTPException(status_code=500, detail="AI returned invalid JSON format.")
    except Exception as e:
        logger.error(f"Error evaluating interview: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
