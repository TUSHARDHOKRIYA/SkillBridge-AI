from pydantic import BaseModel
from typing import List


class RoadmapRequest(BaseModel):
    interests: List[str]
    weekly_hours: int
    duration_weeks: int


class RoadmapResponse(BaseModel):
    domain: str
    readiness_score: float
    google_sheet_url: str
    missing_skills: List[str]
