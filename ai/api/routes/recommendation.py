from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from ai.domain_recommendation import recommend_domains

router = APIRouter(prefix="/ai", tags=["Recommendation"])

class RecommendationRequest(BaseModel):
    interests: List[str]
    skills: Optional[List[str]] = []

@router.post("/recommend-domain")
async def get_recommendation(request: RecommendationRequest):
    try:
        results = recommend_domains(
            user_interests=request.interests,
            user_skills=request.skills,
            syllabus_score=0.0 # Initial recommendation before syllabus upload has 0 readiness from syllabus
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
