from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SkillBridge AI"
    FIREBASE_SERVICE_ACCOUNT_PATH: str | None = None
    
    class Config:
        env_file = ".env"

settings = Settings()
