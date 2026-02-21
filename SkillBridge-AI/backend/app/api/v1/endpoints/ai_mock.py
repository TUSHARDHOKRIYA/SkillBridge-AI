from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.deps import get_current_user
from app.services.user_service import user_service
from pydantic import BaseModel
from typing import List, Optional
import asyncio

router = APIRouter()

class SkillGap(BaseModel):
    fully_covered: List[str]
    partially_covered: List[str]
    missing: List[str]

class RecommendationResponse(BaseModel):
    domain: str
    interest_score: float
    readiness_score: float
    final_score: float
    skill_gap: SkillGap

class Resource(BaseModel):
    title: str
    type: str
    url: str

class WeeklyPlan(BaseModel):
    week: int
    topic: str
    skillsCovered: List[str]
    deliverable: str
    learning_resources: List[Resource]

class Phase(BaseModel):
    phaseName: str
    weeklyPlan: List[WeeklyPlan]

class RoadmapResponse(BaseModel):
    domain: str
    totalDurationWeeks: int
    weeklyHours: int
    phases: List[Phase]
    google_sheet_url: str = "https://docs.google.com/spreadsheets/d/mock"
    missing_skills: List[str]

@router.post("/recommend-domain", response_model=List[RecommendationResponse])
async def recommend_domain(current_user: dict = Depends(get_current_user)):
    # Simulate AI processing time
    await asyncio.sleep(1)
    
    return [
        {
            "domain": "Full Stack Web Development",
            "interest_score": 0.85,
            "readiness_score": 0.4,
            "final_score": 0.67,
            "skill_gap": {
                "fully_covered": ["HTML", "CSS"],
                "partially_covered": ["JavaScript"],
                "missing": ["React", "FastAPI", "PostgreSQL"]
            }
        },
        {
            "domain": "Data Science",
            "interest_score": 0.75,
            "readiness_score": 0.3,
            "final_score": 0.55,
            "skill_gap": {
                "fully_covered": ["Python"],
                "partially_covered": ["Math"],
                "missing": ["Pandas", "Scikit-learn", "SQL"]
            }
        }
    ]

@router.get("/roadmap", response_model=RoadmapResponse)
async def get_roadmap(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    roadmap = await user_service.get_roadmap(uid)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap

@router.post("/generate-roadmap", response_model=RoadmapResponse)
async def generate_roadmap(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    
    # Check if we already have one
    existing = await user_service.get_roadmap(uid)
    if existing:
        return existing

    # Simulate AI processing time
    await asyncio.sleep(2)
    
    roadmap_data = {
        "domain": "Full Stack Web Development",
        "totalDurationWeeks": 12,
        "weeklyHours": 10,
        "phases": [
            {
                "phaseName": "Frontend Foundations",
                "weeklyPlan": [
                    {
                        "week": 1,
                        "topic": "Advanced React Hooks",
                        "skillsCovered": ["React"],
                        "deliverable": "Build a custom hook library",
                        "learning_resources": [
                            {
                                "title": "React Hooks Deep Dive",
                                "type": "video",
                                "url": "https://youtube.com/watch?v=mock1"
                            }
                        ]
                    }
                ]
            },
            {
                "phaseName": "Backend Mastery",
                "weeklyPlan": [
                    {
                        "week": 2,
                        "topic": "FastAPI Dependency Injection",
                        "skillsCovered": ["FastAPI"],
                        "deliverable": "Implement a secure auth middleware",
                        "learning_resources": [
                            {
                                "title": "FastAPI Best Practices",
                                "type": "video",
                                "url": "https://youtube.com/watch?v=mock2"
                            }
                        ]
                    }
                ]
            }
        ],
        "google_sheet_url": "https://docs.google.com/spreadsheets/d/mock-roadmap-123",
        "missing_skills": ["React", "FastAPI", "PostgreSQL"]
    }
    
    await user_service.save_roadmap(uid, roadmap_data)
    return roadmap_data
