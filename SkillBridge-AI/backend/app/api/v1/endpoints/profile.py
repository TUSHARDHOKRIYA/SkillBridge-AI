from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.deps import get_current_user
from app.services.user_service import user_service
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class ProfileUpdate(BaseModel):
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    bio: Optional[str] = None
    goal: Optional[str] = None
    displayName: Optional[str] = None


@router.get("")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    Get full student profile with learning stats.
    Aggregates data from users, onboarding, quiz_results, and video_progress.
    """
    uid = current_user.get("uid")

    # 1. Get user doc
    user = await user_service.get_user(uid)
    if not user:
        user = {
            "uid": uid,
            "email": current_user.get("email"),
            "displayName": current_user.get("name"),
            "photoURL": current_user.get("picture"),
        }

    # 2. Get onboarding data
    onboarding = await user_service.get_onboarding_data(uid)

    # 3. Get learning stats from quiz_results
    db = user_service.db
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
        print(f"[Profile] Stats fetch warning: {e}")

    return {
        "uid": uid,
        "email": user.get("email", current_user.get("email", "")),
        "displayName": user.get("displayName", current_user.get("name", "")),
        "photoURL": user.get("photoURL", current_user.get("picture", "")),
        "createdAt": user.get("createdAt", ""),
        "skills": (onboarding or {}).get("skills", []),
        "interests": (onboarding or {}).get("interests", []),
        "bio": user.get("bio", ""),
        "goal": (onboarding or {}).get("goals", ""),
        "stats": stats,
    }


@router.patch("")
async def update_profile(
    data: ProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update student profile fields."""
    uid = current_user.get("uid")

    user_updates = {}
    onboarding_updates = {}

    update_dict = data.dict(exclude_unset=True)

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
            await user_service.create_or_update_user(uid, user_updates)
        if onboarding_updates:
            await user_service.save_onboarding_data(uid, onboarding_updates)
        return {"status": "updated", "updated_fields": list(update_dict.keys())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
