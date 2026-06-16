# backend/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    DATABASE_URL: str = "postgresql+asyncpg://truthlens:truthlens@localhost:5432/truthlens"

    class Config:
        env_file = "backend/.env"

settings = Settings()
