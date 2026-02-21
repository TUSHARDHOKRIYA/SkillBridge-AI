from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.api.v1.deps import get_current_user
import os
from app.services.user_service import user_service

router = APIRouter()

UPLOAD_DIR = "uploads/syllabi"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_syllabus(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    uid = current_user.get("uid")
    
    # Fetch onboarding data to ensure we have interests, weekly_hours, etc.
    onboarding_data = await user_service.get_onboarding_data(uid)
    if not onboarding_data:
        raise HTTPException(status_code=400, detail="Please complete onboarding before uploading syllabus")

    file_path = os.path.join(UPLOAD_DIR, f"{uid}_{file.filename}")
    
    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # In the future, this is where we call Anish's AI service:
        # ai_response = await call_anish_ai_service(
        #     file_path=file_path,
        #     interests=onboarding_data.get("interests"),
        #     weekly_hours=onboarding_data.get("weekly_hours"),
        #     duration_weeks=onboarding_data.get("duration_weeks")
        # )
        
        return {
            "message": "Syllabus uploaded and roadmap generation triggered",
            "filename": file.filename,
            "onboarding_context": {
                "interests": onboarding_data.get("interests"),
                "weekly_hours": onboarding_data.get("weekly_hours"),
                "duration_weeks": onboarding_data.get("duration_weeks")
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process syllabus: {str(e)}")

@router.get("/status")
async def get_upload_status(current_user: dict = Depends(get_current_user)):
    # This could check if a syllabus has already been uploaded for this user
    return {"status": "ready"}
