from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional
import logging

from ai.api.firebase_helper import get_db, get_uid_from_header

logger = logging.getLogger(__name__)

router = APIRouter()


class ProfileUpdate(BaseModel):
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    bio: Optional[str] = None
    goal: Optional[str] = None
    displayName: Optional[str] = None


@router.get("")
async def get_profile(authorization: Optional[str] = Header(None)):
    """
    Get full student profile with learning stats.
    Aggregates data from users, onboarding, and quiz_results.
    """
    uid = get_uid_from_header(authorization)
    if not uid:
        raise HTTPException(status_code=401, detail="Authorization required")

    db = get_db()

    # 1. User doc
    user_doc = db.collection("users").document(uid).get()
    user = user_doc.to_dict() if user_doc.exists else {"uid": uid}

    # 2. Onboarding data
    onb_doc = db.collection("onboarding").document(uid).get()
    onboarding = onb_doc.to_dict() if onb_doc.exists else {}

    # 3. Learning stats from quiz_results
    stats = {
        "weeksCompleted": 0,
        "quizzesTaken": 0,
        "avgScore": 0,
        "bestScore": 0,
        "totalCorrect": 0,
        "totalQuestions": 0,
        "weeklyScores": [],
    }

    try:
        # Weekly tests
        weekly_docs = db.collection("quiz_results").document(uid)\
            .collection("weekly_tests").stream()
        weekly_scores = []
        passed_count = 0
        for doc in weekly_docs:
            d = doc.to_dict()
            weekly_scores.append({
                "week": doc.id,
                "score": d.get("score", 0),
                "passed": d.get("passed", False),
                "timestamp": d.get("timestamp", ""),
            })
            if d.get("passed"):
                passed_count += 1

        # Video quizzes
        video_docs = db.collection("quiz_results").document(uid)\
            .collection("video_quizzes").stream()
        video_quiz_count = 0
        total_score = 0
        total_correct = 0
        total_questions = 0
        best_score = 0
        for doc in video_docs:
            d = doc.to_dict()
            video_quiz_count += 1
            s = d.get("score", 0)
            total_score += s
            best_score = max(best_score, s)
            total_correct += d.get("correct_answers", 0)
            total_questions += d.get("total_questions", 0)

        all_count = len(weekly_scores) + video_quiz_count
        all_total_score = total_score + sum(ws["score"] for ws in weekly_scores)

        stats["weeksCompleted"] = passed_count
        stats["quizzesTaken"] = all_count
        stats["avgScore"] = round(all_total_score / all_count) if all_count > 0 else 0
        stats["bestScore"] = best_score
        stats["totalCorrect"] = total_correct
        stats["totalQuestions"] = total_questions
        stats["weeklyScores"] = sorted(weekly_scores, key=lambda x: x["week"])
    except Exception as e:
        logger.warning(f"[Profile] Stats fetch warning: {e}")

    return {
        "uid": uid,
        "email": user.get("email", ""),
        "displayName": user.get("displayName", ""),
        "photoURL": user.get("photoURL", ""),
        "createdAt": user.get("createdAt", ""),
        "skills": onboarding.get("skills", []),
        "interests": onboarding.get("interests", []),
        "bio": user.get("bio", ""),
        "goal": onboarding.get("goals", ""),
        "stats": stats,
    }


@router.patch("")
async def update_profile(
    data: ProfileUpdate,
    authorization: Optional[str] = Header(None)
):
    """Update student profile fields."""
    uid = get_uid_from_header(authorization)
    if not uid:
        raise HTTPException(status_code=401, detail="Authorization required")

    db = get_db()
    update_dict = data.dict(exclude_unset=True)

    user_updates = {}
    onboarding_updates = {}

    if "displayName" in update_dict:
        user_updates["displayName"] = update_dict["displayName"]
    if "bio" in update_dict:
        user_updates["bio"] = update_dict["bio"]
    if "skills" in update_dict:
        onboarding_updates["skills"] = update_dict["skills"]
    if "interests" in update_dict:
        onboarding_updates["interests"] = update_dict["interests"]
    if "goal" in update_dict:
        onboarding_updates["goals"] = update_dict["goal"]

    try:
        if user_updates:
            db.collection("users").document(uid).set(user_updates, merge=True)
        if onboarding_updates:
            db.collection("onboarding").document(uid).set(onboarding_updates, merge=True)
        return {"status": "updated", "updated_fields": list(update_dict.keys())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
