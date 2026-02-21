from fastapi import FastAPI, APIRouter, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
from datetime import datetime, timezone

# Load environment variables from .env file
load_dotenv()

# Initialize Firebase on startup
from ai.api.firebase_helper import init_firebase, get_db, get_uid_from_header
init_firebase()

from ai.api.routes.roadmap import router as roadmap_router
from ai.api.routes.recommendation import router as recommendation_router
from ai.api.routes.quiz import router as quiz_router
from ai.api.routes.youtube_alt import router as youtube_router
from ai.api.routes.interview import router as interview_router
from ai.api.routes.project_eval import router as project_eval_router
from ai.api.routes.profile import router as profile_router

app = FastAPI(
    title="SkillBridgeAI API",
    version="0.2.0"
)

# Allow frontend origins for production and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://frontend-sqconstultants-projects.vercel.app",
        "https://sqconstultants-project.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── API Router (versioned) ──────────────────────────────────────────────────
api_v1 = APIRouter(prefix="/api/v1")

# Include AI routers
api_v1.include_router(recommendation_router)
api_v1.include_router(interview_router, prefix="/ai/interview", tags=["interview"])
api_v1.include_router(project_eval_router, prefix="/ai/project", tags=["project"])
api_v1.include_router(profile_router, prefix="/profile", tags=["profile"])

# Root-level roadmap router (frontend calls /roadmap/generate)
app.include_router(roadmap_router)
app.include_router(quiz_router)
app.include_router(youtube_router)
app.include_router(api_v1)


# ─── User Endpoints ───────────────────────────────────────────────────────────

@app.post("/api/v1/users/me")
async def create_or_get_user(authorization: Optional[str] = Header(None)):
    """
    Called after login. Creates or updates the user profile document in Firestore.
    """
    uid = get_uid_from_header(authorization)
    if not uid:
        raise HTTPException(status_code=401, detail="Authorization token required")

    db = get_db()
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()

    if not user_doc.exists:
        user_data = {
            "uid": uid,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "onboardingCompleted": False,
        }
        user_ref.set(user_data)
        return {"created": True, "data": user_data}

    return {"created": False, "data": user_doc.to_dict()}


@app.get("/api/v1/users/me")
async def get_user(authorization: Optional[str] = Header(None)):
    """Return the current user's Firestore profile."""
    uid = get_uid_from_header(authorization)
    if not uid:
        raise HTTPException(status_code=401, detail="Authorization token required")

    db = get_db()
    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    return doc.to_dict()


# ─── Onboarding Endpoints ─────────────────────────────────────────────────────

class OnboardingData(BaseModel):
    skills: List[str] = []
    interests: List[str] = []
    goals: str = ""
    currentLevel: Optional[str] = "beginner"
    weekly_hours: int = 10
    duration_weeks: int = 16


@app.post("/api/v1/onboarding")
async def save_onboarding(
    data: OnboardingData,
    authorization: Optional[str] = Header(None)
):
    """
    Save student onboarding (skills, interests, goals, schedule) to Firestore.
    """
    uid = get_uid_from_header(authorization)
    if not uid:
        # Graceful fallback: still acknowledge so the frontend proceeds
        return {"status": "success", "message": "Saved locally (no auth token provided)", "uid": None}

    db = get_db()
    payload = data.dict()
    payload["savedAt"] = datetime.now(timezone.utc).isoformat()

    # Save to onboarding collection
    db.collection("onboarding").document(uid).set(payload, merge=True)

    # Mark user as having completed onboarding
    db.collection("users").document(uid).set(
        {"onboardingCompleted": True}, merge=True
    )

    return {"status": "success", "message": "Onboarding data saved", "uid": uid}


@app.get("/api/v1/onboarding")
async def get_onboarding(authorization: Optional[str] = Header(None)):
    """
    Return the student's saved onboarding data so the form can pre-fill.
    """
    uid = get_uid_from_header(authorization)
    if not uid:
        raise HTTPException(status_code=401, detail="Authorization token required")

    db = get_db()
    doc = db.collection("onboarding").document(uid).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="No onboarding data found")
    return doc.to_dict()


# ─── Roadmap Endpoints ────────────────────────────────────────────────────────

@app.get("/api/v1/roadmap")
async def get_saved_roadmap(authorization: Optional[str] = Header(None)):
    """Return the student's last saved roadmap from Firestore."""
    uid = get_uid_from_header(authorization)
    if not uid:
        raise HTTPException(status_code=401, detail="Authorization token required")

    db = get_db()
    doc = db.collection("roadmaps").document(uid).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="No roadmap found")
    return doc.to_dict()


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "healthy", "version": "0.2.0"}
