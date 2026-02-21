from fastapi import APIRouter
from app.api.v1.endpoints import users, onboarding, syllabus, ai_mock, profile
from ai.api.routes import interview, project_eval

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])
api_router.include_router(syllabus.router, prefix="/syllabus", tags=["syllabus"])
api_router.include_router(ai_mock.router, prefix="/ai", tags=["ai"])
api_router.include_router(interview.router, prefix="/ai/interview", tags=["interview"])
api_router.include_router(project_eval.router, prefix="/ai/project", tags=["project"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])

