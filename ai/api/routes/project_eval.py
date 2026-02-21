from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
import logging
from ai.roadmap.gemini_client import generate_roadmap

logger = logging.getLogger(__name__)

router = APIRouter()


class ProjectEvalRequest(BaseModel):
    project_title: str
    project_description: str
    requirements: Optional[List[str]] = None
    expected_output: Optional[str] = None
    user_submission: str  # GitHub link or description of what they built


@router.post("/evaluate")
async def evaluate_project(request: ProjectEvalRequest):
    if not request.user_submission.strip():
        raise HTTPException(status_code=400, detail="Submission is required")

    system_prompt = """
    You are an expert software engineering mentor who evaluates student projects.
    
    You will be given:
    1. The project title and description (what they were supposed to build)
    2. The project requirements (specific deliverables)
    3. The expected output
    4. The student's submission (a GitHub link or text description of what they built)
    
    Evaluate the submission against the requirements and provide a structured report.
    Be encouraging but honest. Give specific, actionable feedback.
    
    Output EXACTLY this JSON schema:
    {
      "score": <integer 0-100>,
      "passed": <boolean, true if score >= 60>,
      "grade": "<string: A+/A/B+/B/C+/C/D/F>",
      "summary": "<1-2 sentence overall assessment>",
      "strengths": ["<specific things done well>"],
      "improvements": ["<specific things to improve>"],
      "feedback": "<detailed paragraph of constructive feedback with suggestions>"
    }
    
    Grading scale:
    - A+ (95-100): Exceptional, exceeds all requirements
    - A (85-94): Excellent, meets all requirements with quality
    - B+ (75-84): Good, meets most requirements
    - B (65-74): Satisfactory, meets core requirements
    - C+ (55-64): Needs improvement, partially meets requirements
    - C (45-54): Below expectations
    - D (35-44): Poor
    - F (0-34): Incomplete or missing
    """

    requirements_text = "\n".join(f"- {r}" for r in (request.requirements or []))
    user_prompt = f"""
Project Title: {request.project_title}
Project Description: {request.project_description}
Requirements:
{requirements_text if requirements_text else "No specific requirements listed."}
Expected Output: {request.expected_output or "Not specified."}

Student Submission:
{request.user_submission}
"""

    try:
        response_text = generate_roadmap(system_prompt=system_prompt, user_prompt=user_prompt)
        try:
            data = json.loads(response_text)
            return data
        except json.JSONDecodeError:
            logger.error(f"Failed to parse project eval response. Raw: {response_text}")
            raise HTTPException(status_code=500, detail="AI returned invalid JSON format.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error evaluating project: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
