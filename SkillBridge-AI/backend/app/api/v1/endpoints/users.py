from fastapi import APIRouter, Depends
from app.api.v1.deps import get_current_user
from app.services.user_service import user_service
from datetime import datetime

router = APIRouter()

@router.get("/me")
async def read_user_me(current_user: dict = Depends(get_current_user)):
    """
    Get current logged in user details from Firestore.
    """
    uid = current_user.get("uid")
    user = await user_service.get_user(uid)
    
    if not user:
        # Create user profile if it doesn't exist
        user_data = {
            "uid": uid,
            "email": current_user.get("email"),
            "displayName": current_user.get("name"),
            "photoURL": current_user.get("picture"),
            "createdAt": datetime.utcnow(),
            "onboardingCompleted": False
        }
        user = await user_service.create_or_update_user(uid, user_data)
    
    return user
