from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.firebase import init_firebase

app = FastAPI(title="SkillBridge AI API")

# Initialize Firebase Admin
init_firebase()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to SkillBridge AI API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
