from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.deps import get_current_user
from app.services.user_service import user_service
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class OnboardingData(BaseModel):
    skills: List[str]
    interests: List[str]
    goals: str
    currentLevel: Optional[str] = None
    weekly_hours: int = 5
    duration_weeks: int = 12
    currentStage: Optional[str] = "inputs"
    maxUnlockedStage: Optional[int] = 0

@router.post("")
async def save_onboarding(
    data: OnboardingData, 
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    try:
        saved_data = await user_service.save_onboarding_data(uid, data.dict())
        return {"message": "Onboarding data saved successfully", "data": saved_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
async def get_onboarding(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    data = await user_service.get_onboarding_data(uid)
    if not data:
        raise HTTPException(status_code=404, detail="Onboarding data not found")
    return data

class ProgressUpdate(BaseModel):
    currentStage: Optional[str] = None
    maxUnlockedStage: Optional[int] = None

@router.patch("/progress")
async def update_progress(
    data: ProgressUpdate,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    try:
        updated_data = await user_service.save_onboarding_data(uid, data.dict(exclude_unset=True))
        return {"message": "Progress updated successfully", "data": updated_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
