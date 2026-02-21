import traceback
import logging
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import JSONResponse
from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel

from ai.api.services.pipeline import run_full_pipeline
from ai.api.firebase_helper import get_uid_from_header, get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

class GenerateRoadmapRequest(BaseModel):
    domain: str
    skills: list[str]
    career_goal: str
    knowledge_description: str
    weekly_hours: int
    duration_weeks: int

@router.get("/me")
def get_user_roadmap(authorization: Optional[str] = Header(None)):
    uid = get_uid_from_header(authorization)
    if not uid:
        raise HTTPException(status_code=401, detail="Authorization token required")
    
    try:
        db = get_db()
        doc = db.collection("roadmaps").document(uid).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="No roadmap found")
        return doc.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching roadmap: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch roadmap")

@router.post("/generate")
def generate_roadmap(
    request: GenerateRoadmapRequest,
    authorization: Optional[str] = Header(None)
):
    try:
        # 1️⃣ Run full AI pipeline directly from user profile data
        result = run_full_pipeline(
            domain=request.domain,
            skills=request.skills,
            career_goal=request.career_goal,
            knowledge_description=request.knowledge_description,
            weekly_hours=request.weekly_hours,
            duration_weeks=request.duration_weeks
        )

        # 2️⃣ Save roadmap to Firestore (if user is authenticated)
        uid = get_uid_from_header(authorization)
        if uid:
            try:
                db = get_db()
                roadmap_doc = {
                    "uid": uid,
                    "domain": result.get("domain", request.domain),
                    "roadmap": result.get("roadmap", {}),
                    "google_sheet_url": result.get("google_sheet_url", ""),
                    "weekly_hours": request.weekly_hours,
                    "duration_weeks": request.duration_weeks,
                    "skills": request.skills,
                    "career_goal": request.career_goal,
                    "generatedAt": datetime.now(timezone.utc).isoformat(),
                }
                db.collection("roadmaps").document(uid).set(roadmap_doc)
                print(f"[Firestore] Roadmap saved for uid={uid}")
            except Exception as e:
                # Don't fail the request if saving fails — just log it
                print(f"[Firestore] Warning: failed to save roadmap: {e}")

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Roadmap generation failed: {e}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": f"Roadmap generation failed: {str(e)}"}
        )
